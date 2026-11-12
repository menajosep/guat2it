import { IonAlert, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../language/hooks/language-context';
import { useShoppingListMessages } from '../../shopping-list/hooks/use-shopping-list-messages';
import { MEALS, menuDays, type AssignedRecipe } from '../domain/menu-assignment';
import type { WeeklyMenu } from '../domain/weekly-menu';
import { useWeeklyMenuService } from '../hooks/weekly-menu-service-context';
import { formatMenuDay, planningMessages } from '../messages/planning-messages';

export function MenuSlots({ menu }: { menu: WeeklyMenu }) {
  const service = useWeeklyMenuService().assignments;
  const { language } = useLanguage();
  const messages = planningMessages[language];
  const common = useShoppingListMessages();
  const [assignments, setAssignments] = useState<AssignedRecipe[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'missing'>('loading');
  const [removeError, setRemoveError] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [pending, setPending] = useState<{ assignment: AssignedRecipe; date: Date } | null>(null);
  const pendingRef = useRef<{ assignment: AssignedRecipe; date: Date } | null>(null);
  const removingRef = useRef(false);
  const version = useRef(0);

  const load = useCallback(() => {
    const request = ++version.current;
    return service
      .list(menu.id)
      .then((result) => {
        if (request !== version.current) return;
        if (!result.ok) {
          setStatus('missing');
          return;
        }
        setAssignments(result.value);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        console.error('Unable to load menu assignments', error);
        if (request === version.current) setStatus('error');
      });
  }, [menu.id, service]);

  useEffect(() => {
    void load();
    return () => {
      version.current += 1;
      pendingRef.current = null;
    };
  }, [load]);
  useIonViewWillEnter(() => {
    setStatus('loading');
    void load();
  }, [load]);
  useIonViewWillLeave(() => {
    pendingRef.current = null;
    setPending(null);
  }, []);

  const remove = async (item: AssignedRecipe) => {
    if (removingRef.current) return;
    removingRef.current = true;
    setRemoving(true);
    setRemoveError(false);
    try {
      const result = await service.remove(item);
      if (!result.ok) {
        setRemoveError(true);
        return;
      }
      version.current += 1;
      setAssignments((current) =>
        current.filter(
          (entry) =>
            !(
              entry.recipeId === item.recipeId &&
              entry.dayOffset === item.dayOffset &&
              entry.meal === item.meal
            ),
        ),
      );
    } catch (error) {
      console.error('Unable to remove menu assignment', error);
      setRemoveError(true);
    } finally {
      removingRef.current = false;
      setRemoving(false);
    }
  };

  if (status === 'loading')
    return (
      <p>
        {messages.selected}: {menu.name}
      </p>
    );
  if (status === 'missing') return <p role="alert">{messages.missingMenu}</p>;
  if (status === 'error') {
    return (
      <>
        <p role="alert">{messages.loadFailed}</p>
        <button
          type="button"
          onClick={() => {
            setStatus('loading');
            void load();
          }}
        >
          {common.tryAgain}
        </button>
      </>
    );
  }

  return (
    <section aria-label={`${messages.selected}: ${menu.name}`}>
      <h2>
        {messages.selected}: {menu.name} — {menu.startDate}
      </h2>
      {removeError && <p role="alert">{messages.removeFailed}</p>}
      <IonAlert
        isOpen={pending !== null}
        header={
          pending
            ? messages.removeConfirmation(
                pending.assignment.title,
                formatMenuDay(pending.date, language),
                messages.meals[pending.assignment.meal],
              )
            : ''
        }
        buttons={[
          { text: messages.removeCancel, role: 'cancel' },
          {
            text: messages.removeConfirm,
            role: 'destructive',
            handler: () => {
              const target = pendingRef.current;
              pendingRef.current = null;
              if (target) void remove(target.assignment);
            },
          },
        ]}
        onDidDismiss={() => {
          pendingRef.current = null;
          setPending(null);
        }}
      />
      {menuDays(menu.startDate).map((date, offset) => (
        <section key={offset}>
          <h3>{formatMenuDay(date, language)}</h3>
          {MEALS.map((meal) => {
            const slot = assignments.filter(
              (item) => item.dayOffset === offset && item.meal === meal,
            );
            return (
              <section key={meal}>
                <h4>{messages.meals[meal]}</h4>
                {slot.length === 0 ? (
                  <p>{messages.empty}</p>
                ) : (
                  <ul>
                    {slot.map((item) => (
                      <li key={item.recipeId}>
                        {item.title}{' '}
                        <button
                          type="button"
                          disabled={removing || pending !== null}
                          onClick={() => {
                            const target = { assignment: item, date };
                            pendingRef.current = target;
                            setPending(target);
                          }}
                        >
                          {messages.remove(item.title)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </section>
      ))}
    </section>
  );
}
