import { NextRequest, NextResponse } from 'next/server';
import { SearchRequestSchema } from '@/lib/schema';
import { normalizeIngredients, weightedJaccard } from '@/lib/normalize';
import { violatesDiet, containsAllergens } from '@/lib/filters';
import recipesData from '@/data/recipes_seed.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, diet, allergies } = SearchRequestSchema.parse(body);

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    const normalizedUserIngredients = normalizeIngredients(ingredients);
    
    // Score all recipes
    const scoredRecipes = recipesData
      .map(recipe => ({
        ...recipe,
        score: weightedJaccard(normalizedUserIngredients, recipe.ingredients),
      }))
      .filter(recipe => {
        // Filter out recipes that violate diet or contain allergens
        if (diet.length > 0 && violatesDiet(recipe.ingredients, diet)) {
          return false;
        }
        if (allergies.length > 0 && containsAllergens(recipe.ingredients, allergies)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.score - a.score);

    if (scoredRecipes.length === 0) {
      return NextResponse.json(
        { error: 'No recipes found matching your criteria' },
        { status: 404 }
      );
    }

    const candidate = scoredRecipes[0];
    const candidatesTried = scoredRecipes.slice(0, 3).map(r => r.id);
    
    // Return top 10 candidates for potential regeneration
    const topCandidates = scoredRecipes.slice(0, 10);

    return NextResponse.json({
      candidate,
      candidatesTried,
      allCandidates: topCandidates,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    );
  }
}
