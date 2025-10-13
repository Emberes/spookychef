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
