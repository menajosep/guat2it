import { IonContent, IonPage, IonSpinner, useIonViewWillEnter } from '@ionic/react';
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
import type { Recipe, RecipeDraft, RecipeErrors } from '../domain/recipe';
import { useRecipeService } from '../hooks/recipe-service-context';
import { recipeMessages } from '../messages/recipe-messages';

type View = 'list' | 'import' | 'review' | 'detail';
type Status = 'loading' | 'ready' | 'error';

export function RecipesPage() {
  const service = useRecipeService();
  const { language } = useLanguage();
  const messages = recipeMessages[language];
  const shoppingMessages = useShoppingListMessages();
  const [view, setView] = useState<View>('list');
  const [status, setStatus] = useState<Status>('loading');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [source, setSource] = useState('');
  const [importError, setImportError] = useState<ImportError | 'unexpected' | null>(null);
  const [draft, setDraft] = useState<RecipeDraft | null>(null);
  const [errors, setErrors] = useState<RecipeErrors | null>(null);
  const [loadError, setLoadError] = useState<'storage' | 'unexpected'>('storage');
  const [saveError, setSaveError] = useState<'storage' | 'unexpected' | null>(null);
  const [saving, setSaving] = useState(false);
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
                    <ul>
                      {recipes.map((recipe) => (
                        <li key={recipe.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(recipe);
                              setView('detail');
                            }}
                          >
                            {recipe.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </>
          )}
          {view === 'detail' && selected && (
            <>
              <button
                type="button"
                onClick={() => {
                  setView('list');
                }}
              >
                {messages.back}
              </button>
              <h1>{selected.title}</h1>
              <RecipeImage
                key={selected.imageUrl}
                url={selected.imageUrl}
                description={selected.title}
                unavailable={messages.imageUnavailable}
              />
              <p>
                {messages.yield}: {selected.yield}
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
        </div>
      </IonContent>
    </IonPage>
  );
}
