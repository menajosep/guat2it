import { IonButton, IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';
import { ShoppingPageHeader } from '../components/ShoppingPageHeader';
import { LanguageNotice } from '../../language/components/LanguageNotice';
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
    categories,
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
      <ShoppingPageHeader title={messages.pageTitle} />
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
              <AddItemForm onAdd={addItem} categories={categories} />
              <ShoppingItemList
                items={items}
                categories={categories}
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
