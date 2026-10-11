/** Failure of the storage layer (unavailable, quota exceeded, blocked, ...). */
export class PersistenceError extends Error {
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.name = 'PersistenceError';
  }
}
