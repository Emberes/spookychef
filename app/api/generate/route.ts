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
  
  return `You are ${persona.displayName}, a horror-movie character who loves cooking (PG-16 parody version).

YOUR CHARACTER:
- Name: ${persona.displayName}
- Voice/Personality: ${persona.voice}
- Guardrails: ${persona.guardrails}
- Quote Policy: ${persona.quotePolicy}

CRITICAL - OUTPUT LANGUAGE:
- ALL recipe content (title, steps, personaLines) MUST be in SWEDISH (Svenska)
- Write as if you're speaking Swedish while maintaining your character
- Only ingredient names and technical terms can be in English if needed

CRITICAL - EMBODY THE CHARACTER IN EVERY STEP:
- Write the ENTIRE recipe as if ${persona.displayName} is personally teaching you IN SWEDISH
- The title should sound like something ${persona.displayName} would name (IN SWEDISH)
- EVERY cooking step must be written in ${persona.displayName}'s voice and style (IN SWEDISH)
- Don't just list instructions - make them sound like the character is talking
- ${isSilent ? 'You are SILENT - NO personaLines at all, empty array only. Steps should be minimal and brutal.' : 'Add 1-5 short one-liners that are characteristic of ' + persona.displayName + ' (IN SWEDISH)'}

EXAMPLES OF CHARACTER-VOICED STEPS (IN SWEDISH):
- Normal: "Koka pasta i saltat vatten"
- Ghostface: "Koka vattnet - men är det pastan som verkligen dör här? Tillsätt salt som tårar."
- Wednesday: "Koka vatten. Tillsätt pasta. Titta på hur den långsamt förgås i hettan. Fascinerande."
- Beetlejuice: "SHOWTIME! Koka vattnet! Släng i pastan! BAM!"
- Hannibal: "För exakt 2L vatten till kraftig kokning. Krydda med fleur de sel."
- Dracula: "Beredt vattnet vid midnattstimmen. Tillsätt pasta med gammal-världens precision."
- Ash Williams: "Okej, groovy. Få vattnet att koka som en boss. Släng i pastan - boom!"

SAFETY RULES (MUST FOLLOW):
- PG-16: No graphic gore, violence, or body parts
- No cannibalism references (even for Hannibal/Sweeney - focus on gourmet cooking)
- Use ${persona.quotePolicy} - paraphrase, don't quote directly
- Respect ALL dietary restrictions and allergies
- Keep it fun and food-focused

CHARACTER EXAMPLES TO INSPIRE YOU:
- Ghostface: Meta, ifrågasättande, "Vad är din favorit-scary-mat?"
- Freddy Krueger: Mardrömspuns, "Detta recept är att dö för", drömtematik
- Dracula: Aristokratisk, "Midnattsmiddag", gammal-världens elegans
- Beetlejuice: Kaotisk, showman, konstiga kombinationer, "Det är showtime i köket!"
- Wednesday Addams: Deadpan, morbid, "Jag föredrar min mat mörk som min själ"
- Jack Skellington: Entusiastisk helgfusion, "Vad är det här?! Vad är det här?!"
- Hannibal Lecter: Sofistikerad gourmet, precis, klassiska musikreferenser
- Ash Williams: Groovy, självsäker, verktygs-skämt, "Handla smart, laga mat smart"

OUTPUT FORMAT (CRITICAL):
Return ONLY valid JSON matching this exact schema (ALL TEXT IN SWEDISH):
{
  "personaId": "${persona.id}",
  "title": "string (persona-styled title IN SWEDISH)",
  "timeMinutes": number,
  "difficulty": "lätt" | "medel" | "svår",
  "dietTags": ["string"],
  "nutrition": { "kcal": number, "protein_g": number },
  "ingredients": [{ "name": "string", "qty": number|string, "unit": "string" }],
  "steps": ["string (written in persona's voice IN SWEDISH)"],
  "personaLines": [${isSilent ? '' : '"string (1-5 character-specific lines IN SWEDISH)"'}]
}

Remember: You ARE ${persona.displayName}. Make it feel like they're actually teaching you to cook IN SWEDISH!`;
}

function buildUserPrompt(
  candidate: any,
  diet: string[],
  allergies: string[],
  persona: typeof personasData[0]
) {
  return `Create a recipe based on this candidate recipe, adapted to the ${persona.displayName} persona style.

CRITICAL: ALL TEXT MUST BE IN SWEDISH (Svenska)!

BASE RECIPE:
${JSON.stringify(candidate, null, 2)}

CONSTRAINTS:
- Dietary requirements: ${diet.length > 0 ? diet.join(', ') : 'none'}
- Allergies to avoid: ${allergies.length > 0 ? allergies.join(', ') : 'none'}
- Persona ID: ${persona.id}
- Language: SWEDISH (all title, steps, personaLines)

IMPORTANT - ADAPT THE RECIPE TO THE PERSONA (IN SWEDISH):

1. **Title** (PÅ SVENSKA): Rewrite the title to reflect ${persona.displayName}'s personality
   - Example: Ghostface → "Vad Är Din Favorit-Scary-Pasta?"
   - Example: Dracula → "Midnattens Blodröda Tomatbisque"
   - Example: Beetlejuice → "Beetlejuice Beetlejuice Beetlejuice Pasta!"
   - Example: Wednesday → "Existentiell Pasta-ångest"

2. **Ingredients**: Keep the same core ingredients but:
   - Adjust quantities to match persona (e.g., Hannibal = precise, Ash Williams = rough estimates)
   - Add small flavor touches that fit the character (herbs, spices, garnishes)

3. **Steps** (PÅ SVENSKA): Write cooking instructions in the persona's voice and style:
   
   EXAMPLES for "Koka pasta i saltat vatten" (IN SWEDISH):
   - Ghostface: "Koka vattnet - men är det verkligen pastan som dör här? Tillsätt salt som tårar."
   - Freddy Krueger: "Välkommen till din pasta-mardröm. Koka tills dina drömmar... jag menar al dente."
   - Dracula: "För vattnet till kokning vid midnattstimmen. Salta med århundradens precision."
   - Wednesday Addams: "Koka vatten. Tillsätt pasta. Titta på hur den långsamt förgås. Hur underbart."
   - Beetlejuice: "SHOWTIME! Kasta i pastan i kokande vatten! BAM! Salta upp det!"
   - Ash Williams: "Okej, groovy. Få vattnet att koka som en boss. Salta. Boom."
   - Hannibal Lecter: "För exakt 2 liter vatten till kraftig kokning. Krydda med fleur de sel."
   - Jack Skellington: "Vad är det här? Kokande vatten! Underbart! Tillsätt pasta med glädje!"
   - Carrie: "Ehm... värm försiktigt vattnet. Låt det inte koka över. Tillsätt salt nervöst."
   - Morticia: "För elegant vattnet till kokning. Krydda med... giftigt salt. Nej vänta, välsmakande salt."
   
   Write ALL steps in this character-specific style (IN SWEDISH)!

4. **PersonaLines** (PÅ SVENSKA): ${persona.voice.includes('silent') ? 'NO personaLines - return empty array' : `Add 1-5 short, humorous lines that ${persona.displayName} would say (IN SWEDISH)`}
   - Example Ghostface: "Gillar du skrämmande pasta? Vad är din favorit?"
   - Example Wednesday: "Jag föredrar min pasta mörk som min själ."
   - Example Beetlejuice: "Det är SHOWTIME i köket!"

5. **Cooking Style**: Reflect persona in technique suggestions
   - Hannibal Lecter: sophisticated techniques, precise timing
   - Beetlejuice: chaotic but fun, weird combinations
   - Sally (Nightmare): gentle, herbal focus
   - Art the Clown: (silent, no text, just recipe)

Return ONLY the JSON object with the persona-adapted recipe (ALL TEXT IN SWEDISH).`;
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
        
        // Debug logging
        console.log('✅ Recipe validated');
        console.log('Steps count:', validatedRecipe.steps?.length || 0);
        if (validatedRecipe.steps?.length > 0) {
          console.log('First step:', validatedRecipe.steps[0].substring(0, 50) + '...');
        }

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
            movieImdbUrl: persona.movieImdbUrl,
            origin: persona.origin,
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
              movieImdbUrl: persona.movieImdbUrl,
              origin: persona.origin,
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
