export type PersistenceAction =
  | 'load-list'
  | 'read-item'
  | 'save-item'
  | 'remove-item'
  | 'remove-items'
  | 'load-categories'
  | 'save-category'
  | 'remove-category'
  | 'load-recipes'
  | 'read-recipe'
  | 'save-recipe'
  | 'update-recipe'
  | 'remove-recipe'
  | 'load-weekly-menus'
  | 'save-weekly-menu'
  | 'remove-weekly-menu';

/** Failure of the storage layer (unavailable, quota exceeded, blocked, ...). */
export class PersistenceError extends Error {
  /** Lets the UI show the failure in the user's language; `message` stays a technical English text. */
  readonly action: PersistenceAction | undefined;

  constructor(message: string, options?: { cause?: unknown; action?: PersistenceAction }) {
    super(message, options && 'cause' in options ? { cause: options.cause } : undefined);
    this.name = 'PersistenceError';
    this.action = options?.action;
  }
}
