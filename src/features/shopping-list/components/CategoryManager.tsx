import { useState } from 'react';
import type { Category } from '../domain/category';
import type { CategoryOutcome } from '../hooks/use-shopping-list';
import { useShoppingListMessages } from '../hooks/use-shopping-list-messages';

interface CategoryManagerProps {
  categories: readonly Category[];
  onCreate: (name: string) => Promise<CategoryOutcome>;
  onRename: (id: string, name: string) => Promise<CategoryOutcome>;
  onDelete: (id: string) => Promise<CategoryOutcome>;
}

export function CategoryManager({
  categories,
  onCreate,
  onRename,
  onDelete,
}: CategoryManagerProps) {
  const messages = useShoppingListMessages();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<
    Extract<CategoryOutcome, { status: 'invalid' }>['error'] | null
  >(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.SyntheticEvent) {
    event.preventDefault();
    setPending(true);
    const outcome = editing === null ? await onCreate(name) : await onRename(editing, name);
    setPending(false);
    if (outcome.status === 'invalid') {
      setError(outcome.error);
    } else if (outcome.status !== 'failed') {
      setName('');
      setEditing(null);
      setError(null);
    }
  }

  async function remove(id: string) {
    setPending(true);
    const outcome = await onDelete(id);
    setPending(false);
    setError(outcome.status === 'invalid' ? outcome.error : null);
    if (outcome.status === 'saved' && editing === id) {
      setEditing(null);
      setName('');
    }
  }

  return (
    <section className="category-manager" aria-label={messages.categories.title}>
      <h2>{messages.categories.title}</h2>
      <form onSubmit={(event) => void submit(event)} noValidate>
        <label>
          {messages.categories.name}
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            aria-invalid={error !== null && error !== 'in-use'}
            aria-describedby="category-manager-error"
          />
        </label>
        <div id="category-manager-error" role="alert" className="category-error">
          {error && messages.categories.errors[error]}
        </div>
        <button type="submit" disabled={pending}>
          {editing === null ? messages.categories.add : messages.save}
        </button>
        {editing !== null && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setName('');
              setError(null);
            }}
          >
            {messages.cancel}
          </button>
        )}
      </form>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            {category.name}
            <button
              type="button"
              disabled={pending}
              aria-label={messages.categories.edit(category.name)}
              onClick={() => {
                setEditing(category.id);
                setName(category.name);
                setError(null);
              }}
            >
              {messages.editItem(category.name)}
            </button>
            <button
              type="button"
              disabled={pending}
              aria-label={messages.categories.remove(category.name)}
              onClick={() => void remove(category.id)}
            >
              {messages.removeItem(category.name)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
