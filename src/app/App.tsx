import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Navigate, Route } from 'react-router-dom';
import { LanguageProvider } from '../features/language/components/LanguageProvider';
import type { LanguageService } from '../features/language/application/language-service';
import { ShoppingListServiceProvider } from '../features/shopping-list/hooks/shopping-list-service-context';
import type { ShoppingListService } from '../features/shopping-list/application/shopping-list-service';
import { ShoppingListPage } from '../features/shopping-list/pages/ShoppingListPage';

interface AppProps {
  shoppingListService: ShoppingListService;
  languageService: LanguageService;
}

export function App({ shoppingListService, languageService }: AppProps) {
  return (
    <IonApp>
      <LanguageProvider service={languageService}>
        <ShoppingListServiceProvider value={shoppingListService}>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route path="/shopping-list" element={<ShoppingListPage />} />
              <Route path="*" element={<Navigate to="/shopping-list" replace />} />
            </IonRouterOutlet>
          </IonReactRouter>
        </ShoppingListServiceProvider>
      </LanguageProvider>
    </IonApp>
  );
}
