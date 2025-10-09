import ingredientAliases from '@/data/ingredient_aliases.json';

/**
 * Normalize ingredient names using aliases
 */
export function normalizeIngredient(ingredient: string): string {
  const normalized = ingredient.toLowerCase().trim();
  
  // Check if there's an alias for this ingredient
  const aliasMap: Record<string, string> = ingredientAliases;
  return aliasMap[normalized] || normalized;
}

/**
 * Normalize array of ingredients
 */
export function normalizeIngredients(ingredients: string[]): string[] {
  return ingredients.map(normalizeIngredient);
}

/**
 * Calculate weighted Jaccard similarity between two ingredient sets
 */
export function weightedJaccard(userIngredients: string[], recipeIngredients: string[]): number {
  const userSet = new Set(userIngredients.map(normalizeIngredient));
  const recipeSet = new Set(recipeIngredients.map(normalizeIngredient));
  
  const intersection = new Set([...userSet].filter(x => recipeSet.has(x)));
  const union = new Set([...userSet, ...recipeSet]);
  
  if (union.size === 0) return 0;
  
  return intersection.size / union.size;
}
