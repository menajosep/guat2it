import type { Language } from '../../language/domain/language';

interface WeeklyMenuMessages {
  readonly startDate: string;
  readonly name: string;
  readonly dateHelp: string;
  readonly create: string;
  readonly empty: string;
  readonly list: string;
  readonly loading: string;
  readonly created: string;
  readonly invalidDate: string;
  readonly emptyName: string;
  readonly longName: string;
  readonly loadUnexpected: string;
  readonly saveUnexpected: string;
  readonly defaultName: (date: string) => string;
}

export const weeklyMenuMessages: Record<Language, WeeklyMenuMessages> = {
  en: {
    startDate: 'Start date',
    name: 'Menu name',
    dateHelp: 'Changing the start date resets the menu name.',
    create: 'Create weekly menu',
    empty: 'No weekly menus yet.',
    list: 'Saved weekly menus',
    loading: 'Loading weekly menus',
    created: 'Weekly menu created.',
    invalidDate: 'Choose a valid start date.',
    emptyName: 'Enter a menu name.',
    longName: 'Menu names can have at most 100 characters.',
    loadUnexpected: 'Could not load weekly menus. Please try again.',
    saveUnexpected: 'Could not save the weekly menu. Please try again.',
    defaultName: (date) => `Weekly menu (${date})`,
  },
  es: {
    startDate: 'Fecha de inicio',
    name: 'Nombre del menú',
    dateHelp: 'Cambiar la fecha de inicio restablece el nombre del menú.',
    create: 'Crear menú semanal',
    empty: 'Todavía no hay menús semanales.',
    list: 'Menús semanales guardados',
    loading: 'Cargando menús semanales',
    created: 'Menú semanal creado.',
    invalidDate: 'Elige una fecha de inicio válida.',
    emptyName: 'Introduce un nombre para el menú.',
    longName: 'Los nombres de menú pueden tener hasta 100 caracteres.',
    loadUnexpected: 'No se pudieron cargar los menús semanales. Inténtalo de nuevo.',
    saveUnexpected: 'No se pudo guardar el menú semanal. Inténtalo de nuevo.',
    defaultName: (date) => `Menú semanal (${date})`,
  },
  ca: {
    startDate: "Data d'inici",
    name: 'Nom del menú',
    dateHelp: "Canviar la data d'inici restableix el nom del menú.",
    create: 'Crea un menú setmanal',
    empty: 'Encara no hi ha menús setmanals.',
    list: 'Menús setmanals desats',
    loading: 'Carregant menús setmanals',
    created: 'Menú setmanal creat.',
    invalidDate: "Tria una data d'inici vàlida.",
    emptyName: 'Introdueix un nom per al menú.',
    longName: 'Els noms de menú poden tenir fins a 100 caràcters.',
    loadUnexpected: "No s'han pogut carregar els menús setmanals. Torna-ho a provar.",
    saveUnexpected: "No s'ha pogut desar el menú setmanal. Torna-ho a provar.",
    defaultName: (date) => `Menú setmanal (${date})`,
  },
};
