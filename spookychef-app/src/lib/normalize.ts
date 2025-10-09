import aliases from '@/data/ingredient_aliases.json';

export function normalizeIngredient(name: string): string {
  const trimmed = name.trim().toLowerCase();
  return (aliases as Record<string, string>)[trimmed] || trimmed;
}
