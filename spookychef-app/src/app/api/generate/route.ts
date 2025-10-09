import { NextResponse } from 'next/server';
import { z } from 'zod';
import {GoogleGenerativeAI} from '@google/generative-ai';
import personas from '@/data/personas_pool.json';
import recipes from '@/data/recipes_seed.json';

// Define the Zod schema for the recipe output
const recipeSchema = z.object({
  title: z.string(),
  time: z.string(),
  difficulty: z.string(),
  dietTags: z.array(z.string()),
  kcal: z.number().optional(),
  protein: z.number().optional(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
  personaLines: z.array(z.string()),
});

type Recipe = z.infer<typeof recipeSchema>;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

const SYSTEM_PROMPT_BASE = `You are a spooky chef, inspired by classic horror. Your recipes should be PG-16, parody/inspired in tone, and strictly recipe-only. Do not use direct quotes or catchphrases.`;

export async function POST(request: Request) {
  const { ingredients, diet, allergies, personaName, candidateRecipeId } = await request.json();

  const selectedPersona = personas.find(p => p.displayName === personaName);
  const candidateRecipe = recipes.find(r => r.id === candidateRecipeId);

  let personaPrompt = '';
  if (selectedPersona) {
    personaPrompt = `The chef persona is ${selectedPersona.displayName}. Their IMDb page is ${selectedPersona.imdbUrl}. Their quote policy is ${selectedPersona.quotePolicy}.`;
    if (selectedPersona.preferredIngredients && selectedPersona.preferredIngredients.length > 0) {
      personaPrompt += ` They prefer ingredients like: ${selectedPersona.preferredIngredients.join(', ')}.`;
    }
    if (selectedPersona.dietaryRestrictions && selectedPersona.dietaryRestrictions.length > 0) {
      personaPrompt += ` They have dietary restrictions against: ${selectedPersona.dietaryRestrictions.join(', ')}.`;
    }
  }

  const RECIPE_INTERFACE_SCHEMA = `
interface Recipe {
  title: string;
  time: string; // e.g., "30 minutes", "1 hour"
  difficulty: string; // e.g., "Easy", "Medium", "Hard"
  dietTags: string[]; // e.g., ["Vegetarian", "Gluten-Free"]
  kcal?: number;
  protein?: number;
  ingredients: string[];
  steps: string[];
  personaLines: string[]; // Short, spooky comments from the persona about the recipe
};
`;

  const basePrompt = `
${SYSTEM_PROMPT_BASE}
${personaPrompt}

Based on the following:
Ingredients: ${ingredients.join(', ')}
Dietary needs: ${diet.join(', ')}
Allergies: ${allergies.join(', ')}
Candidate Recipe (for inspiration, if available): ${candidateRecipe ? candidateRecipe.title : 'None'}

Generate a recipe in JSON format according to the following TypeScript interface (convert to JSON):
${RECIPE_INTERFACE_SCHEMA}
`;

  let generatedRecipe: Recipe | null = null;
  let attempts = 0;
  const maxAttempts = 2; // Initial attempt + 1 retry

  const logEntry: any = {
    timestamp: new Date().toISOString(),
    promptVersion: "1.0", // Assuming a simple versioning for the prompt structure
    model: "gemini-pro",
    ingredients: ingredients,
    diet: diet,
    allergies: allergies,
    personaName: personaName,
    responseTimes: [],
    validationErrors: [],
    tokensUsed: {},
  };

  while (attempts < maxAttempts) {
    const requestStartTime = Date.now();
    try {
      const currentPrompt = attempts === 0 ? basePrompt : `${basePrompt}\n\nYour previous response was not valid JSON or did not match the schema. Please provide a valid JSON response according to the schema.`;
      const result = await model.generateContent(currentPrompt);
      const response = await result.response;
      const text = response.text();
      const requestEndTime = Date.now();
      logEntry.responseTimes.push(requestEndTime - requestStartTime);

      // Attempt to get token count (if API provides it)
      // Note: The current @google/generative-ai library might not directly expose token counts for generateContent in a straightforward way.
      // This is a placeholder for future integration if available.
      // For now, we'll just log an empty object or a placeholder.
      logEntry.tokensUsed = response.usageMetadata || {};

      generatedRecipe = recipeSchema.parse(JSON.parse(text));
      logEntry.status = "success";
      console.log("API Log:", JSON.stringify(logEntry));
      break; // Valid JSON, exit loop
    } catch (error) {
      const requestEndTime = Date.now();
      logEntry.responseTimes.push(requestEndTime - requestStartTime);
      if (error instanceof z.ZodError) {
        logEntry.validationErrors.push(error.errors);
        console.error(`Attempt ${attempts + 1} failed to parse or validate generated JSON:`, error);
        attempts++;
      } else {
        logEntry.status = "error";
        logEntry.errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Attempt ${attempts + 1} failed with LLM error:`, error);
        console.log("API Log:", JSON.stringify(logEntry));
        attempts = maxAttempts; // Exit loop on LLM error
      }
    }
  }

  if (generatedRecipe) {
    // Post-checks: Blacklist for known catchphrases in personaLines
    const catchphraseBlacklist = [
      "Here's Johnny!", "I'll be back.", "May the Force be with you.",
      "Live long and prosper.", "Hasta la vista, baby.", "Go ahead, make my day.",
      "I'm your father.", "Bond, James Bond.", "You can't handle the truth!",
      "E.T. phone home.", "Show me the money!", "Houston, we have a problem.",
      "Frankly, my dear, I don't give a damn.", "Here's looking at you, kid.",
      "Of all the gin joints in all the towns in all the world, she walks into mine.",
      "Rosebud.", "I'm gonna make him an offer he can't refuse.",
      "Keep your friends close, but your enemies closer.",
      "Say hello to my little friend!", "Yippie-ki-yay, motherfucker.",
      "Why so serious?", "To infinity and beyond!", "Just keep swimming.",
      "May the odds be ever in your favor.", "I volunteer as tribute.",
      "Winter is coming.", "You know nothing, Jon Snow.",
      "My precious.", "One ring to rule them all.",
      "The first rule of Fight Club is: You do not talk about Fight Club.",
      "What's in the box?!", "I see dead people.", "They're here.",
      "All work and no play makes Jack a dull boy.", "Redrum.",
      "We all go a little mad sometimes.", "A boy's best friend is his mother.",
      "It's alive! It's alive!", "The power of Christ compels you!",
      "Get out!", "They're coming to get you, Barbara!",
      "Here's Johnny!", "I'll be back.", "May the Force be with you."
    ];
    generatedRecipe.personaLines = generatedRecipe.personaLines.filter(line => {
      return !catchphraseBlacklist.some(catchphrase => line.toLowerCase().includes(catchphrase.toLowerCase()));
    });

    // Post-checks: Block unauthorized ingredients based on user input and a general blacklist
    const combinedUnauthorizedIngredients = [
      "poison", "toxic waste", "cyanide", "arsenic", "strychnine", "ricin",
      ...allergies.map((a: string) => a.toLowerCase()),
      ...diet.map((d: string) => d.toLowerCase()) // Assuming diet can also imply ingredients to avoid, e.g., "vegetarian" implies no meat
    ];

    generatedRecipe.ingredients = generatedRecipe.ingredients.filter(ingredient => {
      return !combinedUnauthorizedIngredients.some(unauth => ingredient.toLowerCase().includes(unauth));
    });

    return NextResponse.json({ recipe: generatedRecipe });
  } else {
    // Fallback to candidate recipe
    if (candidateRecipe) {
      // Convert candidateRecipe to match the Recipe interface as much as possible
      const fallbackRecipe: Recipe = {
        title: candidateRecipe.title,
        time: "Unknown", // Default value
        difficulty: "Unknown", // Default value
        dietTags: candidateRecipe.tags, // Use existing tags
        ingredients: candidateRecipe.ingredients,
        steps: ["No detailed steps available for fallback recipe."], // Default value
        personaLines: ["This recipe is a classic, even without my personal touch."], // Default value
      };
      logEntry.status = "fallback";
      console.log("API Log:", JSON.stringify(logEntry));
      return NextResponse.json({ recipe: fallbackRecipe });
    } else {
      logEntry.status = "failure";
      logEntry.errorMessage = "Failed to generate recipe and no candidate available";
      console.log("API Log:", JSON.stringify(logEntry));
      return NextResponse.json({ error: "Failed to generate recipe and no candidate available" }, { status: 500 });
    }
  }
}
