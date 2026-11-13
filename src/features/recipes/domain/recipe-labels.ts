export const RECIPE_LABELS = {
  mainIngredient: [
    'main-beef',
    'main-pork',
    'main-poultry',
    'main-fish',
    'main-seafood',
    'main-eggs',
    'main-tofu-tempeh',
    'main-legumes',
    'main-pasta-noodles',
    'main-rice-grains',
    'main-vegetables',
  ],
  cookingMethod: [
    'method-stovetop',
    'method-oven-roast',
    'method-grill-bbq',
    'method-slow-cooker',
    'method-pressure-cooker',
    'method-air-fryer',
    'method-no-cook',
    'method-sous-vide',
  ],
  dietaryAllergens: [
    'diet-vegetarian',
    'diet-vegan',
    'diet-gluten-free',
    'diet-dairy-free',
    'diet-nut-free',
    'diet-low-carb-keto',
    'diet-high-protein',
  ],
  cuisineRegion: [
    'cuisine-mediterranean',
    'cuisine-italian',
    'cuisine-mexican',
    'cuisine-japanese',
    'cuisine-chinese',
    'cuisine-indian',
    'cuisine-thai',
    'cuisine-french',
    'cuisine-middle-eastern',
    'cuisine-american',
  ],
  mealOccasionEffort: [
    'occasion-weeknight-quick',
    'occasion-meal-prep-freezable',
    'occasion-one-pot',
    'occasion-entertaining-holiday',
    'occasion-kid-friendly',
  ],
} as const;

export type RecipeLabelFacet = keyof typeof RECIPE_LABELS;
export type RecipeLabel = (typeof RECIPE_LABELS)[RecipeLabelFacet][number];

export const RECIPE_LABEL_FACETS: readonly RecipeLabelFacet[] = [
  'mainIngredient',
  'cookingMethod',
  'dietaryAllergens',
  'cuisineRegion',
  'mealOccasionEffort',
];
export const ALL_RECIPE_LABELS: readonly RecipeLabel[] = [
  ...RECIPE_LABELS.mainIngredient,
  ...RECIPE_LABELS.cookingMethod,
  ...RECIPE_LABELS.dietaryAllergens,
  ...RECIPE_LABELS.cuisineRegion,
  ...RECIPE_LABELS.mealOccasionEffort,
];

export function isRecipeLabel(value: unknown): value is RecipeLabel {
  return typeof value === 'string' && ALL_RECIPE_LABELS.some((label) => label === value);
}

export function isValidRecipeLabels(value: unknown): value is readonly RecipeLabel[] | undefined {
  if (value === undefined) return true;
  return Array.isArray(value) && value.every(isRecipeLabel) && new Set(value).size === value.length;
}
