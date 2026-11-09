import { IonButton, IonCheckbox, IonIcon, IonItem, IonList, IonNote } from '@ionic/react';
import { createOutline, trashOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import type { QuantityDraft } from '../domain/quantity';
import type { ShoppingItem } from '../domain/shopping-item';
import type { UpdateOutcome } from '../hooks/use-shopping-list';
import { useShoppingListMessages } from '../hooks/use-shopping-list-messages';
import { formatQuantity } from '../messages/format-quantity';
import { EditItemForm } from './EditItemForm';
import type { Category } from '../domain/category';

interface ShoppingItemListProps {
  items: readonly ShoppingItem[];
  categories: readonly Category[];
  onSetCompleted: (id: string, completed: boolean) => void;
  onRemove: (id: string) => void;
  onUpdate: (
    id: string,
    name: string,
    quantity: QuantityDraft,
    categoryIds: readonly string[],
  ) => Promise<UpdateOutcome>;
}

export function ShoppingItemList({
  items,
  categories,
  onSetCompleted,
  onRemove,
  onUpdate,
}: ShoppingItemListProps) {
  const messages = useShoppingListMessages();
  // Only one row is edited at a time; starting another edit discards the previous draft.
  const [editing, setEditing] = useState<{ id: string; group: string } | null>(null);
  const listRef = useRef<HTMLIonListElement>(null);
  const focusAfterEdit = useRef<{ id: string; group: string } | null>(null);

  useEffect(() => {
    if (editing !== null || focusAfterEdit.current === null) return;
    const target = focusAfterEdit.current;
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[data-edit-id]') ?? [],
    ).filter((button) => button.dataset.editId === target.id);
    const host =
      buttons.find((button) => button.closest('section')?.dataset.groupId === target.group) ??
      buttons[0];
    focusAfterEdit.current = null;
    // The host element does not delegate focus; the native button lives in its shadow root.
    (host?.shadowRoot?.querySelector('button') ?? host)?.focus();
  }, [editing]);

  if (items.length === 0) {
    return (
      <p className="empty-state">
        <IonNote>{messages.emptyList}</IonNote>
      </p>
    );
  }

  function closeEditor(id: string, group: string) {
    focusAfterEdit.current = { id, group };
    setEditing(null);
  }

  const groups = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      items: items.filter((item) => item.categoryIds?.includes(category.id)),
    }))
    .filter((group) => group.items.length > 0);
  const uncategorized = items.filter((item) => !item.categoryIds?.length);
  if (uncategorized.length > 0)
    groups.push({ id: '', name: messages.categories.uncategorized, items: uncategorized });

  return (
    <IonList ref={listRef} aria-label={messages.listLabel}>
      {groups.map((group) => (
        <section key={group.id} aria-label={group.name} data-group-id={group.id}>
          <h2>{group.name}</h2>
          {group.items.map((item) =>
            item.id === editing?.id && group.id === editing.group ? (
              <IonItem key={item.id}>
                <EditItemForm
                  item={item}
                  categories={categories}
                  onUpdate={onUpdate}
                  onClose={() => {
                    closeEditor(item.id, group.id);
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
                  {formatQuantity(item, messages.units) && (
                    <IonNote className="item-quantity">
                      {formatQuantity(item, messages.units)}
                    </IonNote>
                  )}
                </IonCheckbox>
                <IonButton
                  slot="end"
                  fill="clear"
                  data-edit-id={item.id}
                  aria-label={messages.editItem(item.name)}
                  onClick={() => {
                    setEditing({ id: item.id, group: group.id });
                  }}
                >
                  <IonIcon slot="icon-only" icon={createOutline} aria-hidden="true" />
                </IonButton>
                <IonButton
                  slot="end"
                  fill="clear"
                  color="danger"
                  aria-label={messages.removeItem(item.name)}
                  onClick={() => {
                    onRemove(item.id);
                  }}
                >
                  <IonIcon slot="icon-only" icon={trashOutline} aria-hidden="true" />
                </IonButton>
              </IonItem>
            ),
          )}
        </section>
      ))}
    </IonList>
  );
}
