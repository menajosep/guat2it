import type { Language } from '../../language/domain/language';
import type { Meal } from '../domain/menu-assignment';

interface PlanningMessages {
  select: string;
  selected: string;
  noMenu: string;
  openMenus: string;
  add: string;
  day: string;
  meal: string;
  meals: Record<Meal, string>;
  save: string;
  empty: string;
  remove: (title: string) => string;
  confirmation: (day: string, meal: string) => string;
  duplicate: string;
  missingMenu: string;
  missingRecipe: string;
  invalid: string;
  loadFailed: string;
  saveFailed: string;
  removeFailed: string;
}

export const planningMessages: Record<Language, PlanningMessages> = {
  en: {
    select: 'Select menu',
    selected: 'Selected menu',
    noMenu: 'Select a weekly menu before adding a recipe.',
    openMenus: 'Go to weekly menus',
    add: 'Add to weekly menu',
    day: 'Day',
    meal: 'Meal',
    meals: { lunch: 'Lunch', dinner: 'Dinner' },
    save: 'Add recipe',
    empty: 'No recipes in this meal.',
    remove: (title) => `Remove ${title} from this meal`,
    confirmation: (day, meal) => `Saved for ${day} — ${meal}. Recipes in this meal:`,
    duplicate: 'This recipe is already in this meal.',
    missingMenu: 'This menu is no longer available. Select another menu.',
    missingRecipe: 'This recipe is no longer available.',
    invalid: 'Choose a valid day and meal.',
    loadFailed: 'Could not load menu recipes. Please try again.',
    saveFailed: 'Could not add the recipe. Please try again.',
    removeFailed: 'Could not remove the assignment. Please try again.',
  },
  es: {
    select: 'Seleccionar menú',
    selected: 'Menú seleccionado',
    noMenu: 'Selecciona un menú semanal antes de añadir una receta.',
    openMenus: 'Ir a menús semanales',
    add: 'Añadir al menú semanal',
    day: 'Día',
    meal: 'Comida',
    meals: { lunch: 'Almuerzo', dinner: 'Cena' },
    save: 'Añadir receta',
    empty: 'No hay recetas en esta comida.',
    remove: (title) => `Quitar ${title} de esta comida`,
    confirmation: (day, meal) => `Guardado para ${day} — ${meal}. Recetas de esta comida:`,
    duplicate: 'Esta receta ya está en esta comida.',
    missingMenu: 'Este menú ya no está disponible. Selecciona otro.',
    missingRecipe: 'Esta receta ya no está disponible.',
    invalid: 'Elige un día y una comida válidos.',
    loadFailed: 'No se pudieron cargar las recetas del menú. Inténtalo de nuevo.',
    saveFailed: 'No se pudo añadir la receta. Inténtalo de nuevo.',
    removeFailed: 'No se pudo quitar la asignación. Inténtalo de nuevo.',
  },
  ca: {
    select: 'Selecciona el menú',
    selected: 'Menú seleccionat',
    noMenu: "Selecciona un menú setmanal abans d'afegir una recepta.",
    openMenus: 'Ves als menús setmanals',
    add: 'Afegeix al menú setmanal',
    day: 'Dia',
    meal: 'Àpat',
    meals: { lunch: 'Dinar', dinner: 'Sopar' },
    save: 'Afegeix la recepta',
    empty: 'No hi ha receptes en aquest àpat.',
    remove: (title) => `Treu ${title} d'aquest àpat`,
    confirmation: (day, meal) => `Desat per a ${day} — ${meal}. Receptes d'aquest àpat:`,
    duplicate: 'Aquesta recepta ja és en aquest àpat.',
    missingMenu: 'Aquest menú ja no està disponible. Selecciona un altre menú.',
    missingRecipe: 'Aquesta recepta ja no està disponible.',
    invalid: 'Tria un dia i un àpat vàlids.',
    loadFailed: "No s'han pogut carregar les receptes del menú. Torna-ho a provar.",
    saveFailed: "No s'ha pogut afegir la recepta. Torna-ho a provar.",
    removeFailed: "No s'ha pogut treure l'assignació. Torna-ho a provar.",
  },
};

export function formatMenuDay(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
