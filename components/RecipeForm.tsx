'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeFormProps {
  onSubmit: (ingredients: string[], diet: string[], allergies: string[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const DIET_OPTIONS = ['veg', 'vegan', 'glutenfri'];
const ALLERGY_OPTIONS = ['nötter', 'laktos', 'gluten', 'skaldjur', 'ägg'];

export default function RecipeForm({ onSubmit, isLoading, disabled }: RecipeFormProps) {
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [diet, setDiet] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const items = ingredientInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (items.length > 0) {
      setIngredients(prev => [...new Set([...prev, ...items])]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const toggleDiet = (option: string) => {
    setDiet(prev =>
      prev.includes(option) ? prev.filter(d => d !== option) : [...prev, option]
    );
  };

  const toggleAllergy = (option: string) => {
    setAllergies(prev =>
      prev.includes(option) ? prev.filter(a => a !== option) : [...prev, option]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.length === 0) return;
    onSubmit(ingredients, diet, allergies);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border shadow-lg">
      <div className="space-y-6">
        {/* Ingredients Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Ingredienser (separera med kommatecken)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddIngredient(e);
                }
              }}
              placeholder="t.ex. pasta, tomat, vitlök"
              className="flex-1 px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleAddIngredient}
              disabled={disabled || !ingredientInput.trim()}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lägg till
            </button>
          </div>
          
          {/* Ingredient chips */}
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {ingredients.map(ingredient => (
                <span
                  key={ingredient}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                >
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ingredient)}
                    disabled={disabled}
                    className="hover:bg-primary/30 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Diet Options */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Kosthållning (valfritt)
          </label>
          <div className="flex flex-wrap gap-2">
            {DIET_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => toggleDiet(option)}
                disabled={disabled}
                className={cn(
                  "px-4 py-2 rounded-md border transition-colors",
                  diet.includes(option)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-accent"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Allergy Options */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Allergier (valfritt)
          </label>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => toggleAllergy(option)}
                disabled={disabled}
                className={cn(
                  "px-4 py-2 rounded-md border transition-colors",
                  allergies.includes(option)
                    ? "bg-destructive text-destructive-foreground border-destructive"
                    : "bg-background border-border hover:bg-accent"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={disabled || ingredients.length === 0}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Genererar recept...' : 'Generera recept'}
        </button>
      </div>
    </form>
  );
}
