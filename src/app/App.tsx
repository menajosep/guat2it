import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Navigate, Route } from 'react-router-dom';
import { LanguageProvider } from '../features/language/components/LanguageProvider';
import type { LanguageService } from '../features/language/application/language-service';
import { ShoppingListServiceProvider } from '../features/shopping-list/hooks/shopping-list-service-context';
import type { ShoppingListService } from '../features/shopping-list/application/shopping-list-service';
import { ShoppingListPage } from '../features/shopping-list/pages/ShoppingListPage';
import { AdminPage } from '../features/shopping-list/pages/AdminPage';
import type { RecipeService } from '../features/recipes/application/recipe-service';
import { RecipeServiceProvider } from '../features/recipes/hooks/recipe-service-context';
import { RecipesPage } from '../features/recipes/pages/RecipesPage';
import { AppMenu } from './AppMenu';

interface AppProps {
  shoppingListService: ShoppingListService;
  languageService: LanguageService;
  recipeService: RecipeService;
}

export function App({ shoppingListService, languageService, recipeService }: AppProps) {
  return (
    <IonApp>
      <LanguageProvider service={languageService}>
        <ShoppingListServiceProvider value={shoppingListService}>
          <RecipeServiceProvider value={recipeService}>
            <IonReactRouter>
              <AppMenu />
              <IonRouterOutlet id="main-content">
                <Route path="/shopping-list" element={<ShoppingListPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/recipes" element={<RecipesPage />} />
                <Route path="*" element={<Navigate to="/shopping-list" replace />} />
              </IonRouterOutlet>
            </IonReactRouter>
          </RecipeServiceProvider>
        </ShoppingListServiceProvider>
      </LanguageProvider>
    </IonApp>
  );
}
