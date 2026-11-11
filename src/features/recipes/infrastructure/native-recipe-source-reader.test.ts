import { NativeRecipeSourceReader, type RecipePagePlugin } from './native-recipe-source-reader';

describe('NativeRecipeSourceReader', () => {
  it('returns the downloaded source', async () => {
    const plugin: RecipePagePlugin = { download: vi.fn().mockResolvedValue({ body: 'html' }) };
    expect(
      await new NativeRecipeSourceReader(plugin).read('https://directoalpaladar.com/x'),
    ).toEqual({
      ok: true,
      value: 'html',
    });
  });

  it.each([
    'invalid-url',
    'source-too-large',
    'network',
    'http',
    'redirect',
    'timeout',
    'encoding',
  ])('reports a native %s failure', async (code) => {
    const plugin: RecipePagePlugin = { download: vi.fn().mockRejectedValue({ code }) };
    expect(
      await new NativeRecipeSourceReader(plugin).read('https://directoalpaladar.com/x'),
    ).toEqual({
      ok: false,
      error: code,
    });
  });

  it('propagates unexpected plugin errors', async () => {
    const failure = new Error('plugin missing');
    const plugin: RecipePagePlugin = { download: vi.fn().mockRejectedValue(failure) };
    await expect(
      new NativeRecipeSourceReader(plugin).read('https://directoalpaladar.com/x'),
    ).rejects.toBe(failure);
  });
});
