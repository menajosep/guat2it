import type { Language } from '../../language/domain/language';

interface TransferMessages {
  readonly start: string;
  readonly review: string;
  readonly loading: string;
  readonly empty: string;
  readonly sourceRecipe: (title: string, day: number, meal: string) => string;
  readonly sourceShopping: string;
  readonly unspecified: string;
  readonly unit: (name: string) => string;
  readonly chooseUnit: string;
  readonly noQuantity: string;
  readonly amount: (name: string) => string;
  readonly manual: string;
  readonly acceptVague: string;
  readonly proposed: string;
  readonly confirm: string;
  readonly cancel: string;
  readonly pending: string;
  readonly success: string;
  readonly stale: string;
  readonly menuMissing: string;
  readonly recipeMissing: string;
  readonly invalid: string;
  readonly storage: string;
  readonly unexpected: string;
  readonly loadFailed: string;
}

export const transferMessages: Record<Language, TransferMessages> = {
  en: {
    start: 'Add menu ingredients to shopping list',
    review: 'Review menu ingredients',
    loading: 'Loading ingredients',
    empty: 'This menu has no ingredients to transfer.',
    sourceRecipe: (title, day, meal) => `${title} — day ${String(day)} — ${meal}`,
    sourceShopping: 'Shopping list',
    unspecified: 'No quantity',
    unit: (name) => `Final unit for ${name}`,
    chooseUnit: 'Choose a unit',
    noQuantity: 'No quantity',
    amount: (name) => `Final amount for ${name}`,
    manual: 'These quantities cannot be combined exactly. Enter and confirm a final quantity.',
    acceptVague: 'Use this quantity',
    proposed: 'Proposed total',
    confirm: 'Add ingredients',
    cancel: 'Cancel',
    pending: 'Adding ingredients',
    success: 'Menu ingredients added to the shopping list.',
    stale: 'The menu or shopping list changed. Review the current ingredients again.',
    menuMissing: 'This weekly menu is no longer available.',
    recipeMissing: 'A recipe in this menu is no longer available.',
    invalid: 'Review the quantities before adding ingredients.',
    storage: 'Could not add ingredients because local storage failed. Please try again.',
    unexpected: 'Could not add ingredients. Please try again.',
    loadFailed: 'Could not load ingredients for review. Please try again.',
  },
  es: {
    start: 'Añadir ingredientes del menú a la lista de compra',
    review: 'Revisar ingredientes del menú',
    loading: 'Cargando ingredientes',
    empty: 'Este menú no tiene ingredientes para añadir.',
    sourceRecipe: (title, day, meal) => `${title} — día ${String(day)} — ${meal}`,
    sourceShopping: 'Lista de compra',
    unspecified: 'Sin cantidad',
    unit: (name) => `Unidad final para ${name}`,
    chooseUnit: 'Elige una unidad',
    noQuantity: 'Sin cantidad',
    amount: (name) => `Cantidad final para ${name}`,
    manual:
      'Estas cantidades no se pueden combinar exactamente. Introduce y confirma una cantidad final.',
    acceptVague: 'Usar esta cantidad',
    proposed: 'Total propuesto',
    confirm: 'Añadir ingredientes',
    cancel: 'Cancelar',
    pending: 'Añadiendo ingredientes',
    success: 'Ingredientes del menú añadidos a la lista de compra.',
    stale: 'El menú o la lista de compra ha cambiado. Revisa de nuevo los ingredientes actuales.',
    menuMissing: 'Este menú semanal ya no está disponible.',
    recipeMissing: 'Una receta de este menú ya no está disponible.',
    invalid: 'Revisa las cantidades antes de añadir los ingredientes.',
    storage:
      'No se pudieron añadir los ingredientes por un fallo del almacenamiento local. Inténtalo de nuevo.',
    unexpected: 'No se pudieron añadir los ingredientes. Inténtalo de nuevo.',
    loadFailed: 'No se pudieron cargar los ingredientes para revisarlos. Inténtalo de nuevo.',
  },
  ca: {
    start: 'Afegeix els ingredients del menú a la llista de la compra',
    review: 'Revisa els ingredients del menú',
    loading: 'Carregant ingredients',
    empty: 'Aquest menú no té ingredients per afegir.',
    sourceRecipe: (title, day, meal) => `${title} — dia ${String(day)} — ${meal}`,
    sourceShopping: 'Llista de la compra',
    unspecified: 'Sense quantitat',
    unit: (name) => `Unitat final per a ${name}`,
    chooseUnit: 'Tria una unitat',
    noQuantity: 'Sense quantitat',
    amount: (name) => `Quantitat final per a ${name}`,
    manual:
      'Aquestes quantitats no es poden combinar exactament. Introdueix i confirma una quantitat final.',
    acceptVague: 'Fes servir aquesta quantitat',
    proposed: 'Total proposat',
    confirm: 'Afegeix els ingredients',
    cancel: 'Cancel·la',
    pending: 'Afegint ingredients',
    success: 'Ingredients del menú afegits a la llista de la compra.',
    stale: 'El menú o la llista de la compra ha canviat. Revisa de nou els ingredients actuals.',
    menuMissing: 'Aquest menú setmanal ja no està disponible.',
    recipeMissing: "Una recepta d'aquest menú ja no està disponible.",
    invalid: "Revisa les quantitats abans d'afegir els ingredients.",
    storage:
      "No s'han pogut afegir els ingredients per una fallada de l'emmagatzematge local. Torna-ho a provar.",
    unexpected: "No s'han pogut afegir els ingredients. Torna-ho a provar.",
    loadFailed: "No s'han pogut carregar els ingredients per revisar-los. Torna-ho a provar.",
  },
};
