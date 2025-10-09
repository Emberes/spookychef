"use client";

import { useState, useEffect, useCallback } from 'react';
import PersonaHeader from '@/components/PersonaHeader';
import RecipeInputForm from '@/components/RecipeInputForm';
import RecipeDisplayCard from '@/components/RecipeDisplayCard';

interface Persona {
  displayName: string;
  imdbUrl: string;
}

interface Recipe {
  title: string;
  time: string;
  difficulty: string;
  dietTags: string[];
  kcal?: number;
  protein?: number;
  ingredients: string[];
  steps: string[];
  personaLines: string[];
}

export default function Home() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastIngredients, setLastIngredients] = useState<string[]>([]);
  const [lastDiet, setLastDiet] = useState<string[]>([]);
  const [lastAllergies, setLastAllergies] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/persona')
      .then((res) => res.json())
      .then((data) => setPersona(data));
  }, []);

  const handleGenerateRecipe = useCallback(async (ingredients: string[], diet: string[], allergies: string[]) => {
    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);
    setLastIngredients(ingredients);
    setLastDiet(diet);
    setLastAllergies(allergies);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients, diet, allergies, personaName: persona?.displayName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recipe');
      }

      const data = await response.json();
      const generatedRecipeData = data.recipe;

      // Generate image for the recipe
      const imageResponse = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeTitle: generatedRecipeData.title,
          ingredients: generatedRecipeData.ingredients,
          recipeId: generatedRecipeData.title, // Using title as a simple ID for caching
        }),
      });

      let imageUrl: string | undefined;
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageUrl = imageData.imageUrl;
      }

      setGeneratedRecipe({ ...generatedRecipeData, imageUrl });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, [persona]);

  const handleRegenerateRecipe = useCallback(() => {
    if (lastIngredients.length > 0 || lastDiet.length > 0 || lastAllergies.length > 0) {
      handleGenerateRecipe(lastIngredients, lastDiet, lastAllergies);
    } else {
      setError('No previous inputs to regenerate with.');
    }
  }, [lastIngredients, lastDiet, lastAllergies, handleGenerateRecipe]);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-16 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      {persona && <PersonaHeader persona={persona} />}

      <div className="w-full max-w-2xl mt-8">
        {!generatedRecipe && !isLoading && !error && (
          <RecipeInputForm onGenerateRecipe={handleGenerateRecipe} isLoading={isLoading} />
        )}

        {isLoading && (
          <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-lg font-semibold">Generating your spooky recipe...</p>
            <div className="mt-4 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {generatedRecipe && (
          <RecipeDisplayCard recipe={generatedRecipe} onRegenerate={handleRegenerateRecipe} />
        )}
      </div>
    </main>
  );
}