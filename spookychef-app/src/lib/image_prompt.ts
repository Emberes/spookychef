export function buildFoodImagePrompt(recipeTitle: string, ingredients: string[]): string {
  // Basic prompt for food image generation
  // Focus on photo style and avoid horror elements
  return `A high-quality, realistic photograph of a dish named "${recipeTitle}" made with ingredients like ${ingredients.join(', ')}. The image should be appetizing, well-lit, and in a professional food photography style. No scary or horror-themed elements.`;
}
