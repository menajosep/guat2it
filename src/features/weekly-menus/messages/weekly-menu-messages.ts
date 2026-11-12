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
  readonly deleteMenu: (name: string) => string;
  readonly deletePrompt: (name: string, date: string) => string;
  readonly deleteConfirm: string;
  readonly deleteCancel: string;
  readonly deleted: string;
  readonly deleteMissing: string;
  readonly deleteUnexpected: string;
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
    deleteMenu: (name) => `Delete menu ${name}`,
    deletePrompt: (name, date) =>
      `Delete “${name}” (${date})? Its assignments will be removed, but saved recipes will be kept.`,
    deleteConfirm: 'Delete',
    deleteCancel: 'Cancel',
    deleted: 'Weekly menu deleted.',
    deleteMissing: 'This weekly menu is no longer available.',
    deleteUnexpected: 'Could not delete the weekly menu. Please try again.',
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
    deleteMenu: (name) => `Eliminar menú ${name}`,
    deletePrompt: (name, date) =>
      `¿Eliminar «${name}» (${date})? Se quitarán sus asignaciones, pero se conservarán las recetas guardadas.`,
    deleteConfirm: 'Eliminar',
    deleteCancel: 'Cancelar',
    deleted: 'Menú semanal eliminado.',
    deleteMissing: 'Este menú semanal ya no está disponible.',
    deleteUnexpected: 'No se pudo eliminar el menú semanal. Inténtalo de nuevo.',
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
    deleteMenu: (name) => `Suprimeix el menú ${name}`,
    deletePrompt: (name, date) =>
      `Vols suprimir «${name}» (${date})? Se'n trauran les assignacions, però es conservaran les receptes desades.`,
    deleteConfirm: 'Suprimeix',
    deleteCancel: 'Cancel·la',
    deleted: 'Menú setmanal suprimit.',
    deleteMissing: 'Aquest menú setmanal ja no està disponible.',
    deleteUnexpected: "No s'ha pogut suprimir el menú setmanal. Torna-ho a provar.",
    defaultName: (date) => `Menú setmanal (${date})`,
  },
};
