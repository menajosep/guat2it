import { IonButton, IonInput, IonNote } from '@ionic/react';
import { useState } from 'react';
import { EMPTY_QUANTITY_DRAFT, type QuantityDraft } from '../domain/quantity';
import type { ItemErrors } from '../domain/shopping-item';
import type { AddOutcome } from '../hooks/use-shopping-list';
import { useShoppingListMessages } from '../hooks/use-shopping-list-messages';
import { QuantityFields } from './QuantityFields';
import { CategoryFields } from './CategoryFields';
import type { Category } from '../domain/category';

interface AddItemFormProps {
  onAdd: (
    name: string,
    quantity: QuantityDraft,
    categoryIds: readonly string[],
  ) => Promise<AddOutcome>;
  categories: readonly Category[];
}

export function AddItemForm({ onAdd, categories }: AddItemFormProps) {
  const messages = useShoppingListMessages();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<QuantityDraft>(EMPTY_QUANTITY_DRAFT);
  const [errors, setErrors] = useState<ItemErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setSubmitting(true);
    const outcome = await onAdd(name, quantity, categoryIds);
    setSubmitting(false);
    setErrors(outcome.status === 'invalid' ? outcome.errors : {});
    if (outcome.status === 'added') {
      setName('');
      setQuantity(EMPTY_QUANTITY_DRAFT);
      setCategoryIds([]);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="add-item-form">
      <IonInput
        label={messages.itemName}
        labelPlacement="floating"
        fill="outline"
        value={name}
        enterkeyhint="done"
        aria-describedby="add-item-error"
        aria-invalid={errors.name !== undefined}
        onIonInput={(event) => {
          setName(event.detail.value ?? '');
        }}
      />
      <div id="add-item-error" role="alert">
        {errors.name && <IonNote color="danger">{messages.itemNameErrors[errors.name]}</IonNote>}
      </div>
      <QuantityFields
        idPrefix="add-item"
        value={quantity}
        error={errors.quantity ?? null}
        onChange={setQuantity}
      />
      <CategoryFields
        categories={categories}
        selected={categoryIds}
        onChange={setCategoryIds}
        error={errors.categories}
      />
      <IonButton type="submit" expand="block" disabled={submitting}>
        {messages.addItem}
      </IonButton>
    </form>
  );
}
