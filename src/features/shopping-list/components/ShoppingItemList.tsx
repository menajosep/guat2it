import { IonButton, IonCheckbox, IonIcon, IonItem, IonList, IonNote } from '@ionic/react';
import { trashOutline } from 'ionicons/icons';
import type { ShoppingItem } from '../domain/shopping-item';

interface ShoppingItemListProps {
  items: readonly ShoppingItem[];
  onSetCompleted: (id: string, completed: boolean) => void;
  onRemove: (id: string) => void;
}

export function ShoppingItemList({ items, onSetCompleted, onRemove }: ShoppingItemListProps) {
  if (items.length === 0) {
    return (
      <p className="empty-state">
        <IonNote>Your shopping list is empty. Add your first item above.</IonNote>
      </p>
    );
  }

  return (
    <IonList aria-label="Shopping items">
      {items.map((item) => (
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
            color="danger"
            aria-label={`Remove ${item.name}`}
            onClick={() => {
              onRemove(item.id);
            }}
          >
            <IonIcon slot="icon-only" icon={trashOutline} aria-hidden="true" />
          </IonButton>
        </IonItem>
      ))}
    </IonList>
  );
}
