import { RECIPE_LABEL_FACETS, type RecipeLabel, type RecipeLabelFacet } from './recipe-labels';

export type RecipeLabelFilter = Readonly<Record<RecipeLabelFacet, readonly RecipeLabel[]>>;

export function emptyRecipeLabelFilter(): RecipeLabelFilter {
  return {
    mainIngredient: [],
    cookingMethod: [],
    dietaryAllergens: [],
    cuisineRegion: [],
    mealOccasionEffort: [],
  };
}

export function matchesRecipeLabelFilter(
  recipeLabels: readonly RecipeLabel[] | undefined,
  filter: RecipeLabelFilter,
): boolean {
  const labels = recipeLabels ?? [];
  return RECIPE_LABEL_FACETS.every((facet) => {
    const selected = filter[facet];
    return selected.length === 0 || selected.some((label) => labels.includes(label));
  });
}

export function hasRecipeLabelFilter(filter: RecipeLabelFilter): boolean {
  return RECIPE_LABEL_FACETS.some((facet) => filter[facet].length > 0);
}
