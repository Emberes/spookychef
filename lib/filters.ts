import { normalizeIngredient } from './normalize';

/**
 * Check if recipe violates dietary restrictions
 */
export function violatesDiet(recipeIngredients: string[], dietTags: string[]): boolean {
  const normalizedIngredients = recipeIngredients.map(normalizeIngredient);
  
  for (const diet of dietTags) {
    switch (diet.toLowerCase()) {
      case 'veg':
      case 'vegetarian':
        if (containsMeat(normalizedIngredients)) return true;
        break;
      case 'vegan':
        if (containsAnimalProducts(normalizedIngredients)) return true;
        break;
      case 'glutenfri':
      case 'gluten-free':
        if (containsGluten(normalizedIngredients)) return true;
        break;
    }
  }
  
  return false;
}

/**
 * Check if recipe contains allergens
 */
export function containsAllergens(recipeIngredients: string[], allergies: string[]): boolean {
  const normalizedIngredients = recipeIngredients.map(normalizeIngredient);
  
  for (const allergen of allergies) {
    const normalizedAllergen = allergen.toLowerCase().trim();
    
    switch (normalizedAllergen) {
      case 'nötter':
      case 'nuts':
        if (normalizedIngredients.some(ing => 
          ing.includes('nöt') || ing.includes('mandel') || ing.includes('cashew') || 
          ing.includes('pistasch') || ing.includes('hassel')
        )) return true;
        break;
      case 'laktos':
      case 'lactose':
      case 'mjölk':
        if (normalizedIngredients.some(ing => 
          ing.includes('mjölk') || ing.includes('grädde') || ing.includes('ost') || 
          ing.includes('smör') || ing.includes('yoghurt')
        )) return true;
        break;
      case 'gluten':
        if (containsGluten(normalizedIngredients)) return true;
        break;
      case 'skaldjur':
      case 'shellfish':
        if (normalizedIngredients.some(ing => 
          ing.includes('räk') || ing.includes('krabba') || ing.includes('hummer') || 
          ing.includes('mussla')
        )) return true;
        break;
      case 'ägg':
      case 'egg':
        if (normalizedIngredients.some(ing => ing.includes('ägg'))) return true;
        break;
    }
  }
  
  return false;
}

function containsMeat(ingredients: string[]): boolean {
  const meatKeywords = ['kött', 'kyckling', 'fläsk', 'nöt', 'kalv', 'lamm', 'fisk', 'lax', 'räk', 'fläskfil'];
  return ingredients.some(ing => meatKeywords.some(meat => ing.includes(meat)));
}

function containsAnimalProducts(ingredients: string[]): boolean {
  const animalKeywords = [
    'kött', 'kyckling', 'fläsk', 'nöt', 'kalv', 'lamm', 
    'fisk', 'lax', 'räk', 'ägg', 'mjölk', 'grädde', 
    'ost', 'smör', 'yoghurt', 'honung'
  ];
  return ingredients.some(ing => animalKeywords.some(animal => ing.includes(animal)));
}

function containsGluten(ingredients: string[]): boolean {
  const glutenKeywords = ['pasta', 'bröd', 'mjöl', 'vete', 'korn', 'råg', 'lasagne', 'taco'];
  return ingredients.some(ing => glutenKeywords.some(gluten => ing.includes(gluten)));
}
