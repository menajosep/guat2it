import { useCallback, useEffect, useState } from 'react';
import type { ItemNameError, ShoppingItem } from '../domain/shopping-item';
import { useShoppingListService } from './shopping-list-service-context';

export type LoadStatus = 'loading' | 'ready' | 'error';

export type AddOutcome =
  { status: 'added' } | { status: 'invalid'; error: ItemNameError } | { status: 'failed' };

export interface ShoppingListState {
  items: ShoppingItem[];
  status: LoadStatus;
  /** Latest load or update failure, shown to the user until the next successful operation. */
  errorMessage: string | null;
  reload: () => Promise<void>;
  addItem: (name: string) => Promise<AddOutcome>;
  setCompleted: (id: string, completed: boolean) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function useShoppingList(): ShoppingListState {
  const service = useShoppingListService();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showLoaded = useCallback((loaded: ShoppingItem[]) => {
    setItems(loaded);
    setStatus('ready');
    setErrorMessage(null);
  }, []);

  const showLoadFailure = useCallback((error: unknown) => {
    setStatus('error');
    setErrorMessage(describe(error));
  }, []);

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      showLoaded(await service.list());
    } catch (error) {
      showLoadFailure(error);
    }
  }, [service, showLoaded, showLoadFailure]);

  useEffect(() => {
    let active = true;
    service.list().then(
      (loaded) => {
        if (active) showLoaded(loaded);
      },
      (error: unknown) => {
        if (active) showLoadFailure(error);
      },
    );
    return () => {
      active = false;
    };
  }, [service, showLoaded, showLoadFailure]);

  // Runs a mutation, then re-reads the stored list so the UI always reflects persisted data.
  const mutate = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T | undefined> => {
      try {
        const result = await operation();
        setItems(await service.list());
        setErrorMessage(null);
        return result;
      } catch (error) {
        setErrorMessage(describe(error));
        return undefined;
      }
    },
    [service],
  );

  const addItem = useCallback(
    async (name: string): Promise<AddOutcome> => {
      const result = await mutate(() => service.addItem(name));
      if (!result) return { status: 'failed' };
      return result.ok ? { status: 'added' } : { status: 'invalid', error: result.error };
    },
    [mutate, service],
  );

  const setCompleted = useCallback(
    async (id: string, completed: boolean) => {
      await mutate(() => service.setCompleted(id, completed));
    },
    [mutate, service],
  );

  const removeItem = useCallback(
    async (id: string) => {
      await mutate(() => service.removeItem(id));
    },
    [mutate, service],
  );

  return { items, status, errorMessage, reload, addItem, setCompleted, removeItem };
}
