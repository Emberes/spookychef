import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';

// Define the schema for a valid recipe, matching the Zod validation in /api/generate
const recipeSchema = z.object({
  title: z.string().min(1),
  time: z.string().min(1),
  difficulty: z.string().min(1),
  dietTags: z.array(z.string()),
  kcal: z.number().optional(),
  protein: z.number().optional(),
  ingredients: z.array(z.string().min(1)),
  steps: z.array(z.string().min(1)),
  personaLines: z.array(z.string()),
});

describe('Golden Prompts for Recipe Generation', () => {
  const goldenPrompts = [
    {
      name: 'Vegetarian pasta with tomatoes',
      ingredients: ['pasta', 'tomatoes', 'garlic'],
      diet: ['vegetarian'],
      allergies: [],
      expected: { dietTags: ['vegetarian'] },
    },
    {
      name: 'Vegan curry with lentils',
      ingredients: ['lentils', 'coconut milk', 'curry powder'],
      diet: ['vegan'],
      allergies: [],
      expected: { dietTags: ['vegan'] },
    },
    {
      name: 'Gluten-free chicken stir-fry',
      ingredients: ['chicken', 'broccoli', 'soy sauce'],
      diet: ['gluten-free'],
      allergies: [],
      expected: { dietTags: ['gluten-free'] },
    },
    {
      name: 'Nut-allergy friendly chocolate cake',
      ingredients: ['flour', 'sugar', 'cocoa'],
      diet: [],
      allergies: ['nuts'],
      expected: { allergies: ['nuts'] }, // Expect no nuts in ingredients
    },
    {
      name: 'Empty pantry surprise',
      ingredients: ['water', 'salt', 'pepper'],
      diet: [],
      allergies: [],
      expected: { ingredients: [] }, // Expect a very simple recipe or a suggestion to buy more
    },
    {
      name: 'Misspelled ingrdeints',
      ingredients: ['potatos', 'carruts', 'onoin'],
      diet: [],
      allergies: [],
      expected: { ingredients: ['potato', 'carrot', 'onion'] }, // Expect normalized ingredients
    },
  ];

  goldenPrompts.forEach((prompt) => {
    it(`should generate a valid recipe for: ${prompt.name}`, async () => {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: prompt.ingredients,
          diet: prompt.diet,
          allergies: prompt.allergies,
          personaName: 'Chef Gordon Ramsay', // Use a consistent persona for testing
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('recipe');

      const recipe = recipeSchema.parse(data.recipe); // Validate against Zod schema

      // Additional assertions based on expected outcomes
      if (prompt.expected.dietTags) {
        prompt.expected.dietTags.forEach(tag => {
          expect(recipe.dietTags).toContain(tag);
        });
      }
      // Add more specific checks for allergies and ingredients if needed
    }, 30000); // Increase timeout for API calls
  });
});
