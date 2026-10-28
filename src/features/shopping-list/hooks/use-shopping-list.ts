import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PersistenceError } from '../../../shared/errors/persistence-error';
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
  status: LoadStatus;
  /** Latest load failure, shown until the next successful load. */
  errorMessage: string | null;
  /** Outcome of the latest list operation, or null once dismissed. */
  feedback: Feedback | null;
  dismissFeedback: () => void;
  reload: () => Promise<void>;
  addItem: (name: string, quantity?: QuantityDraft) => Promise<AddOutcome>;
  setCompleted: (id: string, completed: boolean) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (id: string, name: string, quantity: QuantityDraft) => Promise<UpdateOutcome>;
  clearCompleted: () => Promise<void>;
}

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

  const showLoaded = useCallback((loaded: ShoppingItem[]) => {
    setItems(loaded);
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
    async (name: string, quantity: QuantityDraft = EMPTY_QUANTITY_DRAFT): Promise<AddOutcome> => {
      const result = await mutate(() => service.addItem(name, quantity));
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
      if (result.failed || !result.value) return;
      const { name } = result.value;
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
    async (id: string, name: string, quantity: QuantityDraft): Promise<UpdateOutcome> => {
      const result = await mutate(() => service.updateItem(id, name, quantity));
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
    updateItem,
    clearCompleted,
  };
}
