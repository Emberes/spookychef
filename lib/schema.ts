import { z } from 'zod';

export const RecipeResponseSchema = z.object({
  personaId: z.string(),
  title: z.string(),
  timeMinutes: z.number().positive(),
  difficulty: z.enum(['lätt', 'medel', 'svår']),
  dietTags: z.array(z.string()),
  nutrition: z.object({
    kcal: z.number(),
    protein_g: z.number(),
  }),
  ingredients: z.array(
    z.object({
      name: z.string(),
      qty: z.union([z.number(), z.string()]),
      unit: z.string(),
    })
  ),
  steps: z.array(z.string()),
  personaLines: z.array(z.string()).max(1),
});

export type RecipeResponse = z.infer<typeof RecipeResponseSchema>;

export const SearchRequestSchema = z.object({
  ingredients: z.array(z.string()),
  diet: z.array(z.string()).optional().default([]),
  allergies: z.array(z.string()).optional().default([]),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

export const GenerateRequestSchema = z.object({
  candidate: z.object({
    id: z.string(),
    title: z.string(),
    ingredients: z.array(z.string()),
    tags: z.array(z.string()),
    timeMinutes: z.number(),
    difficulty: z.string(),
    baseNutrition: z.object({
      kcal: z.number(),
      protein_g: z.number(),
    }),
  }),
  userIngredients: z.array(z.string()).optional().default([]),
  chatId: z.string(),
  diet: z.array(z.string()).optional().default([]),
  allergies: z.array(z.string()).optional().default([]),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
