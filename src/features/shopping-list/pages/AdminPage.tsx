import { IonButton, IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';
import { ShoppingPageHeader } from '../components/ShoppingPageHeader';
import { LanguageNotice } from '../../language/components/LanguageNotice';
import { CategoryManager } from '../components/CategoryManager';
import { FeedbackToast } from '../components/FeedbackToast';
import { useShoppingList } from '../hooks/use-shopping-list';
import { useShoppingListMessages } from '../hooks/use-shopping-list-messages';

export function AdminPage() {
  const {
    categories,
    status,
    errorMessage,
    feedback,
    dismissFeedback,
    reload,
    createCategory,
    renameCategory,
    deleteCategory,
  } = useShoppingList();
  const messages = useShoppingListMessages();
  return (
    <IonPage>
      <ShoppingPageHeader title={messages.navigation.admin} />
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
            <IonButton fill="outline" onClick={() => void reload()}>
              {messages.tryAgain}
            </IonButton>
          )}
          {status === 'ready' && (
            <CategoryManager
              categories={categories}
              onCreate={createCategory}
              onRename={renameCategory}
              onDelete={deleteCategory}
            />
          )}
        </div>
        <FeedbackToast feedback={feedback} onDismiss={dismissFeedback} />
      </IonContent>
    </IonPage>
  );
}
