import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../language/hooks/language-context';
import { useActiveMenu } from '../hooks/active-menu-context';
import { useWeeklyMenuService } from '../hooks/weekly-menu-service-context';
import {
  menuDays,
  type AssignedRecipe,
  type AssignmentError,
  type Meal,
} from '../domain/menu-assignment';
import { formatMenuDay, planningMessages } from '../messages/planning-messages';

export function AssignRecipe({ recipeId }: { recipeId: string }) {
  const { menu } = useActiveMenu();
  const { language } = useLanguage();
  const messages = planningMessages[language];
  const service = useWeeklyMenuService().assignments;
  const [open, setOpen] = useState(false);
  const [dayOffset, setDayOffset] = useState(0);
  const [meal, setMeal] = useState<Meal>('lunch');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<AssignmentError | 'storage' | null>(null);
  const [confirmation, setConfirmation] = useState<{
    dayOffset: number;
    meal: Meal;
    recipes: AssignedRecipe[];
  } | null>(null);

  if (!menu) {
    return (
      <div>
        <p>{messages.noMenu}</p>
        <Link to="/weekly-menus">{messages.openMenus}</Link>
      </div>
    );
  }

  const days = menuDays(menu.startDate);
  const errorMessages: Record<AssignmentError | 'storage', string> = {
    duplicate: messages.duplicate,
    'menu-not-found': messages.missingMenu,
    'recipe-not-found': messages.missingRecipe,
    'invalid-slot': messages.invalid,
    storage: messages.saveFailed,
  };
  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    setConfirmation(null);
    try {
      const result = await service.add(menu.id, recipeId, dayOffset, meal);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setConfirmation({ dayOffset, meal, recipes: result.value });
    } catch (caught) {
      console.error('Unable to add recipe to menu', caught);
      setError('storage');
    } finally {
      setSaving(false);
    }
  };

  const confirmedDate = confirmation ? days[confirmation.dayOffset] : undefined;
  return (
    <div>
      <p>
        {messages.selected}: {menu.name} — {menu.startDate}
      </p>
      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
          }}
        >
          {messages.add}
        </button>
      )}
      {open && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <label htmlFor="assignment-day">{messages.day}</label>
          <select
            id="assignment-day"
            value={dayOffset}
            disabled={saving}
            onChange={(event) => {
              setDayOffset(Number(event.target.value));
            }}
          >
            {days.map((day, offset) => (
              <option key={offset} value={offset}>
                {formatMenuDay(day, language)}
              </option>
            ))}
          </select>
          <label htmlFor="assignment-meal">{messages.meal}</label>
          <select
            id="assignment-meal"
            value={meal}
            disabled={saving}
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'lunch' || value === 'dinner') setMeal(value);
            }}
          >
            <option value="lunch">{messages.meals.lunch}</option>
            <option value="dinner">{messages.meals.dinner}</option>
          </select>
          <button type="submit" disabled={saving}>
            {messages.save}
          </button>
        </form>
      )}
      {error && <p role="alert">{errorMessages[error]}</p>}
      {confirmation && confirmedDate && (
        <div role="status">
          <p>
            {messages.confirmation(
              formatMenuDay(confirmedDate, language),
              messages.meals[confirmation.meal],
            )}
          </p>
          <ul>
            {confirmation.recipes.map((recipe) => (
              <li key={recipe.recipeId}>{recipe.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
