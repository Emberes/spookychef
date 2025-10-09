'use client';

import { useState } from 'react';
import RecipeForm from '@/components/RecipeForm';
import RecipeCard from '@/components/RecipeCard';
import { RecipeResponse } from '@/lib/schema';

export default function Home() {
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [persona, setPersona] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId] = useState(() => Math.random().toString(36).substring(7));

  const handleGenerateRecipe = async (
    ingredients: string[],
    diet: string[],
    allergies: string[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Search for candidate
      const searchRes = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, diet, allergies }),
      });

      if (!searchRes.ok) {
        const errorData = await searchRes.json();
        throw new Error(errorData.error || 'Failed to search recipes');
      }

      const { candidate } = await searchRes.json();

      // Step 2: Generate persona-ified recipe
      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate,
          chatId,
          diet,
          allergies,
        }),
      });

      if (!generateRes.ok) {
        const errorData = await generateRes.json();
        throw new Error(errorData.error || 'Failed to generate recipe');
      }

      const recipeData = await generateRes.json();
      setRecipe(recipeData);
      setPersona(recipeData.persona);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-primary">
            🎃 SpookyChef
          </h1>
          <p className="text-lg text-muted-foreground">
            Horror-inspirerade recept baserade på vad du har hemma
          </p>
        </header>

        <RecipeForm
          onSubmit={handleGenerateRecipe}
          isLoading={isLoading}
          disabled={isLoading}
        />

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        {recipe && persona && (
          <RecipeCard
            recipe={recipe}
            persona={persona}
            onRegenerate={() => {
              // Clear recipe to allow regeneration with same ingredients
              setRecipe(null);
            }}
          />
        )}

        {isLoading && (
          <div className="mt-8 p-8 bg-card rounded-lg border border-border">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
