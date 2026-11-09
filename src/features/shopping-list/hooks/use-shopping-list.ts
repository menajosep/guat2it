import { useCallback, useMemo, useRef, useState } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import type { Category, CategoryNameError } from '../domain/category';
import { EMPTY_QUANTITY_DRAFT, type QuantityDraft } from '../domain/quantity';
import type { ItemErrors, ShoppingItem } from '../domain/shopping-item';
import type { ShoppingListMessages } from '../messages';
import { useShoppingListService } from './shopping-list-service-context';
import { useShoppingListMessages } from './use-shopping-list-messages';

export type LoadStatus = 'loading' | 'ready' | 'error';

export type AddOutcome =
  { status: 'added' } | { status: 'invalid'; errors: ItemErrors } | { status: 'failed' };

/** `unchanged` means there was nothing to update (same details, or the item no longer exists). */
export type UpdateOutcome =
  | { status: 'updated' }
  | { status: 'unchanged' }
  | { status: 'invalid'; errors: ItemErrors }
  | { status: 'failed' };

export interface Feedback {
  /** Changes with every message so the view can restart its auto-dismiss timer. */
  id: number;
  kind: 'success' | 'error';
  message: string;
}

export interface ShoppingListState {
  items: ShoppingItem[];
  categories: Category[];
  status: LoadStatus;
  /** Latest load failure, shown until the next successful load. */
  errorMessage: string | null;
  /** Outcome of the latest list operation, or null once dismissed. */
  feedback: Feedback | null;
  dismissFeedback: () => void;
  reload: () => Promise<void>;
  addItem: (
    name: string,
    quantity?: QuantityDraft,
    categoryIds?: readonly string[],
  ) => Promise<AddOutcome>;
  setCompleted: (id: string, completed: boolean) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (
    id: string,
    name: string,
    quantity: QuantityDraft,
    categoryIds?: readonly string[],
  ) => Promise<UpdateOutcome>;
  clearCompleted: () => Promise<void>;
  createCategory: (name: string) => Promise<CategoryOutcome>;
  renameCategory: (id: string, name: string) => Promise<CategoryOutcome>;
  deleteCategory: (id: string) => Promise<CategoryOutcome>;
}

export type CategoryOutcome =
  | { status: 'saved' | 'unchanged' | 'failed' }
  | { status: 'invalid'; error: CategoryNameError | 'in-use' };

type MutationResult<T> = { failed: true } | { failed: false; value: T };

type MessageText = (messages: ShoppingListMessages) => string;

/** Words an error in the user's language; storage failures are translated, others keep their text. */
function describe(error: unknown): MessageText {
  return (messages) => {
    if (error instanceof PersistenceError && error.action !== undefined) {
      return messages.storageFailures[error.action];
    }
    return error instanceof Error ? error.message : messages.fallbackError;
  };
}

/**
 * A feedback message kept as a text builder rather than a string, so that it can be shown in
 * another language if the user switches language while it is visible.
 */
interface FeedbackSource {
  id: number;
  kind: Feedback['kind'];
  text: MessageText;
}

export function useShoppingList(): ShoppingListState {
  const service = useShoppingListService();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const messages = useShoppingListMessages();
  const [loadFailure, setLoadFailure] = useState<MessageText | null>(null);
  const [feedbackSource, setFeedbackSource] = useState<FeedbackSource | null>(null);
  const feedbackCount = useRef(0);

  const errorMessage = loadFailure ? loadFailure(messages) : null;
  const feedback = useMemo<Feedback | null>(
    () =>
      feedbackSource && {
        id: feedbackSource.id,
        kind: feedbackSource.kind,
        message: feedbackSource.text(messages),
      },
    [feedbackSource, messages],
  );

  const announce = useCallback((kind: Feedback['kind'], text: MessageText) => {
    feedbackCount.current += 1;
    setFeedbackSource({ id: feedbackCount.current, kind, text });
  }, []);

  const dismissFeedback = useCallback(() => {
    setFeedbackSource(null);
  }, []);

  const load = useCallback(() => service.snapshot(), [service]);
  const showLoaded = useCallback((loaded: { items: ShoppingItem[]; categories: Category[] }) => {
    setItems(loaded.items);
    setCategories(loaded.categories);
    setStatus('ready');
    setLoadFailure(null);
  }, []);

  const showLoadFailure = useCallback((error: unknown) => {
    setStatus('error');
    setLoadFailure(() => describe(error));
  }, []);

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      showLoaded(await load());
    } catch (error) {
      showLoadFailure(error);
    }
  }, [load, showLoaded, showLoadFailure]);

  useIonViewWillEnter(() => {
    void reload();
  }, [reload]);

  // Runs a mutation, then re-reads the stored list so the UI always reflects persisted data.
  // A storage failure is reported to the user as error feedback.
  const mutate = useCallback(
    async <T>(operation: () => Promise<T>): Promise<MutationResult<T>> => {
      try {
        const value = await operation();
        const loaded = await load();
        setItems(loaded.items);
        setCategories(loaded.categories);
        return { failed: false, value };
      } catch (error) {
        announce('error', describe(error));
        return { failed: true };
      }
    },
    [load, announce],
  );

  const addItem = useCallback(
    async (
      name: string,
      quantity: QuantityDraft = EMPTY_QUANTITY_DRAFT,
      categoryIds: readonly string[] = [],
    ): Promise<AddOutcome> => {
      const result = await mutate(() => service.addItem(name, quantity, categoryIds));
      if (result.failed) return { status: 'failed' };
      if (!result.value.ok) return { status: 'invalid', errors: result.value.error };
      const { name: addedName } = result.value.value;
      announce('success', (m) => m.feedback.added(addedName));
      return { status: 'added' };
    },
    [mutate, service, announce],
  );

  const setCompleted = useCallback(
    async (id: string, completed: boolean) => {
      const result = await mutate(() => service.setCompleted(id, completed));
      if (result.failed) return;
      if (!result.value.ok) {
        announce('error', (m) => m.categories.errors['missing-category']);
        return;
      }
      if (!result.value.value) return;
      const { name } = result.value.value;
      announce('success', (m) =>
        completed ? m.feedback.completed(name) : m.feedback.reactivated(name),
      );
    },
    [mutate, service, announce],
  );

  const removeItem = useCallback(
    async (id: string) => {
      const result = await mutate(() => service.removeItem(id));
      if (result.failed || !result.value) return;
      const { name } = result.value;
      announce('success', (m) => m.feedback.removed(name));
    },
    [mutate, service, announce],
  );

  const updateItem = useCallback(
    async (
      id: string,
      name: string,
      quantity: QuantityDraft,
      categoryIds?: readonly string[],
    ): Promise<UpdateOutcome> => {
      const result = await mutate(() => service.updateItem(id, name, quantity, categoryIds));
      if (result.failed) return { status: 'failed' };
      if (!result.value.ok) return { status: 'invalid', errors: result.value.error };
      const change = result.value.value;
      if (!change) return { status: 'unchanged' };
      const { previous, item } = change;
      announce('success', (m) =>
        previous.name === item.name
          ? m.feedback.updated(item.name)
          : m.feedback.renamed(previous.name, item.name),
      );
      return { status: 'updated' };
    },
    [mutate, service, announce],
  );

  const clearCompleted = useCallback(async () => {
    const result = await mutate(() => service.clearCompleted());
    if (result.failed || result.value.length === 0) return;
    const cleared = result.value.length;
    announce('success', (m) => m.feedback.cleared(cleared));
  }, [mutate, service, announce]);

  const createCategory = useCallback(
    async (name: string): Promise<CategoryOutcome> => {
      const result = await mutate(() => service.createCategory(name));
      if (result.failed) return { status: 'failed' };
      if (!result.value.ok) return { status: 'invalid', error: result.value.error };
      return { status: 'saved' };
    },
    [mutate, service],
  );

  const renameCategory = useCallback(
    async (id: string, name: string): Promise<CategoryOutcome> => {
      const result = await mutate(() => service.renameCategory(id, name));
      if (result.failed) return { status: 'failed' };
      if (!result.value.ok) return { status: 'invalid', error: result.value.error };
      return { status: result.value.value ? 'saved' : 'unchanged' };
    },
    [mutate, service],
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<CategoryOutcome> => {
      const result = await mutate(() => service.deleteCategory(id));
      if (result.failed) return { status: 'failed' };
      if (!result.value.ok) return { status: 'invalid', error: result.value.error };
      return { status: result.value.value ? 'saved' : 'unchanged' };
    },
    [mutate, service],
  );

  return {
    items,
    categories,
    status,
    errorMessage,
    feedback,
    dismissFeedback,
    reload,
    addItem,
    setCompleted,
    removeItem,
    updateItem,
    clearCompleted,
    createCategory,
    renameCategory,
    deleteCategory,
  };
}
