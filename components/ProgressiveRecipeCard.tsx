'use client';

import { Clock, ChefHat, Flame, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProgressiveRecipeCardProps {
  persona: {
    id: string;
    displayName: string;
    movieImdbUrl: string;
    origin?: string;
    imageUrl?: string;
  };
  progress: number;
}

const preparationSteps = [
  'arbetar på receptet...',
  'hämtar ingredienser från skafferiet...',
  'förbereder arbetsbänken...',
  'tvättar händerna noggrant...',
  'vässar knivarna...',
  'sätter på förklädet...',
  'värmer upp spisen...',
  'plockar fram redskap...',
  'förbereder mise en place...',
];

export default function ProgressiveRecipeCard({ persona, progress }: ProgressiveRecipeCardProps) {
  const [showPersona, setShowPersona] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(0);

  useEffect(() => {
    // Progressively reveal sections with slight delays (doubled timing)
    const timer1 = setTimeout(() => setShowPersona(true), 400);
    const timer2 = setTimeout(() => setShowTitle(true), 1600);
    const timer3 = setTimeout(() => setShowMeta(true), 2800);
    const timer4 = setTimeout(() => setShowIngredients(true), 4000);
    const timer5 = setTimeout(() => setShowSteps(true), 5200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  useEffect(() => {
    // Cycle through preparation steps every 1.5 seconds continuously
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % preparationSteps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 bg-card rounded-lg border border-border shadow-xl overflow-hidden">
      {/* Persona Header */}
      <div 
        className={`bg-gradient-to-r from-primary/20 to-primary/5 p-6 border-b border-border transition-opacity duration-500 ${
          showPersona ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {persona.imageUrl && (
              <img 
                src={persona.imageUrl} 
                alt={persona.displayName}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
              />
            )}
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

      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {progress < 95 ? 'Skapar recept...' : 'Avslutar...'}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          <span>
            {`${persona.displayName} ${preparationSteps[currentActivity]}`}
          </span>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-6 space-y-6">
        {/* Title Skeleton */}
        <div 
          className={`transition-opacity duration-500 ${
            showTitle ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="h-9 bg-muted rounded w-3/4 animate-pulse"></div>
        </div>

        {/* Meta Info Skeleton */}
        <div 
          className={`transition-opacity duration-500 ${
            showMeta ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              <div className="h-5 bg-muted rounded w-20 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat size={18} className="text-primary" />
              <div className="h-5 bg-muted rounded w-16 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-primary" />
              <div className="h-5 bg-muted rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Ingredients Skeleton */}
        <div 
          className={`transition-opacity duration-500 ${
            showIngredients ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h3 className="text-xl font-semibold mb-3">Ingredienser</h3>
          <ul className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <div className="h-5 bg-muted rounded flex-1 animate-pulse" style={{ width: `${60 + i * 5}%` }}></div>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions Skeleton */}
        <div 
          className={`transition-opacity duration-500 ${
            showSteps ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h3 className="text-xl font-semibold mb-3">Instruktioner</h3>
          <ol className="space-y-3">
            {[1, 2, 3, 4].map((idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {idx}
                </span>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded animate-pulse"></div>
                  {idx % 2 === 0 && <div className="h-5 bg-muted rounded w-3/4 animate-pulse"></div>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
