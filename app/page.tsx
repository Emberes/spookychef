'use client';

import { useState } from 'react';
import RecipeForm from '@/components/RecipeForm';
import RecipeCard from '@/components/RecipeCard';
import RecipeLoadingSkeleton from '@/components/RecipeLoadingSkeleton';
import { RecipeResponse } from '@/lib/schema';

export default function Home() {
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [persona, setPersona] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState(() => Math.random().toString(36).substring(7));
  const [progress, setProgress] = useState<number>(0);
  
  // Store search criteria for regeneration
  const [searchCriteria, setSearchCriteria] = useState<{
    ingredients: string[];
    diet: string[];
    allergies: string[];
  } | null>(null);

  const handleGenerateRecipe = async (
    ingredients: string[],
    diet: string[],
    allergies: string[]
  ) => {
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    setProgress(0);

    try {
      // Store search criteria for regeneration
      setSearchCriteria({ ingredients, diet, allergies });

      // Generate recipe with streaming
      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIngredients: ingredients,
          chatId,
          diet,
          allergies,
        }),
      });

      if (!generateRes.ok) {
        throw new Error('Failed to generate recipe');
      }

      const reader = generateRes.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let totalChunks = 0;
      const estimatedTotalChunks = 100;
      let currentPersona = null;
      let earlyImageUrl = null;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.persona && !currentPersona) {
              // Show persona immediately
              currentPersona = data.persona;
              setPersona(currentPersona);
            }
            
            if (data.imageUrl && !earlyImageUrl) {
              // Store early image URL - will be used when recipe is ready
              earlyImageUrl = data.imageUrl;
            }
            
            if (data.chunk) {
              totalChunks++;
              const newProgress = Math.min(95, (totalChunks / estimatedTotalChunks) * 100);
              setProgress(newProgress);
            }
            
            if (data.done && data.recipe) {
              setProgress(100);
              // NOTE: Använd tidig bildURL om den skickades, annars faller vi tillbaka på receptets URL
              // I praktiken är båda samma (byggt från samma title/imagePrompt), men tidig URL
              // låter bilden börja ladda tidigare vilket ger ~2 sekunder bättre UX.
              // Utan: 4s recept + 2-3s bildladdning = 6-7s totalt
              // Med: 4s recept (bildladdning parallellt) = 4-5s totalt
              const finalRecipe = earlyImageUrl 
                ? { ...data.recipe, imageUrl: earlyImageUrl }
                : data.recipe;
              setRecipe(finalRecipe);
              setPersona(data.recipe.persona);
              setIsLoading(false);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleRegenerate = async () => {
    if (!searchCriteria) return;

    setIsLoading(true);
    setError(null);
    setRecipe(null);
    setProgress(0);

    try {
      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIngredients: searchCriteria.ingredients,
          chatId,
          diet: searchCriteria.diet,
          allergies: searchCriteria.allergies,
        }),
      });

      if (!generateRes.ok) {
        throw new Error('Failed to generate recipe');
      }

      const reader = generateRes.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let totalChunks = 0;
      const estimatedTotalChunks = 100;
      let currentPersona = null;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.persona && !currentPersona) {
              // Update persona if it changed
              currentPersona = data.persona;
              setPersona(currentPersona);
            }
            
            if (data.chunk) {
              totalChunks++;
              const newProgress = Math.min(95, (totalChunks / estimatedTotalChunks) * 100);
              setProgress(newProgress);
            }
            
            if (data.done && data.recipe) {
              setProgress(100);
              setRecipe(data.recipe);
              setPersona(data.recipe.persona);
              setIsLoading(false);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleChangeChef = async () => {
    if (!searchCriteria) return;

    setIsLoading(true);
    setError(null);
    setRecipe(null);
    setProgress(0);

    try {
      // Generate new chatId to get a different persona
      const newChatId = Math.random().toString(36).substring(7);
      setChatId(newChatId);

      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIngredients: searchCriteria.ingredients,
          chatId: newChatId,
          diet: searchCriteria.diet,
          allergies: searchCriteria.allergies,
        }),
      });

      if (!generateRes.ok) {
        throw new Error('Failed to generate recipe');
      }

      const reader = generateRes.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let totalChunks = 0;
      const estimatedTotalChunks = 100;
      let currentPersona = null;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.persona && !currentPersona) {
              // Show new persona immediately
              currentPersona = data.persona;
              setPersona(currentPersona);
            }
            
            if (data.chunk) {
              totalChunks++;
              const newProgress = Math.min(95, (totalChunks / estimatedTotalChunks) * 100);
              setProgress(newProgress);
            }
            
            if (data.done && data.recipe) {
              setProgress(100);
              setRecipe(data.recipe);
              setPersona(data.recipe.persona);
              setIsLoading(false);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
      setProgress(0);
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

        {recipe && persona && !isLoading && (
          <RecipeCard
            recipe={recipe}
            persona={persona}
            onRegenerate={handleRegenerate}
            onChangeChef={handleChangeChef}
            isRegenerating={isLoading}
          />
        )}

        {isLoading && persona && (
          <RecipeLoadingSkeleton
            persona={persona}
            progress={progress}
          />
        )}

        {isLoading && !persona && (
          <div className="mt-8 p-8 bg-card rounded-lg border border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Väljer horror-kock...
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span>Förbereder recept...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
