import { IonButton, IonCheckbox, IonIcon, IonItem, IonList, IonNote } from '@ionic/react';
import { createOutline, trashOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import type { ShoppingItem } from '../domain/shopping-item';
import type { RenameOutcome } from '../hooks/use-shopping-list';
import { EditItemForm } from './EditItemForm';

interface ShoppingItemListProps {
  items: readonly ShoppingItem[];
  onSetCompleted: (id: string, completed: boolean) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => Promise<RenameOutcome>;
}

export function ShoppingItemList({
  items,
  onSetCompleted,
  onRemove,
  onRename,
}: ShoppingItemListProps) {
  // Only one row is edited at a time; starting another edit discards the previous draft.
  const [editingId, setEditingId] = useState<string | null>(null);
  const listRef = useRef<HTMLIonListElement>(null);
  const focusAfterEdit = useRef<string | null>(null);

  useEffect(() => {
    if (editingId !== null || focusAfterEdit.current === null) return;
    const host = listRef.current?.querySelector<HTMLElement>(
      `[data-edit-id="${focusAfterEdit.current}"]`,
    );
    focusAfterEdit.current = null;
    // The host element does not delegate focus; the native button lives in its shadow root.
    (host?.shadowRoot?.querySelector('button') ?? host)?.focus();
  }, [editingId]);

  if (items.length === 0) {
    return (
      <p className="empty-state">
        <IonNote>Your shopping list is empty. Add your first item above.</IonNote>
      </p>
    );
  }

  function closeEditor(id: string) {
    focusAfterEdit.current = id;
    setEditingId(null);
  }

  return (
    <IonList ref={listRef} aria-label="Shopping items">
      {items.map((item) =>
        item.id === editingId ? (
          <IonItem key={item.id}>
            <EditItemForm
              item={item}
              onRename={onRename}
              onClose={() => {
                closeEditor(item.id);
              }}
            />
          </IonItem>
        ) : (
          <IonItem key={item.id}>
            <IonCheckbox
              checked={item.completed}
              className={item.completed ? 'item-completed' : undefined}
              onIonChange={(event) => {
                onSetCompleted(item.id, event.detail.checked);
              }}
            >
              {item.name}
            </IonCheckbox>
            <IonButton
              slot="end"
              fill="clear"
              data-edit-id={item.id}
              aria-label={`Edit ${item.name}`}
              onClick={() => {
                setEditingId(item.id);
              }}
            >
              <IonIcon slot="icon-only" icon={createOutline} aria-hidden="true" />
            </IonButton>
            <IonButton
              slot="end"
              fill="clear"
              color="danger"
              aria-label={`Remove ${item.name}`}
              onClick={() => {
                onRemove(item.id);
              }}
            >
              <IonIcon slot="icon-only" icon={trashOutline} aria-hidden="true" />
            </IonButton>
          </IonItem>
        ),
      )}
    </IonList>
  );
}
