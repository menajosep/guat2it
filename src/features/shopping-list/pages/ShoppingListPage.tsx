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
import { LanguageNotice } from '../../language/components/LanguageNotice';
import { LanguageSelect } from '../../language/components/LanguageSelect';
import { AddItemForm } from '../components/AddItemForm';
import { ClearCompletedButton } from '../components/ClearCompletedButton';
import { FeedbackToast } from '../components/FeedbackToast';
import { ShoppingItemList } from '../components/ShoppingItemList';
import { completedItems } from '../domain/shopping-item';
import { useShoppingList } from '../hooks/use-shopping-list';
import { useShoppingListMessages } from '../hooks/use-shopping-list-messages';

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
    clearCompleted,
  } = useShoppingList();
  const messages = useShoppingListMessages();
  const completedCount = completedItems(items).length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{messages.pageTitle}</IonTitle>
          <div slot="end" className="language-control">
            <LanguageSelect />
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="page-column">
          <LanguageNotice />
          {errorMessage && (
            <div role="alert">
              <IonText color="danger">
                <p>{errorMessage}</p>
              </IonText>
            </div>
          )}
          {status === 'loading' && <IonSpinner name="dots" aria-label={messages.loadingList} />}
          {status === 'error' && (
            <IonButton
              fill="outline"
              onClick={() => {
                void reload();
              }}
            >
              {messages.tryAgain}
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
              <ClearCompletedButton
                completedCount={completedCount}
                onConfirm={() => void clearCompleted()}
              />
            </>
          )}
        </div>
        <FeedbackToast feedback={feedback} onDismiss={dismissFeedback} />
      </IonContent>
    </IonPage>
  );
}
