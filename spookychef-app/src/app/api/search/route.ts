import { NextResponse } from 'next/server';
import { normalizeIngredient } from '@/lib/normalize';
import { jaccardSimilarity } from '@/lib/similarity';
import recipes from '@/data/recipes_seed.json';

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  tags: string[];
}

export async function POST(request: Request) {
  const { ingredients, diet, allergies } = await request.json();

  const normalizedIngredients = new Set(ingredients.map(normalizeIngredient));

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

    // Filter by allergies
    if (allergies && allergies.length > 0) {
      if (allergies.some((a: string) => recipe.ingredients.includes(a))) {
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
