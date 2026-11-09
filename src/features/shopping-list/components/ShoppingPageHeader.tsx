import { IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar } from '@ionic/react';
import { LanguageSelect } from '../../language/components/LanguageSelect';
import { useShoppingListMessages } from '../hooks/use-shopping-list-messages';

export function ShoppingPageHeader({ title }: { title: string }) {
  const messages = useShoppingListMessages();
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonMenuButton
            key={messages.navigation.openMenu}
            aria-label={messages.navigation.openMenu}
          />
        </IonButtons>
        <IonTitle>{title}</IonTitle>
        <div slot="end" className="language-control">
          <LanguageSelect />
        </div>
      </IonToolbar>
    </IonHeader>
  );
}
