import { IonButton, IonInput, IonNote } from '@ionic/react';
import { useState } from 'react';
import { EMPTY_QUANTITY_DRAFT, type QuantityDraft } from '../domain/quantity';
import type { ItemErrors } from '../domain/shopping-item';
import type { AddOutcome } from '../hooks/use-shopping-list';
import { useShoppingListMessages } from '../hooks/use-shopping-list-messages';
import { QuantityFields } from './QuantityFields';

interface AddItemFormProps {
  onAdd: (name: string, quantity: QuantityDraft) => Promise<AddOutcome>;
}

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const messages = useShoppingListMessages();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<QuantityDraft>(EMPTY_QUANTITY_DRAFT);
  const [errors, setErrors] = useState<ItemErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setSubmitting(true);
    const outcome = await onAdd(name, quantity);
    setSubmitting(false);
    setErrors(outcome.status === 'invalid' ? outcome.errors : {});
    if (outcome.status === 'added') {
      setName('');
      setQuantity(EMPTY_QUANTITY_DRAFT);
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
      <IonButton type="submit" expand="block" disabled={submitting}>
        {messages.addItem}
      </IonButton>
    </form>
  );
}
