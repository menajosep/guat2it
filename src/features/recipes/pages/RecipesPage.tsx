import { IonAlert, IonContent, IonPage, IonSpinner, useIonViewWillEnter } from '@ionic/react';
import { useCallback, useState } from 'react';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import { LanguageNotice } from '../../language/components/LanguageNotice';
import { useLanguage } from '../../language/hooks/language-context';
import { ShoppingPageHeader } from '../../shopping-list/components/ShoppingPageHeader';
import { useShoppingListMessages } from '../../shopping-list/hooks/use-shopping-list-messages';
import { formatQuantity } from '../../shopping-list/messages/format-quantity';
import type { ImportError } from '../application/recipe-service';
import { RecipeImage } from '../components/RecipeImage';
import { RecipeReview } from '../components/RecipeReview';
import {
  isRecipeCategory,
  RECIPE_CATEGORIES,
  recipeToDraft,
  type Recipe,
  type RecipeCategory,
  type RecipeDraft,
  type RecipeErrors,
} from '../domain/recipe';
import { useRecipeService } from '../hooks/recipe-service-context';
import { recipeMessages } from '../messages/recipe-messages';
import { AssignRecipe } from '../../weekly-menus/components/AssignRecipe';
import { useActiveMenu } from '../../weekly-menus/hooks/active-menu-context';

type View = 'list' | 'import' | 'review' | 'edit' | 'detail';
type Status = 'loading' | 'ready' | 'error';
type RecipeFilter = 'all' | 'uncategorized' | RecipeCategory;

export function RecipesPage() {
  const service = useRecipeService();
  const { menu: activeMenu } = useActiveMenu();
  const { language } = useLanguage();
  const messages = recipeMessages[language];
  const shoppingMessages = useShoppingListMessages();
  const [view, setView] = useState<View>('list');
  const [status, setStatus] = useState<Status>('loading');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeFilter, setRecipeFilter] = useState<RecipeFilter>('all');
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [source, setSource] = useState('');
  const [importError, setImportError] = useState<ImportError | 'unexpected' | null>(null);
  const [draft, setDraft] = useState<RecipeDraft | null>(null);
  const [errors, setErrors] = useState<RecipeErrors | null>(null);
  const [loadError, setLoadError] = useState<'storage' | 'unexpected'>('storage');
  const [saveError, setSaveError] = useState<'storage' | 'unexpected' | null>(null);
  const [deleteError, setDeleteError] = useState<
    'storage' | 'unexpected' | 'not-found' | 'in-use' | null
  >(null);
  const [updateError, setUpdateError] = useState<'storage' | 'unexpected' | 'not-found' | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [importing, setImporting] = useState(false);

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      setRecipes(await service.list());
      setStatus('ready');
    } catch (error) {
      console.error('Unable to load recipes', error);
      setLoadError(error instanceof PersistenceError ? 'storage' : 'unexpected');
      setStatus('error');
    }
  }, [service]);

  useIonViewWillEnter(() => {
    void reload();
  }, [reload]);

  const importRecipe = async () => {
    if (importing) return;
    setImporting(true);
    setImportError(null);
    try {
      const result = service.canDownload
        ? await service.importFromUrl(sourceUrl)
        : service.import(sourceUrl, source);
      if (!result.ok) {
        setImportError(result.error);
        return;
      }
      setDraft(result.value);
      setErrors(null);
      setImportError(null);
      setView('review');
    } catch (error) {
      console.error('Unable to read recipe source', error);
      setImportError('unexpected');
    } finally {
      setImporting(false);
    }
  };

  const save = async () => {
    if (!draft || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await service.save(draft);
      if (!result.ok) {
        if (result.error === 'invalid-url') {
          setImportError('invalid-url');
          setView('import');
        } else {
          setErrors(result.error);
        }
        return;
      }
      setDraft(null);
      setSource('');
      setSourceUrl('');
      setView('list');
      await reload();
    } catch (error) {
      console.error('Unable to save recipe', error);
      setSaveError(error instanceof PersistenceError ? 'storage' : 'unexpected');
    } finally {
      setSaving(false);
    }
  };

  const deleteSelectedRecipe = async () => {
    if (!selected || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const result = await service.remove(selected.id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      setSelected(null);
      setView('list');
      await reload();
    } catch (error) {
      console.error('Unable to delete recipe', error);
      setDeleteError(error instanceof PersistenceError ? 'storage' : 'unexpected');
    } finally {
      setDeleting(false);
    }
  };

  const updateSelectedRecipe = async () => {
    if (!selected || !draft || saving) return;
    setSaving(true);
    setUpdateError(null);
    setErrors(null);
    try {
      const result = await service.update(selected.id, draft);
      if (!result.ok) {
        if (result.error === 'not-found') setUpdateError('not-found');
        else setErrors(result.error);
        return;
      }
      setSelected(result.value);
      setDraft(null);
      setErrors(null);
      setView('detail');
      await reload();
    } catch (error) {
      console.error('Unable to update recipe', error);
      setUpdateError(error instanceof PersistenceError ? 'storage' : 'unexpected');
    } finally {
      setSaving(false);
    }
  };

  const updateErrorMessage =
    updateError === 'storage'
      ? messages.updateFailed
      : updateError === 'not-found'
        ? messages.missingRecipe
        : messages.updateUnexpected;

  const deleteErrorMessage =
    deleteError === 'storage'
      ? messages.deleteFailed
      : deleteError === 'not-found'
        ? messages.missingRecipe
        : deleteError === 'in-use'
          ? messages.deleteInUse
          : messages.deleteUnexpected;

  const importErrorMessages: Record<ImportError | 'unexpected', string> = {
    'invalid-url': messages.invalidUrl,
    'source-too-large': messages.tooLarge,
    'no-recipe': messages.noRecipe,
    network: messages.networkError,
    http: messages.httpError,
    redirect: messages.redirectError,
    timeout: messages.timeoutError,
    encoding: messages.encodingError,
    unexpected: messages.importUnexpected,
  };
  const visibleRecipes =
    recipeFilter === 'all'
      ? recipes
      : recipeFilter === 'uncategorized'
        ? recipes.filter((recipe) => recipe.category === undefined)
        : recipes.filter((recipe) => recipe.category === recipeFilter);

  return (
    <IonPage>
      <ShoppingPageHeader title={shoppingMessages.navigation.recipes} />
      <IonContent className="ion-padding">
        <div className="page-column recipes">
          <LanguageNotice />
          {view === 'list' && (
            <>
              {status === 'loading' && <IonSpinner name="dots" aria-label={messages.loading} />}
              {status === 'error' && (
                <>
                  <p role="alert">
                    {loadError === 'storage' ? messages.loadFailed : messages.loadUnexpected}
                  </p>
                  <button type="button" onClick={() => void reload()}>
                    {shoppingMessages.tryAgain}
                  </button>
                </>
              )}
              {status === 'ready' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setView('import');
                    }}
                  >
                    {messages.import}
                  </button>
                  {recipes.length === 0 ? (
                    <p>{messages.empty}</p>
                  ) : (
                    <>
                      <div className="recipe-category-filter">
                        <label htmlFor="recipe-category-filter">{messages.categoryFilter}</label>
                        <select
                          id="recipe-category-filter"
                          value={recipeFilter}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (
                              value === 'all' ||
                              value === 'uncategorized' ||
                              isRecipeCategory(value)
                            )
                              setRecipeFilter(value);
                          }}
                        >
                          <option value="all">{messages.allRecipes}</option>
                          {RECIPE_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {messages.categories[category]}
                            </option>
                          ))}
                          <option value="uncategorized">{messages.uncategorized}</option>
                        </select>
                      </div>
                      {visibleRecipes.length === 0 ? (
                        <p>{messages.noMatches}</p>
                      ) : (
                        <ul className="recipe-list">
                          {visibleRecipes.map((recipe) => (
                            <li key={recipe.id}>
                              <button
                                className="recipe-list__entry"
                                type="button"
                                aria-label={recipe.title}
                                aria-describedby={`recipe-image-${recipe.id}`}
                                onClick={() => {
                                  setSelected(recipe);
                                  setDeleteError(null);
                                  setUpdateError(null);
                                  setView('detail');
                                }}
                              >
                                <span id={`recipe-image-${recipe.id}`}>
                                  <RecipeImage
                                    key={recipe.imageUrl}
                                    url={recipe.imageUrl}
                                    description=""
                                    unavailable={messages.imageUnavailable}
                                    thumbnail
                                  />
                                </span>
                                <span>{recipe.title}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
          {view === 'detail' && selected && (
            <>
              {deleteError && <p role="alert">{deleteErrorMessage}</p>}
              <button
                type="button"
                onClick={() => {
                  setView('list');
                }}
              >
                {messages.back}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(recipeToDraft(selected));
                  setErrors(null);
                  setUpdateError(null);
                  setView('edit');
                }}
              >
                {messages.edit}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteError(null);
                  setDeleteDialogOpen(true);
                }}
              >
                {messages.delete}
              </button>
              <IonAlert
                isOpen={deleteDialogOpen}
                header={messages.deleteTitle}
                message={messages.deleteConfirmation(selected.title)}
                buttons={[
                  { text: messages.cancel, role: 'cancel' },
                  {
                    text: messages.deleteConfirm,
                    role: 'destructive',
                    handler: () => {
                      void deleteSelectedRecipe();
                    },
                  },
                ]}
                onDidDismiss={() => {
                  setDeleteDialogOpen(false);
                }}
              />
              <h1>{selected.title}</h1>
              <AssignRecipe key={`${selected.id}-${activeMenu?.id ?? ''}`} recipeId={selected.id} />
              <RecipeImage
                key={selected.imageUrl}
                url={selected.imageUrl}
                description={selected.title}
                unavailable={messages.imageUnavailable}
              />
              <p>
                {messages.yield}: {selected.yield}
              </p>
              <p>
                {messages.category}:{' '}
                {selected.category
                  ? messages.categories[selected.category]
                  : messages.uncategorized}
              </p>
              <h2>{messages.ingredients}</h2>
              <ul>
                {selected.ingredients.map((ingredient, index) => {
                  const quantity = formatQuantity(ingredient, shoppingMessages.units);
                  return (
                    <li key={`${String(index)}-${ingredient.name}`}>
                      {ingredient.name}
                      {quantity && ` — ${quantity}`}
                    </li>
                  );
                })}
              </ul>
              <h2>{messages.instructions}</h2>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selected.instructions}</p>
            </>
          )}
          {view === 'import' && (
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                void importRecipe();
              }}
            >
              <p>{service.canDownload ? messages.nativeSourceHelp : messages.sourceHelp}</p>
              <label htmlFor="recipe-source-url">{messages.sourceUrl}</label>
              <input
                id="recipe-source-url"
                value={sourceUrl}
                disabled={importing}
                onChange={(event) => {
                  setSourceUrl(event.target.value);
                }}
              />
              {!service.canDownload && (
                <>
                  <label htmlFor="recipe-source-html">{messages.sourceHtml}</label>
                  <textarea
                    id="recipe-source-html"
                    value={source}
                    disabled={importing}
                    onChange={(event) => {
                      setSource(event.target.value);
                    }}
                  />
                </>
              )}
              {importError && <p role="alert">{importErrorMessages[importError]}</p>}
              {importing && <p role="status">{messages.downloading}</p>}
              <button type="submit" disabled={importing}>
                {messages.extract}
              </button>
              <button
                type="button"
                disabled={importing}
                onClick={() => {
                  setView('list');
                }}
              >
                {messages.cancel}
              </button>
            </form>
          )}
          {view === 'review' && draft && (
            <>
              {saveError && (
                <p role="alert">
                  {saveError === 'storage' ? messages.saveFailed : messages.saveUnexpected}
                </p>
              )}
              <RecipeReview
                draft={draft}
                errors={errors}
                messages={messages}
                saving={saving}
                onChange={setDraft}
                onSave={() => void save()}
                onCancel={() => {
                  setDraft(null);
                  setView('list');
                }}
              />
            </>
          )}
          {view === 'edit' && selected && draft && (
            <>
              {updateError && <p role="alert">{updateErrorMessage}</p>}
              <RecipeReview
                draft={draft}
                errors={errors}
                messages={messages}
                saving={saving}
                editing
                onChange={setDraft}
                onRemoveIngredient={(index) => {
                  setDraft({
                    ...draft,
                    ingredients: draft.ingredients.filter((_, position) => position !== index),
                  });
                  setErrors(null);
                }}
                onSave={() => void updateSelectedRecipe()}
                onCancel={() => {
                  setDraft(null);
                  setErrors(null);
                  setUpdateError(null);
                  setView('detail');
                }}
              />
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
