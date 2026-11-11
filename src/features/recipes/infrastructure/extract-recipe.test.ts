import { extractRecipe } from './extract-recipe';

function source(value: unknown): string {
  const json = JSON.stringify(value).replaceAll('</', '<\\/');
  return `<html><head><script type="application/ld+json">${json}</script></head></html>`;
}

describe('extractRecipe', () => {
  it('extracts the structured fields used by the example articles', () => {
    expect(
      extractRecipe(
        source({
          '@type': 'Recipe',
          name: 'Example',
          recipeYield: 4,
          recipeIngredient: ['200 g lentils', 'salt'],
          recipeInstructions: '<p>Cook gently.</p><p>Serve.</p>',
          image: 'https://example.com/image.jpg',
        }),
      ),
    ).toEqual({
      ok: true,
      value: {
        title: 'Example',
        yield: '4',
        ingredients: ['200 g lentils', 'salt'],
        instructions: 'Cook gently.\nServe.',
        imageUrl: 'https://example.com/image.jpg',
      },
    });
  });

  it('finds recipes in graphs and preserves ordered instruction steps', () => {
    expect(
      extractRecipe(
        source({
          '@graph': [
            { '@type': 'Article' },
            {
              '@type': ['Thing', 'Recipe'],
              name: 'Other',
              recipeYield: '2',
              recipeIngredient: ['flour'],
              recipeInstructions: [
                { '@type': 'HowToStep', text: 'Mix' },
                { '@type': 'HowToSection', itemListElement: [{ text: 'Bake' }] },
              ],
              image: [{ url: 'https://example.com/other.jpg' }],
            },
          ],
        }),
      ),
    ).toMatchObject({
      ok: true,
      value: { title: 'Other', yield: '2', instructions: 'Mix\nBake' },
    });
  });

  it('ignores malformed JSON and returns an explicit failure without a recipe', () => {
    expect(extractRecipe('<script type="application/ld+json">{bad}</script>')).toEqual({
      ok: false,
      error: 'no-recipe',
    });
  });

  it('does not silently discard unsupported ingredient data', () => {
    expect(
      extractRecipe(
        source({
          '@type': 'Recipe',
          name: 'Example',
          recipeIngredient: ['flour', { name: 'salt' }],
        }),
      ),
    ).toEqual({ ok: false, error: 'no-recipe' });
  });

  it('treats imported markup as inert text', () => {
    const result = extractRecipe(
      source({
        '@type': 'Recipe',
        name: '<img src=x onerror="globalThis.compromised=true">Name',
        recipeInstructions: '<script>globalThis.compromised=true</script><p>Cook</p>',
      }),
    );
    expect(result).toMatchObject({ ok: true, value: { title: 'Name', instructions: 'Cook' } });
    expect('compromised' in globalThis).toBe(false);
  });

  it('handles deeply nested structured data without overflowing the call stack', () => {
    const nested =
      '{"@graph":'.repeat(10000) + '{"@type":"Recipe","name":"Nested"}' + '}'.repeat(10000);
    expect(extractRecipe(`<script type="application/ld+json">${nested}</script>`)).toMatchObject({
      ok: true,
      value: { title: 'Nested' },
    });
  });
});
