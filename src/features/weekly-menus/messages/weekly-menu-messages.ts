import type { Language } from '../../language/domain/language';

interface WeeklyMenuMessages {
  readonly startDate: string;
  readonly name: string;
  readonly servings: string;
  readonly servingsHelp: string;
  readonly servingsInvalid: string;
  readonly servingsRequired: string;
  readonly servingsUnknown: string;
  readonly servingsValue: (count: number) => string;
  readonly editServings: (name: string, date: string) => string;
  readonly saveServings: string;
  readonly cancelServings: string;
  readonly servingsSaved: string;
  readonly servingsMissing: string;
  readonly servingsStorage: string;
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
    servings: 'Servings',
    servingsHelp: 'Enter a positive whole number.',
    servingsInvalid: 'Enter a positive whole number of servings.',
    servingsRequired: 'Save a serving count before transferring this menu’s ingredients.',
    servingsUnknown: 'Serving count needed',
    servingsValue: (count) => `${String(count)} servings`,
    editServings: (name, date) => `Edit servings for ${name} (${date})`,
    saveServings: 'Save servings',
    cancelServings: 'Cancel',
    servingsSaved: 'Menu servings saved.',
    servingsMissing: 'This weekly menu is no longer available.',
    servingsStorage: 'Could not save menu servings because local storage failed. Please try again.',
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
    servings: 'Comensales',
    servingsHelp: 'Introduce un número entero positivo.',
    servingsInvalid: 'Introduce un número entero positivo de comensales.',
    servingsRequired: 'Guarda el número de comensales antes de añadir los ingredientes del menú.',
    servingsUnknown: 'Falta indicar los comensales',
    servingsValue: (count) => `${String(count)} comensales`,
    editServings: (name, date) => `Editar comensales de ${name} (${date})`,
    saveServings: 'Guardar comensales',
    cancelServings: 'Cancelar',
    servingsSaved: 'Comensales del menú guardados.',
    servingsMissing: 'Este menú semanal ya no está disponible.',
    servingsStorage:
      'No se pudieron guardar los comensales por un fallo de almacenamiento. Inténtalo de nuevo.',
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
    servings: 'Comensals',
    servingsHelp: 'Introdueix un nombre enter positiu.',
    servingsInvalid: 'Introdueix un nombre enter positiu de comensals.',
    servingsRequired: 'Desa el nombre de comensals abans d’afegir els ingredients del menú.',
    servingsUnknown: 'Falta indicar els comensals',
    servingsValue: (count) => `${String(count)} comensals`,
    editServings: (name, date) => `Edita els comensals de ${name} (${date})`,
    saveServings: 'Desa els comensals',
    cancelServings: 'Cancel·la',
    servingsSaved: 'S’han desat els comensals del menú.',
    servingsMissing: 'Aquest menú setmanal ja no està disponible.',
    servingsStorage:
      "No s'han pogut desar els comensals per una fallada de l'emmagatzematge. Torna-ho a provar.",
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
