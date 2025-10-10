import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateRequestSchema, RecipeResponseSchema } from '@/lib/schema';
import { containsAllergens, violatesDiet } from '@/lib/filters';
import personasData from '@/data/personas_pool_iconic.json';

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

  return `You are ${persona.displayName} creating a horror-themed recipe.

Voice: ${persona.voice}
Language: Swedish for recipe, English for persona line
Title format: Sentence case (first word only)
${isSilent
  ? 'ONE dramatic trailer-style voiceover describing the character (e.g., "In a world of shadows, one creature hungers...")'
  : 'ONE persona line in English as spoken by the character'}

IMPORTANT: Each step must be minimum 120 characters long. Write detailed, descriptive instructions in character voice.

Return JSON:
{
  "personaId": "${persona.id}",
  "title": "string (Swedish, sentence case)",
  "imagePrompt": "string (English description for image generation: dish name, main ingredients, horror style)",
  "timeMinutes": number,
  "difficulty": "lätt"|"medel"|"svår",
  "dietTags": ["string"],
  "nutrition": {"kcal": number, "protein_g": number},
  "ingredients": [{"name": "string", "qty": number|string, "unit": "string"}],
  "steps": ["string (Swedish, min 120 chars, in character voice)"],
  "personaLines": ["string (${isSilent ? 'trailer voiceover' : 'character quote'})"]
}`;
}

function buildUserPrompt(
  userIngredients: string[],
  diet: string[],
  allergies: string[],
  persona: typeof personasData[0]
) {
  const ingredientsText = userIngredients.join(', ');
  const isSilent = persona.voice.includes('silent') || persona.guardrails.includes('silent');
  const personaLine = isSilent
    ? 'Add ONE dramatic trailer-style voiceover describing the character.'
    : 'Add ONE English persona line spoken by the character.';
  const allergyWarning = allergies.length > 0
    ? `\n\nCRITICAL - ALLERGIES: User is allergic to ${allergies.join(', ')}. NEVER use these ingredients or derivatives (e.g., if allergic to eggs, avoid mayonnaise). Replace with safe alternatives.`
    : '';

  return `Create horror recipe with: ${ingredientsText}
Diet: ${diet.join(', ') || 'none'}
Allergies: ${allergies.join(', ') || 'none'}${allergyWarning}

Write steps in ${persona.displayName} voice (Swedish).
${personaLine}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIngredients, chatId, diet, allergies } = GenerateRequestSchema.parse(body);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const persona = getOrCreatePersona(chatId);

    console.log('⚡ Generating new recipe from ingredients:', userIngredients);

    const systemPrompt = buildSystemPrompt(persona);
    const userPrompt = buildUserPrompt(userIngredients, diet, allergies, persona);

    console.log('📋 Using systemInstruction:', systemPrompt.substring(0, 100) + '...');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        maxOutputTokens: 4096,
      },
      systemInstruction: systemPrompt,
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send persona information immediately
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          persona: {
            id: persona.id,
            displayName: persona.displayName,
            movieImdbUrl: persona.movieImdbUrl,
            origin: persona.origin,
            imageUrl: persona.imageUrl,
          }
        })}\n\n`));

        let attempts = 0;
        const maxAttempts = 2;
        let success = false;

        while (attempts < maxAttempts && !success) {
          attempts++;
          console.log(`🔄 Attempt ${attempts} starting...`);
          const attemptStartTime = Date.now();

          try {
            console.log('📤 Sending request to Gemini API (streaming)...');
            const result = await model.generateContentStream([
              { text: userPrompt + (attempts > 1 ? '\n\nIMPORTANT: Return ONLY valid JSON, no markdown or extra text!' : '') }
            ]);
            console.log(`⏱️  First response received after ${Date.now() - attemptStartTime}ms`);

            let fullText = '';
            let chunkCount = 0;

            // Stream chunks as they arrive
            for await (const chunk of result.stream) {
              chunkCount++;
              if (chunkCount === 1) {
                console.log(`📦 First chunk received after ${Date.now() - attemptStartTime}ms`);
              }
              const chunkText = chunk.text();
              fullText += chunkText;

              // Send chunk to client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`));
            }

            // Clean up potential markdown formatting
            fullText = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            // Validate the complete response
            const recipeData = JSON.parse(fullText);
            const validatedRecipe = RecipeResponseSchema.parse(recipeData);

            // Debug logging
            console.log('✅ Recipe validated');
            console.log('Steps count:', validatedRecipe.steps?.length || 0);
            if (validatedRecipe.steps?.length > 0) {
              console.log('First step:', validatedRecipe.steps[0].substring(0, 50) + '...');
            }
            console.log(`⏱️  Total attempt time: ${Date.now() - attemptStartTime}ms`);

            // Post-validation: check diet and allergen compliance
            const recipeIngredients = validatedRecipe.ingredients.map(i => i.name);

            if (diet.length > 0 && violatesDiet(recipeIngredients, diet)) {
              console.warn('Recipe violates diet constraints, retrying...');
              throw new Error('Diet violation');
            }

            if (allergies.length > 0 && containsAllergens(recipeIngredients, allergies)) {
              console.warn('Recipe contains allergens, retrying...');
              throw new Error('Allergen violation');
            }

            // Generate image URL using Pollinations.ai
            const movieContext = persona.origin ? `inspired by ${persona.origin}` : '';
            const basePrompt = validatedRecipe.imagePrompt || `A plate of ${validatedRecipe.title}`;
            const imagePrompt = `${basePrompt}, ${persona.displayName} horror themed dish ${movieContext}, dark moody atmosphere, eerie lighting, cinematic food photography, high quality, professional`;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=768&height=432&nologo=true&enhance=true`;
            console.log('🖼️  Generated image URL');

            // Success! Send final complete recipe
            const response = {
              ...validatedRecipe,
              imageUrl,
              persona: {
                id: persona.id,
                displayName: persona.displayName,
                movieImdbUrl: persona.movieImdbUrl,
                origin: persona.origin,
                imageUrl: persona.imageUrl,
              }
            };

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, recipe: response })}\n\n`));
            success = true;

          } catch (parseError) {
            console.error(`Attempt ${attempts} failed:`, parseError);

            if (attempts >= maxAttempts) {
              // Fallback: return simple recipe
              console.log('Using fallback recipe');
              const fallbackResponse = {
                personaId: persona.id,
                title: `${persona.displayName}s hemliga recept`,
                timeMinutes: 30,
                difficulty: 'medel' as const,
                dietTags: diet,
                nutrition: { kcal: 400, protein_g: 15 },
                ingredients: userIngredients.map((name, idx) => ({
                  name,
                  qty: idx === 0 ? 250 : 1,
                  unit: idx === 0 ? 'g' : 'st',
                })),
                steps: [
                  'Förbered alla ingredienser.',
                  'Kombinera ingredienserna enligt din smak.',
                  'Smaka av och servera.',
                ],
                personaLines: [],
                persona: {
                  id: persona.id,
                  displayName: persona.displayName,
                  movieImdbUrl: persona.movieImdbUrl,
                  origin: persona.origin,
                }
              };

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, recipe: fallbackResponse })}\n\n`));
              success = true;
            }
          }
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
}
