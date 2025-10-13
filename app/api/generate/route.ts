import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai';
import { GenerateRequestSchema, RecipeResponseSchema } from '@/lib/schema';
import { containsAllergens, violatesDiet } from '@/lib/filters';
import personasData from '@/data/personas_pool_iconic.json';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// JSON Schema for response validation
const recipeResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    personaId: { type: SchemaType.STRING },
    title: { type: SchemaType.STRING },
    imagePrompt: { type: SchemaType.STRING },
    timeMinutes: { type: SchemaType.NUMBER },
    difficulty: { type: SchemaType.STRING, format: "enum" as const, enum: ["lätt", "medel", "svår"] },
    dietTags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    nutrition: {
      type: SchemaType.OBJECT,
      properties: {
        kcal: { type: SchemaType.NUMBER },
        protein_g: { type: SchemaType.NUMBER }
      },
      required: ["kcal", "protein_g"]
    },
    ingredients: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          qty: { type: SchemaType.STRING },
          unit: { type: SchemaType.STRING }
        },
        required: ["name", "qty", "unit"]
      }
    },
    steps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    personaLines: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, maxItems: 1 }
  },
  required: ["personaId", "title", "timeMinutes", "difficulty", "dietTags", "nutrition", "ingredients", "steps", "personaLines"]
};

// Store persona per chatId (in-memory for MVP)
const chatPersonas = new Map<string, typeof personasData[0]>();

function getOrCreatePersona(chatId: string) {
  if (!chatPersonas.has(chatId)) {
    const randomPersona = personasData[Math.floor(Math.random() * personasData.length)];
    chatPersonas.set(chatId, randomPersona);
  }
  return chatPersonas.get(chatId)!;
}

/**
 * Bygg bildURL för recept med Pollinations.ai
 * 
 * NOTE: Bildgenereringsoptimering
 * - Tog bort enhance=true för snabbare generering (~30-50% snabbare)
 * - Optimerad storlek 768x432 för web (bra balans mellan kvalitet och hastighet)
 * - Denna funktion anropas tidigt under streaming så bilden börjar ladda 
 *   medan resten av receptet fortfarande genereras
 */
function buildRecipeImageUrl(
  title: string | undefined, 
  imagePrompt: string | undefined, 
  persona: typeof personasData[0]
): string {
  const movieContext = persona.origin ? `inspired by ${persona.origin}` : '';
  const basePrompt = imagePrompt || `A plate of ${title || 'horror dish'}`;
  const fullPrompt = `${basePrompt}, ${persona.displayName} horror themed dish ${movieContext}, dark moody atmosphere, eerie lighting, cinematic food photography, high quality, professional`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=768&height=432&nologo=true`;
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

  // NOTE: Prompt-optimering - inkludera endast diet/allergier om användaren angett dem
  // Tidigare skrev vi "Diet: none" och "Allergies: none" vilket var onödiga tokens
  // och kunde förvirra modellen. Nu utelämnar vi dessa rader helt om de är tomma.
  const dietText = diet.length > 0 ? `\nDiet: ${diet.join(', ')}` : '';
  const allergiesText = allergies.length > 0 ? `\nAllergies: ${allergies.join(', ')}` : '';

  return `Create horror recipe with: ${ingredientsText}${dietText}${allergiesText}${allergyWarning}

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
        responseMimeType: "application/json",
        responseSchema: recipeResponseSchema,
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

        // NOTE: Retry-logik för robust hantering av Gemini API edge cases
        // Trots att vi använder responseSchema kan Gemini under streaming ibland:
        // 1. Returnera JSON omsluten i markdown (```json...```)
        // 2. Generera ogiltig JSON-struktur (sällsynt)
        // 3. Få tillfälliga API-problem
        // Vi gör därför upp till 2 försök. Markdown rensas bort som säkerhetsnät,
        // och vid misslyckande görs ett nytt API-anrop automatiskt.
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
          attempts++;
          const startTime = Date.now();

          try {
            console.log(`🔄 Attempt ${attempts}/${maxAttempts}...`);
            console.log('📤 Sending request to Gemini API (streaming)...');
            const result = await model.generateContentStream([
              { text: userPrompt }
            ]);
            console.log(`⏱️  First response received after ${Date.now() - startTime}ms`);

            let fullText = '';
            let chunkCount = 0;
            let imageUrlSent = false;

            // Stream chunks as they arrive
            for await (const chunk of result.stream) {
              chunkCount++;
              if (chunkCount === 1) {
                console.log(`📦 First chunk received after ${Date.now() - startTime}ms`);
              }
              const chunkText = chunk.text();
              fullText += chunkText;

              // NOTE: Optimering - skicka bildURL tidigt
              // Om vi kan parsa tillräckligt med JSON för att få title, generera och skicka bildURL
              // Detta låter klienten börja ladda bilden medan resten av receptet streamar
              // Resultat: Bilden syns 2-4 sekunder tidigare (laddas parallellt med JSON-streaming)
              if (!imageUrlSent && fullText.includes('"title"') && fullText.includes('"imagePrompt"')) {
                try {
                  const partialJson = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                  const partial = JSON.parse(partialJson + '}'); // Försök stänga objektet
                  
                  if (partial.title || partial.imagePrompt) {
                    const imageUrl = buildRecipeImageUrl(partial.title, partial.imagePrompt, persona);
                    
                    // Skicka bildURL tidigt så klienten kan börja ladda
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ imageUrl })}\n\n`));
                    imageUrlSent = true;
                    console.log('🖼️  Sent image URL early during streaming');
                  }
                } catch (e) {
                  // Partial parse failed, continue streaming
                }
              }

              // Send chunk to client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`));
            }

            // NOTE: Markdown-rensning som säkerhetsnät
            // responseSchema + responseMimeType: "application/json" SKA garantera ren JSON,
            // men under streaming kan markdown ibland läcka igenom (känd Gemini-bugg).
            // Vi rensar därför bort eventuella ```json och ``` markers innan parsing.
            fullText = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            // Parse and validate the complete response
            const recipeData = JSON.parse(fullText);
            const validatedRecipe = RecipeResponseSchema.parse(recipeData);

            // Debug logging
            console.log('✅ Recipe validated');
            console.log('Steps count:', validatedRecipe.steps?.length || 0);
            if (validatedRecipe.steps?.length > 0) {
              console.log('First step:', validatedRecipe.steps[0].substring(0, 50) + '...');
            }
            console.log(`⏱️  Total time: ${Date.now() - startTime}ms`);

            // Post-validation: check diet and allergen compliance
            const recipeIngredients = validatedRecipe.ingredients.map(i => i.name);

            if (diet.length > 0 && violatesDiet(recipeIngredients, diet)) {
              console.warn('⚠️  Recipe violates diet constraints');
            }

            if (allergies.length > 0 && containsAllergens(recipeIngredients, allergies)) {
              console.warn('⚠️  Recipe contains allergens');
            }

            // Generate image URL using Pollinations.ai
            const imageUrl = buildRecipeImageUrl(validatedRecipe.title, validatedRecipe.imagePrompt, persona);
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
            
            // Success - break out of retry loop
            break;

          } catch (error) {
            console.error(`❌ Attempt ${attempts} failed:`, error);
            
            if (attempts >= maxAttempts) {
              // Final failure - send error to client
              console.error('💥 All attempts failed');
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to generate recipe after multiple attempts' })}\n\n`));
            } else {
              console.log('🔄 Retrying...');
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
