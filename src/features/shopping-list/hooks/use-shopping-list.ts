import { useCallback, useEffect, useRef, useState } from 'react';
import type { ItemNameError, ShoppingItem } from '../domain/shopping-item';
import { FALLBACK_ERROR_MESSAGE, feedbackMessages } from '../messages';
import { useShoppingListService } from './shopping-list-service-context';

export type LoadStatus = 'loading' | 'ready' | 'error';

export type AddOutcome =
  { status: 'added' } | { status: 'invalid'; error: ItemNameError } | { status: 'failed' };

/** `unchanged` means there was nothing to rename (same name, or the item no longer exists). */
export type RenameOutcome =
  | { status: 'renamed' }
  | { status: 'unchanged' }
  | { status: 'invalid'; error: ItemNameError }
  | { status: 'failed' };

export interface Feedback {
  /** Changes with every message so the view can restart its auto-dismiss timer. */
  id: number;
  kind: 'success' | 'error';
  message: string;
}

export interface ShoppingListState {
  items: ShoppingItem[];
  status: LoadStatus;
  /** Latest load failure, shown until the next successful load. */
  errorMessage: string | null;
  /** Outcome of the latest list operation, or null once dismissed. */
  feedback: Feedback | null;
  dismissFeedback: () => void;
  reload: () => Promise<void>;
  addItem: (name: string) => Promise<AddOutcome>;
  setCompleted: (id: string, completed: boolean) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  renameItem: (id: string, name: string) => Promise<RenameOutcome>;
}

type MutationResult<T> = { failed: true } | { failed: false; value: T };

function describe(error: unknown): string {
  return error instanceof Error ? error.message : FALLBACK_ERROR_MESSAGE;
}

export function useShoppingList(): ShoppingListState {
  const service = useShoppingListService();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const feedbackCount = useRef(0);

  const announce = useCallback((kind: Feedback['kind'], message: string) => {
    feedbackCount.current += 1;
    setFeedback({ id: feedbackCount.current, kind, message });
  }, []);

  const dismissFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

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
  // A storage failure is reported to the user as error feedback.
  const mutate = useCallback(
    async <T>(operation: () => Promise<T>): Promise<MutationResult<T>> => {
      try {
        const value = await operation();
        setItems(await service.list());
        return { failed: false, value };
      } catch (error) {
        announce('error', describe(error));
        return { failed: true };
      }
    },
    [service, announce],
  );

  const addItem = useCallback(
    async (name: string): Promise<AddOutcome> => {
      const result = await mutate(() => service.addItem(name));
      if (result.failed) return { status: 'failed' };
      if (!result.value.ok) return { status: 'invalid', error: result.value.error };
      announce('success', feedbackMessages.added(result.value.value.name));
      return { status: 'added' };
    },
    [mutate, service, announce],
  );

  const setCompleted = useCallback(
    async (id: string, completed: boolean) => {
      const result = await mutate(() => service.setCompleted(id, completed));
      if (result.failed || !result.value) return;
      const { name } = result.value;
      announce(
        'success',
        completed ? feedbackMessages.completed(name) : feedbackMessages.reactivated(name),
      );
    },
    [mutate, service, announce],
  );

  const removeItem = useCallback(
    async (id: string) => {
      const result = await mutate(() => service.removeItem(id));
      if (result.failed || !result.value) return;
      announce('success', feedbackMessages.removed(result.value.name));
    },
    [mutate, service, announce],
  );

  const renameItem = useCallback(
    async (id: string, name: string): Promise<RenameOutcome> => {
      const result = await mutate(() => service.renameItem(id, name));
      if (result.failed) return { status: 'failed' };
      if (!result.value.ok) return { status: 'invalid', error: result.value.error };
      const change = result.value.value;
      if (!change) return { status: 'unchanged' };
      announce('success', feedbackMessages.renamed(change.previous.name, change.item.name));
      return { status: 'renamed' };
    },
    [mutate, service, announce],
  );

  return {
    items,
    status,
    errorMessage,
    feedback,
    dismissFeedback,
    reload,
    addItem,
    setCompleted,
    removeItem,
    renameItem,
  };
}
