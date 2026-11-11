import { registerPlugin } from '@capacitor/core';
import { fail, ok, type Result } from '../../../shared/types/result';
import type { RecipeDownloadError, RecipeSourceReader } from '../application/recipe-ports';

export interface RecipePagePlugin {
  download(options: { url: string }): Promise<{ body: string }>;
}

const recipePage = registerPlugin<RecipePagePlugin>('RecipePage');

function isDownloadError(code: unknown): code is RecipeDownloadError {
  return (
    code === 'invalid-url' ||
    code === 'source-too-large' ||
    code === 'network' ||
    code === 'http' ||
    code === 'redirect' ||
    code === 'timeout' ||
    code === 'encoding'
  );
}

export class NativeRecipeSourceReader implements RecipeSourceReader {
  constructor(private readonly plugin: RecipePagePlugin = recipePage) {}

  async read(url: string): Promise<Result<string, RecipeDownloadError>> {
    try {
      const response = await this.plugin.download({ url });
      return ok(response.body);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        isDownloadError(error.code)
      ) {
        return fail(error.code);
      }
      throw error;
    }
  }
}
