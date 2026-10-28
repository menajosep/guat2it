import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { AddItemForm } from '../components/AddItemForm';
import { FeedbackToast } from '../components/FeedbackToast';
import { ShoppingItemList } from '../components/ShoppingItemList';
import { useShoppingList } from '../hooks/use-shopping-list';

export function ShoppingListPage() {
  const {
    items,
    status,
    errorMessage,
    feedback,
    dismissFeedback,
    reload,
    addItem,
    setCompleted,
    removeItem,
    updateItem,
  } = useShoppingList();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Shopping list</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="page-column">
          {errorMessage && (
            <div role="alert">
              <IonText color="danger">
                <p>{errorMessage}</p>
              </IonText>
            </div>
          )}
          {status === 'loading' && <IonSpinner name="dots" aria-label="Loading shopping list" />}
          {status === 'error' && (
            <IonButton
              fill="outline"
              onClick={() => {
                void reload();
              }}
            >
              Try again
            </IonButton>
          )}
          {status === 'ready' && (
            <>
              <AddItemForm onAdd={addItem} />
              <ShoppingItemList
                items={items}
                onSetCompleted={(id, completed) => void setCompleted(id, completed)}
                onRemove={(id) => void removeItem(id)}
                onUpdate={updateItem}
              />
            </>
          )}
        </div>
        <FeedbackToast feedback={feedback} onDismiss={dismissFeedback} />
      </IonContent>
    </IonPage>
  );
}
