import {
  IonAlert,
  IonContent,
  IonPage,
  IonSpinner,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import { useCallback, useRef, useState } from 'react';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import { LanguageNotice } from '../../language/components/LanguageNotice';
import { useLanguage } from '../../language/hooks/language-context';
import { ShoppingPageHeader } from '../../shopping-list/components/ShoppingPageHeader';
import { useShoppingListMessages } from '../../shopping-list/hooks/use-shopping-list-messages';
import { localCalendarDate, type WeeklyMenu, type WeeklyMenuErrors } from '../domain/weekly-menu';
import { useWeeklyMenuService } from '../hooks/weekly-menu-service-context';
import { weeklyMenuMessages } from '../messages/weekly-menu-messages';
import { planningMessages } from '../messages/planning-messages';
import { useActiveMenu } from '../hooks/active-menu-context';
import { MenuSlots } from '../components/MenuSlots';

export function WeeklyMenusPage() {
  const service = useWeeklyMenuService();
  const { language } = useLanguage();
  const messages = weeklyMenuMessages[language];
  const planning = planningMessages[language];
  const {
    menu: activeMenu,
    selectMenu,
    deletedMenuIds,
    deletion,
    deleteMenu,
    clearDeletionFeedback,
  } = useActiveMenu();
  const shoppingMessages = useShoppingListMessages();
  const [draft, setDraft] = useState(() => {
    const startDate = localCalendarDate(new Date());
    return { startDate, name: messages.defaultName(startDate) };
  });
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<'storage' | 'unexpected'>('storage');
  const [saveError, setSaveError] = useState<'storage' | 'unexpected' | null>(null);
  const [errors, setErrors] = useState<WeeklyMenuErrors>({});
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<WeeklyMenu | null>(null);
  const savingRef = useRef(false);
  const pendingDeleteRef = useRef<WeeklyMenu | null>(null);
  const loadVersion = useRef(0);
  const visibleMenus = menus.filter((menu) => !deletedMenuIds.has(menu.id));
  const deleting = deletion === 'pending';

  const load = useCallback(async () => {
    const version = ++loadVersion.current;
    setStatus('loading');
    try {
      const saved = await service.list();
      if (version !== loadVersion.current) return;
      setMenus(saved);
      setStatus('ready');
    } catch (error) {
      console.error('Unable to load weekly menus', error);
      if (version !== loadVersion.current) return;
      setLoadError(error instanceof PersistenceError ? 'storage' : 'unexpected');
      setStatus('error');
    }
  }, [service]);

  useIonViewWillEnter(() => {
    void load();
  }, [load]);
  useIonViewWillLeave(() => {
    pendingDeleteRef.current = null;
    setPendingDelete(null);
  }, []);

  const save = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    setCreated(false);
    try {
      const result = await service.create(draft);
      if (!result.ok) {
        setErrors(result.error);
        return;
      }
      loadVersion.current += 1;
      setMenus((previous) => [
        ...previous.filter((menu) => menu.id !== result.value.id),
        result.value,
      ]);
      setStatus('ready');
      setErrors({});
      setDraft((previous) => ({ ...previous, name: messages.defaultName(previous.startDate) }));
      setCreated(true);
    } catch (error) {
      console.error('Unable to save weekly menu', error);
      setSaveError(error instanceof PersistenceError ? 'storage' : 'unexpected');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <ShoppingPageHeader title={shoppingMessages.navigation.weeklyMenus} />
      <IonContent className="ion-padding">
        <div className="page-column weekly-menus">
          <LanguageNotice />
          {deletion === 'deleted' && <p role="status">{messages.deleted}</p>}
          {(deletion === 'storage' || deletion === 'not-found' || deletion === 'unexpected') && (
            <p role="alert">
              {deletion === 'storage'
                ? shoppingMessages.storageFailures['remove-weekly-menu']
                : deletion === 'not-found'
                  ? messages.deleteMissing
                  : messages.deleteUnexpected}
            </p>
          )}
          {status === 'loading' && <IonSpinner aria-label={messages.loading} />}
          {status === 'error' && (
            <>
              <p role="alert">
                {loadError === 'storage'
                  ? shoppingMessages.storageFailures['load-weekly-menus']
                  : messages.loadUnexpected}
              </p>
              <button type="button" onClick={() => void load()}>
                {shoppingMessages.tryAgain}
              </button>
            </>
          )}
          {status === 'ready' && (
            <>
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  void save();
                }}
              >
                <label htmlFor="weekly-start">{messages.startDate}</label>
                <input
                  id="weekly-start"
                  type="date"
                  disabled={saving}
                  value={draft.startDate}
                  aria-describedby="weekly-date-help weekly-date-error"
                  aria-invalid={Boolean(errors.startDate)}
                  onChange={(event) => {
                    const startDate = event.target.value;
                    setDraft({ startDate, name: messages.defaultName(startDate) });
                    setCreated(false);
                  }}
                />
                <p id="weekly-date-help">{messages.dateHelp}</p>
                <div id="weekly-date-error" role="alert">
                  {errors.startDate && messages.invalidDate}
                </div>
                <label htmlFor="weekly-name">{messages.name}</label>
                <input
                  id="weekly-name"
                  disabled={saving}
                  value={draft.name}
                  aria-describedby="weekly-name-error"
                  aria-invalid={Boolean(errors.name)}
                  onChange={(event) => {
                    setDraft({ ...draft, name: event.target.value });
                    setCreated(false);
                  }}
                />
                <div id="weekly-name-error" role="alert">
                  {errors.name === 'empty'
                    ? messages.emptyName
                    : errors.name === 'too-long'
                      ? messages.longName
                      : null}
                </div>
                <button type="submit" disabled={saving}>
                  {messages.create}
                </button>
              </form>
              {saveError && (
                <p role="alert">
                  {saveError === 'storage'
                    ? shoppingMessages.storageFailures['save-weekly-menu']
                    : messages.saveUnexpected}
                </p>
              )}
              {created && <p role="status">{messages.created}</p>}
              <IonAlert
                isOpen={pendingDelete !== null}
                header={
                  pendingDelete
                    ? messages.deletePrompt(pendingDelete.name, pendingDelete.startDate)
                    : ''
                }
                buttons={[
                  { text: messages.deleteCancel, role: 'cancel' },
                  {
                    text: messages.deleteConfirm,
                    role: 'destructive',
                    handler: () => {
                      const target = pendingDeleteRef.current;
                      pendingDeleteRef.current = null;
                      if (target) void deleteMenu(target.id);
                    },
                  },
                ]}
                onDidDismiss={() => {
                  pendingDeleteRef.current = null;
                  setPendingDelete(null);
                }}
              />
              <h2>{messages.list}</h2>
              {visibleMenus.length === 0 ? (
                <p>{messages.empty}</p>
              ) : (
                <ul aria-label={messages.list}>
                  {visibleMenus.map((menu) => (
                    <li key={menu.id}>
                      {menu.name} — <time dateTime={menu.startDate}>{menu.startDate}</time>{' '}
                      <button
                        type="button"
                        aria-pressed={activeMenu?.id === menu.id}
                        onClick={() => {
                          selectMenu(menu);
                        }}
                      >
                        {planning.select}
                      </button>{' '}
                      <button
                        type="button"
                        disabled={deleting || pendingDelete !== null}
                        onClick={() => {
                          pendingDeleteRef.current = menu;
                          setPendingDelete(menu);
                          clearDeletionFeedback();
                          setCreated(false);
                        }}
                      >
                        {messages.deleteMenu(menu.name)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {activeMenu && <MenuSlots key={activeMenu.id} menu={activeMenu} />}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
