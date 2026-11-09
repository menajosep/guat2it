import {
  IonContent,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { useEffect, useRef } from 'react';
import { useShoppingListMessages } from '../features/shopping-list/hooks/use-shopping-list-messages';

export function AppMenu() {
  const messages = useShoppingListMessages();
  const menuRef = useRef<HTMLIonMenuElement>(null);
  const opened = useRef(false);
  const closeRequested = useRef(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      const menu = menuRef.current;
      if (event.key === 'Escape' && menu?.classList.contains('show-menu')) {
        event.preventDefault();
        if (opened.current) {
          void menu.close();
        } else {
          closeRequested.current = true;
        }
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <IonMenu
      ref={menuRef}
      contentId="main-content"
      aria-label={messages.navigation.menu}
      onIonDidOpen={() => {
        opened.current = true;
        if (closeRequested.current) {
          closeRequested.current = false;
          void menuRef.current?.close();
        }
      }}
      onIonDidClose={() => {
        opened.current = false;
        closeRequested.current = false;
      }}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{messages.navigation.menu}</IonTitle>
          <IonButtons slot="end">
            <IonMenuToggle autoHide={false}>
              <IonButton
                key={messages.navigation.closeMenu}
                aria-label={messages.navigation.closeMenu}
              >
                <IonIcon slot="icon-only" icon={closeOutline} aria-hidden="true" />
              </IonButton>
            </IonMenuToggle>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink="/shopping-list" routerDirection="root">
              {messages.navigation.shoppingList}
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink="/admin" routerDirection="root">
              {messages.navigation.admin}
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
}
