import type { Language } from '../../language/domain/language';

export interface RecipeMessages {
  readonly empty: string;
  readonly loading: string;
  readonly import: string;
  readonly sourceUrl: string;
  readonly sourceHtml: string;
  readonly sourceHelp: string;
  readonly nativeSourceHelp: string;
  readonly extract: string;
  readonly downloading: string;
  readonly back: string;
  readonly title: string;
  readonly yield: string;
  readonly ingredients: string;
  readonly addIngredient: string;
  readonly instructions: string;
  readonly imageUrl: string;
  readonly imageUnavailable: string;
  readonly original: string;
  readonly ingredientName: string;
  readonly confirmIngredient: string;
  readonly save: string;
  readonly cancel: string;
  readonly invalidUrl: string;
  readonly tooLarge: string;
  readonly noRecipe: string;
  readonly importUnexpected: string;
  readonly networkError: string;
  readonly httpError: string;
  readonly redirectError: string;
  readonly timeoutError: string;
  readonly encodingError: string;
  readonly required: string;
  readonly invalidYield: string;
  readonly invalidImage: string;
  readonly missingIngredients: string;
  readonly confirmRequired: string;
  readonly loadFailed: string;
  readonly saveFailed: string;
  readonly loadUnexpected: string;
  readonly saveUnexpected: string;
  readonly missingRecipe: string;
}

export const recipeMessages: Record<Language, RecipeMessages> = {
  en: {
    empty: 'No recipes yet.',
    loading: 'Loading recipes',
    import: 'Import recipe',
    sourceUrl: 'Recipe URL',
    sourceHtml: 'Page source',
    sourceHelp:
      'Open the recipe in your browser, copy its page source, and paste it here with the recipe URL.',
    nativeSourceHelp: 'Enter the Directo al Paladar recipe URL to download and review it.',
    extract: 'Review recipe',
    downloading: 'Downloading recipe',
    back: 'Back to recipes',
    title: 'Title',
    yield: 'Yield',
    ingredients: 'Ingredients',
    addIngredient: 'Add ingredient',
    instructions: 'Instructions',
    imageUrl: 'Picture URL',
    imageUnavailable: 'Picture unavailable',
    original: 'Original ingredient',
    ingredientName: 'Ingredient name',
    confirmIngredient: 'I have reviewed this ingredient',
    save: 'Save recipe',
    cancel: 'Cancel',
    invalidUrl: 'Enter a valid HTTPS Directo al Paladar recipe URL.',
    tooLarge: 'The page source is too large.',
    noRecipe: 'No usable recipe was found in the page source.',
    importUnexpected: 'Could not read the page source. Please try again.',
    networkError: 'Could not download the recipe. Check your connection and try again.',
    httpError: 'The recipe website could not provide this page.',
    redirectError: 'The recipe page redirected to an unsupported address or too many times.',
    timeoutError: 'The recipe download timed out. Please try again.',
    encodingError: 'The recipe page uses an unsupported text encoding.',
    required: 'This field is required.',
    invalidYield: 'Enter a positive yield number.',
    invalidImage: 'Enter a valid HTTPS picture URL.',
    missingIngredients: 'At least one ingredient is required.',
    confirmRequired: 'Review and confirm this ingredient.',
    loadFailed: 'Could not load recipes because local storage failed.',
    saveFailed: 'Could not save the recipe because local storage failed.',
    loadUnexpected: 'Could not load recipes. Please try again.',
    saveUnexpected: 'Could not save the recipe. Please try again.',
    missingRecipe: 'This recipe is no longer available.',
  },
  es: {
    empty: 'Todavía no hay recetas.',
    loading: 'Cargando recetas',
    import: 'Importar receta',
    sourceUrl: 'URL de la receta',
    sourceHtml: 'Código fuente de la página',
    sourceHelp:
      'Abre la receta en el navegador, copia el código fuente de la página y pégalo aquí junto con la URL de la receta.',
    nativeSourceHelp:
      'Introduce la URL de la receta de Directo al Paladar para descargarla y revisarla.',
    extract: 'Revisar receta',
    downloading: 'Descargando receta',
    back: 'Volver a recetas',
    title: 'Título',
    yield: 'Raciones',
    ingredients: 'Ingredientes',
    addIngredient: 'Añadir ingrediente',
    instructions: 'Instrucciones',
    imageUrl: 'URL de la imagen',
    imageUnavailable: 'Imagen no disponible',
    original: 'Ingrediente original',
    ingredientName: 'Nombre del ingrediente',
    confirmIngredient: 'He revisado este ingrediente',
    save: 'Guardar receta',
    cancel: 'Cancelar',
    invalidUrl: 'Introduce una URL HTTPS válida de una receta de Directo al Paladar.',
    tooLarge: 'El código fuente de la página es demasiado grande.',
    noRecipe: 'No se encontró una receta válida en el código fuente.',
    importUnexpected: 'No se pudo leer el código fuente. Inténtalo de nuevo.',
    networkError: 'No se pudo descargar la receta. Comprueba tu conexión e inténtalo de nuevo.',
    httpError: 'El sitio web de recetas no pudo proporcionar esta página.',
    redirectError:
      'La página de la receta redirigió a una dirección no admitida o demasiadas veces.',
    timeoutError: 'La descarga de la receta tardó demasiado. Inténtalo de nuevo.',
    encodingError: 'La página de la receta usa una codificación de texto no admitida.',
    required: 'Este campo es obligatorio.',
    invalidYield: 'Introduce un número positivo de raciones.',
    invalidImage: 'Introduce una URL HTTPS válida para la imagen.',
    missingIngredients: 'Se necesita al menos un ingrediente.',
    confirmRequired: 'Revisa y confirma este ingrediente.',
    loadFailed: 'No se pudieron cargar las recetas porque falló el almacenamiento local.',
    saveFailed: 'No se pudo guardar la receta porque falló el almacenamiento local.',
    loadUnexpected: 'No se pudieron cargar las recetas. Inténtalo de nuevo.',
    saveUnexpected: 'No se pudo guardar la receta. Inténtalo de nuevo.',
    missingRecipe: 'Esta receta ya no está disponible.',
  },
  ca: {
    empty: 'Encara no hi ha receptes.',
    loading: 'Carregant receptes',
    import: 'Importa una recepta',
    sourceUrl: 'URL de la recepta',
    sourceHtml: 'Codi font de la pàgina',
    sourceHelp:
      'Obre la recepta al navegador, copia el codi font de la pàgina i enganxa’l aquí amb la URL de la recepta.',
    nativeSourceHelp:
      'Introdueix la URL de la recepta de Directo al Paladar per descarregar-la i revisar-la.',
    extract: 'Revisa la recepta',
    downloading: 'Descarregant la recepta',
    back: 'Torna a les receptes',
    title: 'Títol',
    yield: 'Racions',
    ingredients: 'Ingredients',
    addIngredient: 'Afegeix un ingredient',
    instructions: 'Instruccions',
    imageUrl: 'URL de la imatge',
    imageUnavailable: 'Imatge no disponible',
    original: 'Ingredient original',
    ingredientName: "Nom de l'ingredient",
    confirmIngredient: 'He revisat aquest ingredient',
    save: 'Desa la recepta',
    cancel: 'Cancel·la',
    invalidUrl: 'Introdueix una URL HTTPS vàlida d’una recepta de Directo al Paladar.',
    tooLarge: 'El codi font de la pàgina és massa gran.',
    noRecipe: "No s'ha trobat cap recepta vàlida al codi font.",
    importUnexpected: "No s'ha pogut llegir el codi font. Torna-ho a provar.",
    networkError: "No s'ha pogut descarregar la recepta. Comprova la connexió i torna-ho a provar.",
    httpError: 'El lloc web de receptes no ha pogut proporcionar aquesta pàgina.',
    redirectError: 'La pàgina de la recepta ha redirigit a una adreça no admesa o massa vegades.',
    timeoutError: 'La descàrrega de la recepta ha trigat massa. Torna-ho a provar.',
    encodingError: 'La pàgina de la recepta fa servir una codificació de text no admesa.',
    required: 'Aquest camp és obligatori.',
    invalidYield: 'Introdueix un nombre positiu de racions.',
    invalidImage: 'Introdueix una URL HTTPS vàlida per a la imatge.',
    missingIngredients: 'Cal almenys un ingredient.',
    confirmRequired: 'Revisa i confirma aquest ingredient.',
    loadFailed: "No s'han pogut carregar les receptes perquè ha fallat l'emmagatzematge local.",
    saveFailed: "No s'ha pogut desar la recepta perquè ha fallat l'emmagatzematge local.",
    loadUnexpected: "No s'han pogut carregar les receptes. Torna-ho a provar.",
    saveUnexpected: "No s'ha pogut desar la recepta. Torna-ho a provar.",
    missingRecipe: 'Aquesta recepta ja no està disponible.',
  },
};
