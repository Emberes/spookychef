import { NextResponse } from 'next/server';
import { normalizeIngredient } from '@/lib/normalize';
import { jaccardSimilarity } from '@/lib/similarity';
import recipes from '@/data/recipes_seed.json';
import personas from '@/data/personas_pool.json';

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  tags: string[];
}

interface Persona {
  displayName: string;
  imdbUrl: string;
  quotePolicy: string;
  preferredIngredients: string[];
  dietaryRestrictions: string[];
}

export async function POST(request: Request) {
  const { ingredients, diet, allergies, personaName } = await request.json();

  let combinedIngredients = ingredients;
  let combinedAllergies = allergies || [];

  if (personaName) {
    const selectedPersona = personas.find(p => p.displayName === personaName) as Persona;
    if (selectedPersona) {
      combinedIngredients = [...ingredients, ...selectedPersona.preferredIngredients];
      combinedAllergies = [...combinedAllergies, ...selectedPersona.dietaryRestrictions];
    }
  }

  const normalizedIngredients = new Set(combinedIngredients.map(normalizeIngredient));

  let bestMatch: Recipe | null = null;
  let maxSimilarity = -1;
  const candidatesTried: string[] = [];

  for (const recipe of recipes) {
    candidatesTried.push(recipe.id);

    // Filter by diet
    if (diet && diet.length > 0) {
      if (!diet.every((d: string) => recipe.tags.includes(d))) {
        continue;
      }
    }

    // Filter by allergies (including persona's dietary restrictions)
    if (combinedAllergies && combinedAllergies.length > 0) {
      if (combinedAllergies.some((a: string) => recipe.ingredients.includes(a))) {
        continue;
      }
    }

    const recipeIngredients = new Set(recipe.ingredients.map(normalizeIngredient));
    const similarity = jaccardSimilarity(normalizedIngredients, recipeIngredients);

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = recipe;
    }
  }

  return NextResponse.json({ 
    candidate: bestMatch,
    candidatesTried,
  });
}
