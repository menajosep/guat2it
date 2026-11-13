import { QuantityFields } from '../../shopping-list/components/QuantityFields';
import { useShoppingListMessages } from '../../shopping-list/hooks/use-shopping-list-messages';
import {
  isRecipeCategory,
  RECIPE_CATEGORIES,
  RECIPE_LABELS,
  RECIPE_LABEL_FACETS,
  type IngredientDraft,
  type RecipeDraft,
  type RecipeErrors,
} from '../domain/recipe';
import type { RecipeMessages } from '../messages/recipe-messages';
import { RecipeImage } from './RecipeImage';

interface RecipeReviewProps {
  draft: RecipeDraft;
  errors: RecipeErrors | null;
  messages: RecipeMessages;
  saving: boolean;
  editing?: boolean;
  onChange: (draft: RecipeDraft) => void;
  onRemoveIngredient?: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function RecipeReview({
  draft,
  errors,
  messages,
  saving,
  editing = false,
  onChange,
  onRemoveIngredient,
  onSave,
  onCancel,
}: RecipeReviewProps) {
  const shoppingMessages = useShoppingListMessages();
  const updateIngredient = (index: number, ingredient: IngredientDraft) => {
    onChange({
      ...draft,
      ingredients: draft.ingredients.map((current, position) =>
        position === index ? ingredient : current,
      ),
    });
  };
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <label htmlFor="recipe-title">{messages.title}</label>
      <input
        id="recipe-title"
        value={draft.title}
        onChange={(event) => {
          onChange({ ...draft, title: event.target.value });
        }}
      />
      {errors?.title && <p role="alert">{messages.required}</p>}

      <label htmlFor="recipe-category">{messages.category}</label>
      <select
        id="recipe-category"
        value={draft.category ?? ''}
        onChange={(event) => {
          const category = event.target.value;
          onChange({
            ...draft,
            category: isRecipeCategory(category) ? category : undefined,
          });
        }}
      >
        <option value="">{messages.uncategorized}</option>
        {RECIPE_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {messages.categories[category]}
          </option>
        ))}
      </select>
      {errors?.category && <p role="alert">{messages.invalidCategory}</p>}

      <fieldset className="recipe-labels">
        <legend>{messages.recipeLabels}</legend>
        <p>{messages.labelSafetyNote}</p>
        {RECIPE_LABEL_FACETS.map((facet) => (
          <details className="recipe-label-group" key={facet}>
            <summary>
              {messages.labelFacets[facet]} (
              {messages.selectedLabelCount(
                RECIPE_LABELS[facet].filter((label) => (draft.labels ?? []).includes(label)).length,
              )}
              )
            </summary>
            <div className="recipe-label-group__options">
              {RECIPE_LABELS[facet].map((label) => (
                <label key={label}>
                  <input
                    type="checkbox"
                    checked={(draft.labels ?? []).includes(label)}
                    onChange={(event) => {
                      const labels = draft.labels ?? [];
                      onChange({
                        ...draft,
                        labels: event.target.checked
                          ? [...labels, label]
                          : labels.filter((selected) => selected !== label),
                      });
                    }}
                  />
                  {messages.labels[label]}
                </label>
              ))}
            </div>
          </details>
        ))}
      </fieldset>
      {errors?.labels && <p role="alert">{messages.invalidLabels}</p>}

      <label htmlFor="recipe-yield">{messages.yield}</label>
      <input
        id="recipe-yield"
        inputMode="decimal"
        value={draft.yield}
        onChange={(event) => {
          onChange({ ...draft, yield: event.target.value });
        }}
      />
      {errors?.yield && <p role="alert">{messages.invalidYield}</p>}

      <fieldset>
        <legend>{messages.ingredients}</legend>
        {errors?.ingredients && <p role="alert">{messages.missingIngredients}</p>}
        {draft.ingredients.map((ingredient, index) => {
          const itemErrors = errors?.ingredientErrors?.[index];
          const id = `recipe-ingredient-${String(index)}`;
          return (
            <fieldset key={id}>
              <legend>{`${messages.ingredients} ${String(index + 1)}`}</legend>
              {!editing && (
                <p>
                  {messages.original}: {ingredient.source}
                </p>
              )}
              <label htmlFor={`${id}-name`}>{messages.ingredientName}</label>
              <input
                id={`${id}-name`}
                value={ingredient.name}
                onChange={(event) => {
                  updateIngredient(index, { ...ingredient, name: event.target.value });
                }}
              />
              {itemErrors?.name && (
                <p role="alert">{shoppingMessages.itemNameErrors[itemErrors.name]}</p>
              )}
              <QuantityFields
                idPrefix={id}
                itemName={String(index + 1)}
                value={ingredient.quantity}
                error={itemErrors?.quantity ?? null}
                onChange={(quantity) => {
                  updateIngredient(index, { ...ingredient, quantity });
                }}
              />
              {!editing && (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={ingredient.confirmed}
                      onChange={(event) => {
                        updateIngredient(index, { ...ingredient, confirmed: event.target.checked });
                      }}
                    />
                    {messages.confirmIngredient}
                  </label>
                  {itemErrors?.unconfirmed && <p role="alert">{messages.confirmRequired}</p>}
                </>
              )}
              {editing && onRemoveIngredient && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    onRemoveIngredient(index);
                  }}
                >
                  {messages.removeIngredient}
                </button>
              )}
            </fieldset>
          );
        })}
        <button
          type="button"
          onClick={() => {
            onChange({
              ...draft,
              ingredients: [
                ...draft.ingredients,
                {
                  source: '',
                  name: '',
                  quantity: { amount: '', unit: undefined },
                  confirmed: true,
                },
              ],
            });
          }}
        >
          {messages.addIngredient}
        </button>
      </fieldset>

      <label htmlFor="recipe-instructions">{messages.instructions}</label>
      <textarea
        id="recipe-instructions"
        value={draft.instructions}
        onChange={(event) => {
          onChange({ ...draft, instructions: event.target.value });
        }}
      />
      {errors?.instructions && <p role="alert">{messages.required}</p>}

      <label htmlFor="recipe-image">{messages.imageUrl}</label>
      <input
        id="recipe-image"
        value={draft.imageUrl}
        onChange={(event) => {
          onChange({ ...draft, imageUrl: event.target.value });
        }}
      />
      {errors?.imageUrl && <p role="alert">{messages.invalidImage}</p>}
      <RecipeImage
        key={draft.imageUrl}
        url={draft.imageUrl}
        description={draft.title}
        unavailable={messages.imageUnavailable}
      />
      <button type="submit" disabled={saving}>
        {editing ? messages.update : messages.save}
      </button>
      <button type="button" disabled={saving} onClick={onCancel}>
        {messages.cancel}
      </button>
    </form>
  );
}
