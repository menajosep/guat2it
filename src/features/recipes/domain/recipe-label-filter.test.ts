import {
  emptyRecipeLabelFilter,
  hasRecipeLabelFilter,
  matchesRecipeLabelFilter,
} from './recipe-label-filter';

describe('recipe label filters', () => {
  it('includes labeled and unlabeled recipes when no values are selected', () => {
    const filter = emptyRecipeLabelFilter();
    expect(matchesRecipeLabelFilter(undefined, filter)).toBe(true);
    expect(matchesRecipeLabelFilter(['main-beef'], filter)).toBe(true);
    expect(hasRecipeLabelFilter(filter)).toBe(false);
  });

  it('matches any selected label within a facet and every selected facet', () => {
    const filter = {
      ...emptyRecipeLabelFilter(),
      mainIngredient: ['main-beef', 'main-poultry'],
      cookingMethod: ['method-oven-roast'],
    } as const;
    expect(matchesRecipeLabelFilter(['main-poultry', 'method-oven-roast'], filter)).toBe(true);
    expect(matchesRecipeLabelFilter(['main-beef'], filter)).toBe(false);
    expect(matchesRecipeLabelFilter(['main-fish', 'method-oven-roast'], filter)).toBe(false);
    expect(hasRecipeLabelFilter(filter)).toBe(true);
  });
});
