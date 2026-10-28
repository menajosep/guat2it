import { IonButton, IonInput, IonNote } from '@ionic/react';
import { useState } from 'react';
import type { ItemNameError } from '../domain/shopping-item';
import type { AddOutcome } from '../hooks/use-shopping-list';
import { ITEM_NAME_MESSAGES } from '../messages';

interface AddItemFormProps {
  onAdd: (name: string) => Promise<AddOutcome>;
}

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<ItemNameError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setSubmitting(true);
    const outcome = await onAdd(name);
    setSubmitting(false);
    setError(outcome.status === 'invalid' ? outcome.error : null);
    if (outcome.status === 'added') {
      setName('');
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="add-item-form">
      <IonInput
        label="Item name"
        labelPlacement="floating"
        fill="outline"
        value={name}
        enterkeyhint="done"
        aria-describedby="add-item-error"
        aria-invalid={error !== null}
        onIonInput={(event) => {
          setName(event.detail.value ?? '');
        }}
      />
      <div id="add-item-error" role="alert">
        {error && <IonNote color="danger">{ITEM_NAME_MESSAGES[error]}</IonNote>}
      </div>
      <IonButton type="submit" expand="block" disabled={submitting}>
        Add item
      </IonButton>
    </form>
  );
}
