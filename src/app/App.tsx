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
import type { WeeklyMenuService } from '../features/weekly-menus/application/weekly-menu-service';
import { WeeklyMenuServiceProvider } from '../features/weekly-menus/hooks/weekly-menu-service-context';
import { WeeklyMenusPage } from '../features/weekly-menus/pages/WeeklyMenusPage';
import { AppMenu } from './AppMenu';

interface AppProps {
  shoppingListService: ShoppingListService;
  languageService: LanguageService;
  recipeService: RecipeService;
  weeklyMenuService: WeeklyMenuService;
}

export function App({
  shoppingListService,
  languageService,
  recipeService,
  weeklyMenuService,
}: AppProps) {
  return (
    <IonApp>
      <LanguageProvider service={languageService}>
        <ShoppingListServiceProvider value={shoppingListService}>
          <RecipeServiceProvider value={recipeService}>
            <WeeklyMenuServiceProvider value={weeklyMenuService}>
              <IonReactRouter>
                <AppMenu />
                <IonRouterOutlet id="main-content">
                  <Route path="/shopping-list" element={<ShoppingListPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/recipes" element={<RecipesPage />} />
                  <Route path="/weekly-menus" element={<WeeklyMenusPage />} />
                  <Route path="*" element={<Navigate to="/shopping-list" replace />} />
                </IonRouterOutlet>
              </IonReactRouter>
            </WeeklyMenuServiceProvider>
          </RecipeServiceProvider>
        </ShoppingListServiceProvider>
      </LanguageProvider>
    </IonApp>
  );
}
