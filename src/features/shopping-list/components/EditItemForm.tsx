import { IonButton, IonInput, IonNote } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { amountToText, type QuantityDraft } from '../domain/quantity';
import type { ItemErrors, ShoppingItem } from '../domain/shopping-item';
import type { UpdateOutcome } from '../hooks/use-shopping-list';
import { ITEM_NAME_MESSAGES } from '../messages';
import { QuantityFields } from './QuantityFields';

interface EditItemFormProps {
  item: ShoppingItem;
  onUpdate: (id: string, name: string, quantity: QuantityDraft) => Promise<UpdateOutcome>;
  onClose: () => void;
}

export function EditItemForm({ item, onUpdate, onClose }: EditItemFormProps) {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState<QuantityDraft>({
    amount: amountToText(item),
    unit: item.unit,
  });
  const [errors, setErrors] = useState<ItemErrors>({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errorId = `edit-item-error-${item.id}`;

  useEffect(() => {
    let frame = 0;
    // The native input only exists once Ionic has rendered the component, so wait for it.
    const focusWhenReady = () => {
      const nativeInput = formRef.current?.querySelector('input');
      if (nativeInput) {
        nativeInput.focus();
      } else {
        frame = requestAnimationFrame(focusWhenReady);
      }
    };
    focusWhenReady();
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setSaving(true);
    const outcome = await onUpdate(item.id, name, quantity);
    setSaving(false);
    if (outcome.status === 'invalid') {
      setErrors(outcome.errors);
    } else if (outcome.status === 'failed') {
      setErrors({});
    } else {
      onClose();
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={(event) => void handleSubmit(event)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
      noValidate
      className="edit-item-form"
    >
      <IonInput
        label={`New name for ${item.name}`}
        labelPlacement="floating"
        fill="outline"
        value={name}
        enterkeyhint="done"
        aria-describedby={errorId}
        aria-invalid={errors.name !== undefined}
        onIonInput={(event) => {
          setName(event.detail.value ?? '');
        }}
      />
      <div id={errorId} role="alert">
        {errors.name && <IonNote color="danger">{ITEM_NAME_MESSAGES[errors.name]}</IonNote>}
      </div>
      <QuantityFields
        idPrefix={`edit-item-${item.id}`}
        labelSuffix={` for ${item.name}`}
        value={quantity}
        error={errors.quantity ?? null}
        onChange={setQuantity}
      />
      <div className="edit-item-actions">
        <IonButton type="submit" size="small" disabled={saving}>
          Save
        </IonButton>
        <IonButton type="button" size="small" fill="outline" onClick={onClose}>
          Cancel
        </IonButton>
      </div>
    </form>
  );
}
