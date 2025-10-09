"use client";

import React, { useState } from 'react';

interface RecipeInputFormProps {
  onGenerateRecipe: (ingredients: string[], diet: string[], allergies: string[]) => void;
  isLoading: boolean;
}

const RecipeInputForm: React.FC<RecipeInputFormProps> = ({ onGenerateRecipe, isLoading }) => {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [dietInput, setDietInput] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ingredients = ingredientsInput.split(',').map(item => item.trim()).filter(item => item !== '');
    const diet = dietInput.split(',').map(item => item.trim()).filter(item => item !== '');
    const allergies = allergiesInput.split(',').map(item => item.trim()).filter(item => item !== '');
    onGenerateRecipe(ingredients, diet, allergies);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <div>
        <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Ingredients (comma-separated):
        </label>
        <input
          type="text"
          id="ingredients"
          value={ingredientsInput}
          onChange={(e) => setIngredientsInput(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., garlic, tomatoes, pasta"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="diet" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Dietary needs (comma-separated, e.g., Vegetarian, Vegan):
        </label>
        <input
          type="text"
          id="diet"
          value={dietInput}
          onChange={(e) => setDietInput(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Vegetarian, Gluten-Free"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Allergies (comma-separated, e.g., Peanuts, Dairy):
        </label>
        <input
          type="text"
          id="allergies"
          value={allergiesInput}
          onChange={(e) => setAllergiesInput(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Peanuts, Shellfish"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate Spooky Recipe'}
      </button>
    </form>
  );
};

export default RecipeInputForm;
