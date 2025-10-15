'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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
  const [pollinationsAvailable, setPollinationsAvailable] = useState<boolean>(true);
  const recipeCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recipeCardRef.current && (recipe || persona || isLoading)) {
      recipeCardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [recipe, persona, isLoading]);
  
  // Store search criteria for regeneration
  const [searchCriteria, setSearchCriteria] = useState<{
    ingredients: string[];
    diet: string[];
    allergies: string[];
  } | null>(null);

  // Check Pollinations health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        console.log('🔍 Checking Pollinations health...');
        const response = await fetch('/api/health/pollinations');
        const data = await response.json();
        console.log('🔍 Health check result:', data);
        setPollinationsAvailable(data.available);
        
        if (!data.available) {
          console.warn('⚠️  Pollinations.ai is not available - images will be disabled');
        } else {
          console.log('✅ Pollinations.ai is available');
        }
      } catch (err) {
        console.error('❌ Failed to check Pollinations health:', err);
        setPollinationsAvailable(false);
      }
    };

    // Initial check
    checkHealth();

    // Recheck every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper: Ta bort imageUrl om den är undefined eller Pollinations inte är tillgänglig
  const sanitizeRecipe = (recipe: RecipeResponse, earlyImageUrl?: string | null): RecipeResponse => {
    console.log('🔍 sanitizeRecipe called:', {
      pollinationsAvailable,
      hasEarlyImageUrl: !!earlyImageUrl,
      hasRecipeImageUrl: !!recipe.imageUrl,
      earlyImageUrl,
      recipeImageUrl: recipe.imageUrl
    });
    
    if (!pollinationsAvailable) {
      console.log('⚠️  Removing imageUrl - Pollinations not available');
      const { imageUrl, ...recipeWithoutImage } = recipe;
      return recipeWithoutImage as RecipeResponse;
    }
    
    const finalImageUrl = earlyImageUrl || recipe.imageUrl;
    if (!finalImageUrl) {
      console.log('⚠️  Removing imageUrl - no URL available');
      const { imageUrl, ...recipeWithoutImage } = recipe;
      return recipeWithoutImage as RecipeResponse;
    }
    
    console.log('✅ Keeping imageUrl:', finalImageUrl);
    return earlyImageUrl ? { ...recipe, imageUrl: earlyImageUrl } : recipe;
  };

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

            if (data.error) {
              throw new Error(data.error);
            }
            
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
              const finalRecipe = sanitizeRecipe(data.recipe, earlyImageUrl);
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

            if (data.error) {
              throw new Error(data.error);
            }
            
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
              // Ta bort imageUrl helt om den är undefined (Pollinations unavailable)
              let finalRecipe = data.recipe;
              if (!finalRecipe.imageUrl) {
                const { imageUrl, ...recipeWithoutImage } = finalRecipe;
                finalRecipe = recipeWithoutImage as typeof finalRecipe;
              }
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

            if (data.error) {
              throw new Error(data.error);
            }
            
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
              // Ta bort imageUrl helt om den är undefined (Pollinations unavailable)
              let finalRecipe = data.recipe;
              if (!finalRecipe.imageUrl) {
                const { imageUrl, ...recipeWithoutImage } = finalRecipe;
                finalRecipe = recipeWithoutImage as typeof finalRecipe;
              }
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl" ref={recipeCardRef}>
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-primary">
            <Image
              src="/spookychef-logo.webp"
              alt="Spooky Chef. Horror i köket - med det du redan har hemma"
              width={540}
              height={180}
              className="mx-auto w-full max-w-[420px]"
              priority
              style={{ height: 'auto' }}
            />
          </h1>
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
            pollinationsAvailable={pollinationsAvailable}
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
