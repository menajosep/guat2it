import { IonButton, IonInput, IonNote } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import type { ItemNameError, ShoppingItem } from '../domain/shopping-item';
import type { RenameOutcome } from '../hooks/use-shopping-list';
import { ITEM_NAME_MESSAGES } from '../messages';

interface EditItemFormProps {
  item: ShoppingItem;
  onRename: (id: string, name: string) => Promise<RenameOutcome>;
  onClose: () => void;
}

export function EditItemForm({ item, onRename, onClose }: EditItemFormProps) {
  const [name, setName] = useState(item.name);
  const [error, setError] = useState<ItemNameError | null>(null);
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
    const outcome = await onRename(item.id, name);
    setSaving(false);
    if (outcome.status === 'invalid') {
      setError(outcome.error);
    } else if (outcome.status === 'failed') {
      setError(null);
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
        aria-invalid={error !== null}
        onIonInput={(event) => {
          setName(event.detail.value ?? '');
        }}
      />
      <div id={errorId} role="alert">
        {error && <IonNote color="danger">{ITEM_NAME_MESSAGES[error]}</IonNote>}
      </div>
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
