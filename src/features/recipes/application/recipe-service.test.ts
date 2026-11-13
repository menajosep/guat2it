import { fail, ok } from '../../../shared/types/result';
import { extractRecipe } from '../infrastructure/extract-recipe';
import { MAX_SOURCE_BYTES, RecipeService, isSupportedSourceUrl } from './recipe-service';
import type { RecipeExtractor, RecipeStore } from './recipe-ports';

const sourceUrl = 'https://www.directoalpaladar.com/example';
const extract: RecipeExtractor = () =>
  ok({
    title: 'Soup',
    yield: '4',
    ingredients: ['200 g lentils'],
    instructions: 'Cook',
    imageUrl: 'https://example.com/image.jpg',
  });

function service(): { service: RecipeService; store: RecipeStore } {
  const store: RecipeStore = {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(true),
  };
  return { service: new RecipeService(store, extract, () => 'id'), store };
}

describe('source validation', () => {
  it.each([
    'http://www.directoalpaladar.com/x',
    'https://www.directoalpaladar.com.evil.example/x',
    'https://user@www.directoalpaladar.com/x',
    'https://www.directoalpaladar.com:444/x',
    'not a url',
  ])('rejects %s', (url) => {
    expect(isSupportedSourceUrl(url)).toBe(false);
  });
  it('accepts both supported hosts', () => {
    expect(isSupportedSourceUrl(sourceUrl)).toBe(true);
    expect(isSupportedSourceUrl('https://directoalpaladar.com/x')).toBe(true);
  });
});

describe('RecipeService', () => {
  it('imports locally, preserving source and ingredient details', () => {
    expect(service().service.import(sourceUrl, 'source')).toMatchObject({
      ok: true,
      value: {
        sourceUrl,
        title: 'Soup',
        labels: [],
        ingredients: [{ source: '200 g lentils', confirmed: true }],
      },
    });
  });

  it('extracts and parses count quantities from structured recipe data', () => {
    const { store } = service();
    const instance = new RecipeService(store, extractRecipe, () => 'id');
    const pageSource = `<script type="application/ld+json">${JSON.stringify({
      '@type': 'Recipe',
      name: 'Pan',
      recipeIngredient: ['2count Pan de molde', '1count Huevos', '200 g Leche'],
    })}</script>`;

    expect(instance.import(sourceUrl, pageSource)).toMatchObject({
      ok: true,
      value: {
        ingredients: [
          {
            source: '2count Pan de molde',
            name: 'Pan de molde',
            quantity: { amount: '2', unit: 'whole' },
            confirmed: true,
          },
          {
            source: '1count Huevos',
            name: 'Huevos',
            quantity: { amount: '1', unit: 'whole' },
            confirmed: true,
          },
          {
            source: '200 g Leche',
            name: 'Leche',
            quantity: { amount: '200', unit: 'gram' },
            confirmed: true,
          },
        ],
      },
    });
  });

  it('rejects oversized UTF-8 input before extraction', () => {
    const parse = vi.fn(extract);
    const { store } = service();
    const instance = new RecipeService(store, parse, () => 'id');
    expect(instance.import(sourceUrl, 'é'.repeat(MAX_SOURCE_BYTES / 2 + 1))).toEqual({
      ok: false,
      error: 'source-too-large',
    });

    expect(parse).not.toHaveBeenCalled();
  });

  it('validates URLs before downloading and imports the returned source', async () => {
    const { store } = service();
    const read = vi.fn().mockResolvedValue(ok('source'));
    const instance = new RecipeService(store, extract, () => 'id', { read });
    expect(instance.canDownload).toBe(true);
    expect(await instance.importFromUrl('https://example.com')).toEqual({
      ok: false,
      error: 'invalid-url',
    });
    expect(read).not.toHaveBeenCalled();
    expect(await instance.importFromUrl(` ${sourceUrl} `)).toMatchObject({
      ok: true,
      value: { title: 'Soup', sourceUrl },
    });
    expect(read).toHaveBeenCalledWith(sourceUrl);
  });

  it('reports a download error without extracting or saving', async () => {
    const { store } = service();
    const parse = vi.fn(extract);
    const instance = new RecipeService(store, parse, () => 'id', {
      read: vi.fn().mockResolvedValue(fail('network')),
    });
    expect(await instance.importFromUrl(sourceUrl)).toEqual({ ok: false, error: 'network' });
    expect(parse).not.toHaveBeenCalled();
  });

  it('saves only validated drafts', async () => {
    const { service: instance, store } = service();
    const save = vi.spyOn(store, 'save');
    const draft = instance.import(sourceUrl, 'source');
    if (!draft.ok) throw new Error('Expected a draft');
    expect(await instance.save({ ...draft.value, title: '' })).toMatchObject({ ok: false });
    expect(save).not.toHaveBeenCalled();
    expect(await instance.save(draft.value)).toMatchObject({ ok: true, value: { id: 'id' } });
    expect(save).toHaveBeenCalledOnce();
  });

  it('saves and updates selected labels without changing the source URL', async () => {
    const { service: instance, store } = service();
    const imported = instance.import(sourceUrl, 'source');
    if (!imported.ok) throw new Error('Expected an imported draft');
    const labels = ['main-poultry', 'method-oven-roast'] as const;
    const update = vi.spyOn(store, 'update');
    const saved = await instance.save({ ...imported.value, labels });
    expect(saved).toMatchObject({
      ok: true,
      value: { sourceUrl, labels },
    });

    const get = vi.spyOn(store, 'get').mockResolvedValue({
      id: 'id',
      sourceUrl,
      title: 'Soup',
      yield: 4,
      ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' }],
      instructions: 'Cook',
      imageUrl: 'https://example.com/image.jpg',
    });
    const updated = await instance.update('id', { ...imported.value, labels });
    expect(updated).toMatchObject({ ok: true, value: { sourceUrl, labels } });
    expect(get).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ sourceUrl, labels }));
  });

  it('saves and updates the optional recipe category', async () => {
    const { service: instance, store } = service();
    const imported = instance.import(sourceUrl, 'source');
    if (!imported.ok) throw new Error('Expected a draft');
    const saved = await instance.save({ ...imported.value, category: 'desserts' });
    expect(saved).toMatchObject({ ok: true, value: { category: 'desserts' } });

    vi.spyOn(store, 'get').mockResolvedValue({
      id: 'id',
      sourceUrl,
      title: 'Soup',
      category: 'desserts',
      yield: 4,
      ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' }],
      instructions: 'Cook',
      imageUrl: 'https://example.com/image.jpg',
    });
    const update = await instance.update('id', {
      ...imported.value,
      category: 'soups-stews',
    });
    expect(update).toMatchObject({ ok: true, value: { category: 'soups-stews' } });
  });

  it('updates validated recipes while preserving their id and stored source URL', async () => {
    const existing = {
      id: 'recipe-id',
      sourceUrl,
      title: 'Soup',
      yield: 4,
      ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' as const }],
      instructions: 'Cook',
      imageUrl: 'https://example.com/image.jpg',
    };
    const { service: instance, store } = service();
    vi.spyOn(store, 'get').mockResolvedValue(existing);
    const update = vi.spyOn(store, 'update');
    const result = await instance.update('recipe-id', {
      sourceUrl: 'https://example.com/changed-source',
      title: 'Updated soup',
      yield: '2',
      ingredients: [
        {
          source: '',
          name: 'lentils',
          quantity: { amount: '100', unit: 'gram' },
          confirmed: true,
        },
      ],
      instructions: 'Simmer',
      imageUrl: 'https://example.com/new-image.jpg',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        ...existing,
        title: 'Updated soup',
        yield: 2,
        ingredients: [{ name: 'lentils', amount: 100, unit: 'gram' }],
        instructions: 'Simmer',
        imageUrl: 'https://example.com/new-image.jpg',
      },
    });
    expect(update).toHaveBeenCalledWith(result.ok && result.value);

    await instance.update('recipe-id', {
      sourceUrl,
      title: '',
      yield: '2',
      ingredients: [],
      instructions: 'Cook',
      imageUrl: existing.imageUrl,
    });
    expect(update).toHaveBeenCalledOnce();
  });

  it('reports missing recipes before and during update', async () => {
    const { service: instance, store } = service();
    const get = vi.spyOn(store, 'get');
    const update = vi.spyOn(store, 'update');
    const validDraft = {
      sourceUrl,
      title: 'Updated soup',
      yield: '2',
      ingredients: [
        {
          source: '',
          name: 'lentils',
          quantity: { amount: '', unit: undefined },
          confirmed: true,
        },
      ],
      instructions: 'Simmer',
      imageUrl: 'https://example.com/image.jpg',
    };
    expect(await instance.update('missing-id', validDraft)).toEqual({
      ok: false,
      error: 'not-found',
    });
    expect(update).not.toHaveBeenCalled();

    get.mockResolvedValue({
      id: 'recipe-id',
      sourceUrl,
      title: 'Soup',
      yield: 4,
      ingredients: [{ name: 'lentils' }],
      instructions: 'Cook',
      imageUrl: 'https://example.com/image.jpg',
    });
    update.mockResolvedValue(false);
    expect(await instance.update('recipe-id', validDraft)).toEqual({
      ok: false,
      error: 'not-found',
    });
  });

  it('removes an existing recipe and reports when it no longer exists', async () => {
    const remove = vi.fn().mockResolvedValue(true);
    const store: RecipeStore = {
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue(undefined),
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(true),
      remove,
    };
    const instance = new RecipeService(store, extract, () => 'id');
    expect(await instance.remove('recipe-id')).toEqual({ ok: true, value: undefined });
    expect(remove).toHaveBeenCalledWith('recipe-id');

    remove.mockResolvedValue(false);
    expect(await instance.remove('missing-id')).toEqual({ ok: false, error: 'not-found' });
  });
});
