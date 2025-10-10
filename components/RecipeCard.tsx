'use client';

import { RecipeResponse } from '@/lib/schema';
import { Clock, ChefHat, Flame, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: RecipeResponse;
  persona: {
    id: string;
    displayName: string;
    movieImdbUrl: string;
    origin?: string;
  };
  onRegenerate?: () => void;
  onChangeChef?: () => void;
  isRegenerating?: boolean;
}

export default function RecipeCard({ recipe, persona, onRegenerate, onChangeChef, isRegenerating = false }: RecipeCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `
${recipe.title}
Persona: ${persona.displayName}
Tid: ${recipe.timeMinutes} min
Svårighetsgrad: ${recipe.difficulty}

Ingredienser:
${recipe.ingredients.map(ing => `- ${ing.qty} ${ing.unit} ${ing.name}`).join('\n')}

Instruktioner:
${recipe.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Näringsvärde: ${recipe.nutrition.kcal} kcal, ${recipe.nutrition.protein_g}g protein

${recipe.personaLines.length > 0 ? '\n' + recipe.personaLines.join('\n') : ''}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 bg-card rounded-lg border border-border shadow-xl overflow-hidden">
      {/* Persona Header */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">Recept från</h3>
            <h2 className="text-2xl font-bold text-primary">{persona.displayName}</h2>
            {persona.origin && (
              <a 
                href={persona.movieImdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground mt-1 italic hover:text-primary hover:underline transition-colors cursor-pointer inline-block"
              >
                {persona.origin}
              </a>
            )}
          </div>
          <a
            href={persona.movieImdbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-background/50 hover:bg-background border border-border rounded-md transition-colors"
          >
            <span className="text-sm">IMDb</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <h1 className="text-3xl font-bold">{recipe.title}</h1>

        {/* Persona Line - Right under title */}
        {recipe.personaLines.length > 0 && (
          <p className="text-lg italic text-primary -mt-2">
            "{recipe.personaLines[0]}"
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span>{recipe.timeMinutes} minuter</span>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat size={18} className="text-primary" />
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-primary" />
            <span>{recipe.nutrition.kcal} kcal • {recipe.nutrition.protein_g}g protein</span>
          </div>
        </div>

        {/* Diet Tags */}
        {recipe.dietTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.dietTags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Ingredients */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Ingredienser</h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  <strong>{ingredient.qty} {ingredient.unit}</strong> {ingredient.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Instruktioner</h3>
          <ol className="space-y-3">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            <Copy size={18} />
            {copied ? 'Kopierat!' : 'Kopiera recept'}
          </button>
          
          <div className="flex gap-3">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={18} className={isRegenerating ? 'animate-spin' : ''} />
                {isRegenerating ? 'Genererar...' : 'Annat recept'}
              </button>
            )}
            {onChangeChef && (
              <button
                onClick={onChangeChef}
                disabled={isRegenerating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground border border-border rounded-md hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChefHat size={18} />
                {isRegenerating ? 'Byter...' : 'Byt kock'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
