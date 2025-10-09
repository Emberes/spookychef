"use client";

import React from 'react';

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

interface RecipeDisplayCardProps {
  recipe: Recipe;
  onRegenerate: () => void;
}

const RecipeDisplayCard: React.FC<RecipeDisplayCardProps> = ({ recipe, onRegenerate }) => {
  const handleCopyRecipe = () => {
    const recipeText = `
Title: ${recipe.title}
Time: ${recipe.time}
Difficulty: ${recipe.difficulty}
Diet Tags: ${recipe.dietTags.join(', ')}
${recipe.kcal ? `Kcal: ${recipe.kcal}` : ''}
${recipe.protein ? `Protein: ${recipe.protein}` : ''}

Ingredients:
${recipe.ingredients.map(ing => `- ${ing}`).join('\n')}

Steps:
${recipe.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

Persona Says:
${recipe.personaLines.map(line => `- ${line}`).join('\n')}
    `;
    navigator.clipboard.writeText(recipeText);
    alert('Recipe copied to clipboard!');
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{recipe.title}</h2>
      <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
        <span>Time: {recipe.time}</span>
        <span>•</span>
        <span>Difficulty: {recipe.difficulty}</span>
        {recipe.kcal && (
          <>
            <span>•</span>
            <span>Kcal: {recipe.kcal}</span>
          </>
        )}
        {recipe.protein && (
          <>
            <span>•</span>
            <span>Protein: {recipe.protein}</span>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {recipe.dietTags.map((tag, index) => (
          <span key={index} className="px-3 py-1 bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-200 rounded-full text-xs font-medium">
            {tag}
          </span>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Ingredients</h3>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-200">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Steps</h3>
        <ol className="list-decimal list-inside text-gray-700 dark:text-gray-200">
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      {recipe.personaLines && recipe.personaLines.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Persona Says:</h3>
          <div className="italic text-gray-600 dark:text-gray-300 space-y-1">
            {recipe.personaLines.map((line, index) => (
              <p key={index}>- {line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-4 mt-6">
        <button
          onClick={onRegenerate}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Generate Again
        </button>
        <button
          onClick={handleCopyRecipe}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Copy Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeDisplayCard;
