import type { Category } from '../domain/category';
import { useShoppingListMessages } from '../hooks/use-shopping-list-messages';

interface CategoryFieldsProps {
  categories: readonly Category[];
  selected: readonly string[];
  onChange: (ids: string[]) => void;
  error: 'missing-category' | undefined;
}

export function CategoryFields({ categories, selected, onChange, error }: CategoryFieldsProps) {
  const messages = useShoppingListMessages();
  if (categories.length === 0 && selected.length === 0 && !error) return null;
  return (
    <fieldset className="category-fields">
      <legend>{messages.categories.select}</legend>
      {categories.map((category) => (
        <label key={category.id}>
          <input
            type="checkbox"
            checked={selected.includes(category.id)}
            onChange={(event) => {
              onChange(
                event.target.checked
                  ? [...selected, category.id]
                  : selected.filter((id) => id !== category.id),
              );
            }}
          />
          {category.name}
        </label>
      ))}
      {selected
        .filter((id) => !categories.some((category) => category.id === id))
        .map((id) => (
          <label key={id}>
            <input
              type="checkbox"
              checked
              onChange={() => {
                onChange(selected.filter((selectedId) => selectedId !== id));
              }}
            />
            {messages.categories.errors['missing-category']}
          </label>
        ))}
      <div role="alert" className="category-error">
        {error && messages.categories.errors[error]}
      </div>
    </fieldset>
  );
}
