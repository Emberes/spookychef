import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateRequestSchema, RecipeResponseSchema } from '@/lib/schema';
import { containsAllergens, violatesDiet } from '@/lib/filters';
import personasData from '@/data/personas_pool.json';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Store persona per chatId (in-memory for MVP)
const chatPersonas = new Map<string, typeof personasData[0]>();

function getOrCreatePersona(chatId: string) {
  if (!chatPersonas.has(chatId)) {
    const randomPersona = personasData[Math.floor(Math.random() * personasData.length)];
    chatPersonas.set(chatId, randomPersona);
  }
  return chatPersonas.get(chatId)!;
}

function buildSystemPrompt(persona: typeof personasData[0]) {
  const isSilent = persona.voice.includes('silent') || persona.guardrails.includes('silent');
  
  return `You are a culinary assistant speaking in a horror-movie-inspired PARODY voice (PG-16).

PERSONA: ${persona.displayName}
VOICE: ${persona.voice}
GUARDRAILS: ${persona.guardrails}

SAFETY RULES:
- No graphic gore or violence descriptions
- No references to body parts or cannibalism
- No direct quotes or trademarked catchphrases (use ${persona.quotePolicy} approach)
- Respect all dietary restrictions and allergies strictly
- Focus ONLY on the recipe - no stage directions, no stories

STYLE:
${isSilent ? '- This persona is SILENT: provide NO personaLines, empty array only' : '- Keep personaLines short (max 5), humorous, and food-focused'}
- Recipe must be realistic and cookable
- Provide accurate measurements and timing

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema (no markdown, no extra text):
{
  "personaId": "string",
  "title": "string",
  "timeMinutes": number (positive),
  "difficulty": "lätt" | "medel" | "svår",
  "dietTags": ["string"],
  "nutrition": { "kcal": number, "protein_g": number },
  "ingredients": [{ "name": "string", "qty": number|string, "unit": "string" }],
  "steps": ["string"],
  "personaLines": ["string"] (max 5, or empty array if silent)
}`;
}

function buildUserPrompt(
  candidate: any,
  diet: string[],
  allergies: string[],
  persona: typeof personasData[0]
) {
  return `Create a recipe based on this candidate recipe, adapted to the persona style:

BASE RECIPE:
${JSON.stringify(candidate, null, 2)}

CONSTRAINTS:
- Dietary requirements: ${diet.length > 0 ? diet.join(', ') : 'none'}
- Allergies to avoid: ${allergies.length > 0 ? allergies.join(', ') : 'none'}
- Persona ID: ${persona.id}

INSTRUCTIONS:
1. Create a ${persona.displayName}-inspired version of this recipe
2. Keep it realistic and cookable
3. Ensure all dietary requirements and allergies are respected
4. Provide realistic ingredient quantities and cooking steps
5. ${persona.voice.includes('silent') ? 'NO personaLines - return empty array' : 'Add 1-5 short, humorous personaLines that fit the persona'}
6. Return ONLY the JSON object, no other text`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidate, chatId, diet, allergies } = GenerateRequestSchema.parse(body);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const persona = getOrCreatePersona(chatId);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = buildSystemPrompt(persona);
    const userPrompt = buildUserPrompt(candidate, diet, allergies, persona);

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const result = await model.generateContent([
          { text: systemPrompt },
          { text: userPrompt + (attempts > 1 ? '\n\nIMPORTANT: Return ONLY valid JSON, no markdown or extra text!' : '') }
        ]);

        const response = await result.response;
        let text = response.text();

        // Clean up potential markdown formatting
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const recipeData = JSON.parse(text);
        const validatedRecipe = RecipeResponseSchema.parse(recipeData);

        // Post-validation: check diet and allergen compliance
        const recipeIngredients = validatedRecipe.ingredients.map(i => i.name);
        
        if (diet.length > 0 && violatesDiet(recipeIngredients, diet)) {
          console.warn('Recipe violates diet constraints, using fallback');
          throw new Error('Diet violation');
        }

        if (allergies.length > 0 && containsAllergens(recipeIngredients, allergies)) {
          console.warn('Recipe contains allergens, using fallback');
          throw new Error('Allergen violation');
        }

        // Success!
        return NextResponse.json({
          ...validatedRecipe,
          persona: {
            id: persona.id,
            displayName: persona.displayName,
            imdbUrl: persona.imdbUrl,
          }
        });

      } catch (parseError) {
        console.error(`Attempt ${attempts} failed:`, parseError);
        
        if (attempts >= maxAttempts) {
          // Fallback: return baseline candidate without persona twist
          console.log('Using fallback recipe');
          return NextResponse.json({
            personaId: persona.id,
            title: candidate.title,
            timeMinutes: candidate.timeMinutes,
            difficulty: candidate.difficulty,
            dietTags: candidate.tags,
            nutrition: candidate.baseNutrition,
            ingredients: candidate.ingredients.map((name: string, idx: number) => ({
              name,
              qty: idx === 0 ? 250 : 1,
              unit: idx === 0 ? 'g' : 'st',
            })),
            steps: [
              'Förbered alla ingredienser.',
              'Följ grundreceptet för bästa resultat.',
              'Smaka av och servera.',
            ],
            personaLines: [],
            persona: {
              id: persona.id,
              displayName: persona.displayName,
              imdbUrl: persona.imdbUrl,
            }
          });
        }
      }
    }

    // Should not reach here, but just in case
    return NextResponse.json(
      { error: 'Failed to generate recipe after retries' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
}
