import type { Language } from '../../language/domain/language';
import type { RecipeCategory } from '../domain/recipe';
import type { RecipeLabel, RecipeLabelFacet } from '../domain/recipe-labels';

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
  readonly edit: string;
  readonly update: string;
  readonly removeIngredient: string;
  readonly updateFailed: string;
  readonly updateUnexpected: string;
  readonly delete: string;
  readonly deleteTitle: string;
  readonly deleteConfirmation: (title: string) => string;
  readonly deleteConfirm: string;
  readonly deleteFailed: string;
  readonly deleteUnexpected: string;
  readonly deleteInUse: string;
  readonly title: string;
  readonly category: string;
  readonly recipeFilters: string;
  readonly activeFilterCount: (count: number) => string;
  readonly categoryFilter: string;
  readonly allRecipes: string;
  readonly uncategorized: string;
  readonly noMatches: string;
  readonly invalidCategory: string;
  readonly categories: Record<RecipeCategory, string>;
  readonly recipeLabels: string;
  readonly labelFilters: string;
  readonly clearLabelFilters: string;
  readonly unlabeled: string;
  readonly invalidLabels: string;
  readonly labelSafetyNote: string;
  readonly selectedLabelCount: (count: number) => string;
  readonly labelFacets: Record<RecipeLabelFacet, string>;
  readonly labels: Record<RecipeLabel, string>;
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
    edit: 'Edit recipe',
    update: 'Save changes',
    removeIngredient: 'Remove ingredient',
    updateFailed: 'Could not update the recipe because local storage failed.',
    updateUnexpected: 'Could not update the recipe. Please try again.',
    delete: 'Delete recipe',
    deleteTitle: 'Delete recipe?',
    deleteConfirmation: (title) =>
      `Are you sure you want to delete “${title}”? This cannot be undone.`,
    deleteConfirm: 'Delete',
    deleteFailed: 'Could not delete the recipe because local storage failed.',
    deleteUnexpected: 'Could not delete the recipe. Please try again.',
    deleteInUse: 'Remove this recipe from all weekly menus before deleting it.',
    title: 'Title',
    category: 'Category',
    recipeFilters: 'Recipe filters',
    activeFilterCount: (count) =>
      count === 1 ? '1 active filter' : `${String(count)} active filters`,
    categoryFilter: 'Filter recipes by category',
    allRecipes: 'All recipes',
    uncategorized: 'Uncategorized',
    noMatches: 'No recipes match the selected filters.',
    invalidCategory: 'Choose a supported recipe category.',
    categories: {
      'breakfast-brunch': 'Breakfast & Brunch',
      'appetizers-snacks': 'Appetizers & Snacks',
      'soups-stews': 'Soups & Stews',
      salads: 'Salads',
      'main-courses': 'Main Courses',
      'side-dishes': 'Side Dishes',
      'breads-baked-goods': 'Breads & Baked Goods',
      desserts: 'Desserts',
      'sauces-condiments': 'Sauces & Condiments',
      beverages: 'Beverages',
    },
    recipeLabels: 'Recipe labels',
    labelFilters: 'Filter by recipe labels',
    clearLabelFilters: 'Clear label filters',
    unlabeled: 'No labels',
    invalidLabels: 'Choose only supported, distinct recipe labels.',
    labelSafetyNote:
      'Dietary and allergen labels are user-assigned and are not verified safety claims.',
    selectedLabelCount: (count) => (count === 1 ? '1 selected' : `${String(count)} selected`),
    labelFacets: {
      mainIngredient: 'Main Ingredient',
      cookingMethod: 'Cooking Method',
      dietaryAllergens: 'Dietary & Allergens',
      cuisineRegion: 'Cuisine / Region',
      mealOccasionEffort: 'Meal Occasion / Effort',
    },
    labels: {
      'main-beef': 'Beef',
      'main-pork': 'Pork',
      'main-poultry': 'Poultry',
      'main-fish': 'Fish',
      'main-seafood': 'Seafood',
      'main-eggs': 'Eggs',
      'main-tofu-tempeh': 'Tofu/Tempeh',
      'main-legumes': 'Legumes',
      'main-pasta-noodles': 'Pasta/Noodles',
      'main-rice-grains': 'Rice/Grains',
      'main-vegetables': 'Vegetables',
      'method-stovetop': 'Stovetop',
      'method-oven-roast': 'Oven/Roast',
      'method-grill-bbq': 'Grill/BBQ',
      'method-slow-cooker': 'Slow Cooker',
      'method-pressure-cooker': 'Pressure Cooker / Instant Pot',
      'method-air-fryer': 'Air Fryer',
      'method-no-cook': 'No-Cook',
      'method-sous-vide': 'Sous Vide',
      'diet-vegetarian': 'Vegetarian',
      'diet-vegan': 'Vegan',
      'diet-gluten-free': 'Gluten-Free',
      'diet-dairy-free': 'Dairy-Free',
      'diet-nut-free': 'Nut-Free',
      'diet-low-carb-keto': 'Low-Carb/Keto',
      'diet-high-protein': 'High-Protein',
      'cuisine-mediterranean': 'Mediterranean',
      'cuisine-italian': 'Italian',
      'cuisine-mexican': 'Mexican',
      'cuisine-japanese': 'Japanese',
      'cuisine-chinese': 'Chinese',
      'cuisine-indian': 'Indian',
      'cuisine-thai': 'Thai',
      'cuisine-french': 'French',
      'cuisine-middle-eastern': 'Middle Eastern',
      'cuisine-american': 'American',
      'occasion-weeknight-quick': 'Weeknight / Quick (less than 30 min)',
      'occasion-meal-prep-freezable': 'Meal Prep / Freezable',
      'occasion-one-pot': 'One-Pot',
      'occasion-entertaining-holiday': 'Entertaining / Holiday',
      'occasion-kid-friendly': 'Kid-Friendly',
    },
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
    edit: 'Editar receta',
    update: 'Guardar cambios',
    removeIngredient: 'Eliminar ingrediente',
    updateFailed: 'No se pudo actualizar la receta porque falló el almacenamiento local.',
    updateUnexpected: 'No se pudo actualizar la receta. Inténtalo de nuevo.',
    delete: 'Eliminar receta',
    deleteTitle: '¿Eliminar receta?',
    deleteConfirmation: (title) =>
      `¿Seguro que quieres eliminar «${title}»? Esta acción no se puede deshacer.`,
    deleteConfirm: 'Eliminar',
    deleteFailed: 'No se pudo eliminar la receta porque falló el almacenamiento local.',
    deleteUnexpected: 'No se pudo eliminar la receta. Inténtalo de nuevo.',
    deleteInUse: 'Quita esta receta de todos los menús semanales antes de eliminarla.',
    title: 'Título',
    category: 'Categoría',
    recipeFilters: 'Filtros de recetas',
    activeFilterCount: (count) =>
      count === 1 ? '1 filtro activo' : `${String(count)} filtros activos`,
    categoryFilter: 'Filtrar recetas por categoría',
    allRecipes: 'Todas las recetas',
    uncategorized: 'Sin categoría',
    noMatches: 'No hay recetas que coincidan con los filtros seleccionados.',
    invalidCategory: 'Elige una categoría de receta válida.',
    categories: {
      'breakfast-brunch': 'Desayunos y brunch',
      'appetizers-snacks': 'Aperitivos y tentempiés',
      'soups-stews': 'Sopas y guisos',
      salads: 'Ensaladas',
      'main-courses': 'Platos principales',
      'side-dishes': 'Guarniciones',
      'breads-baked-goods': 'Panes y productos horneados',
      desserts: 'Postres',
      'sauces-condiments': 'Salsas y condimentos',
      beverages: 'Bebidas',
    },
    recipeLabels: 'Etiquetas de la receta',
    labelFilters: 'Filtrar por etiquetas de receta',
    clearLabelFilters: 'Quitar filtros de etiquetas',
    unlabeled: 'Sin etiquetas',
    invalidLabels: 'Elige solo etiquetas de receta válidas y distintas.',
    labelSafetyNote:
      'Las etiquetas dietéticas y de alérgenos las asigna el usuario y no son garantías de seguridad verificadas.',
    selectedLabelCount: (count) =>
      count === 1 ? '1 seleccionada' : `${String(count)} seleccionadas`,
    labelFacets: {
      mainIngredient: 'Ingrediente principal',
      cookingMethod: 'Método de cocción',
      dietaryAllergens: 'Dietas y alérgenos',
      cuisineRegion: 'Cocina / Región',
      mealOccasionEffort: 'Ocasión / Esfuerzo',
    },
    labels: {
      'main-beef': 'Ternera',
      'main-pork': 'Cerdo',
      'main-poultry': 'Aves',
      'main-fish': 'Pescado',
      'main-seafood': 'Marisco',
      'main-eggs': 'Huevos',
      'main-tofu-tempeh': 'Tofu/Tempeh',
      'main-legumes': 'Legumbres',
      'main-pasta-noodles': 'Pasta/Fideos',
      'main-rice-grains': 'Arroz/Cereales',
      'main-vegetables': 'Verduras',
      'method-stovetop': 'Fogones',
      'method-oven-roast': 'Horno/Asado',
      'method-grill-bbq': 'Parrilla/Barbacoa',
      'method-slow-cooker': 'Olla de cocción lenta',
      'method-pressure-cooker': 'Olla a presión / Instant Pot',
      'method-air-fryer': 'Freidora de aire',
      'method-no-cook': 'Sin cocinar',
      'method-sous-vide': 'Cocción al vacío',
      'diet-vegetarian': 'Vegetariano',
      'diet-vegan': 'Vegano',
      'diet-gluten-free': 'Sin gluten',
      'diet-dairy-free': 'Sin lácteos',
      'diet-nut-free': 'Sin frutos secos',
      'diet-low-carb-keto': 'Bajo en carbohidratos/Keto',
      'diet-high-protein': 'Alto en proteínas',
      'cuisine-mediterranean': 'Mediterránea',
      'cuisine-italian': 'Italiana',
      'cuisine-mexican': 'Mexicana',
      'cuisine-japanese': 'Japonesa',
      'cuisine-chinese': 'China',
      'cuisine-indian': 'India',
      'cuisine-thai': 'Tailandesa',
      'cuisine-french': 'Francesa',
      'cuisine-middle-eastern': 'De Oriente Medio',
      'cuisine-american': 'Estadounidense',
      'occasion-weeknight-quick': 'Entre semana / Rápida (menos de 30 min)',
      'occasion-meal-prep-freezable': 'Preparación anticipada / Congelable',
      'occasion-one-pot': 'En una olla',
      'occasion-entertaining-holiday': 'Celebraciones / Festividades',
      'occasion-kid-friendly': 'Apta para niños',
    },
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
    edit: 'Edita la recepta',
    update: 'Desa els canvis',
    removeIngredient: "Suprimeix l'ingredient",
    updateFailed: "No s'ha pogut actualitzar la recepta perquè ha fallat l'emmagatzematge local.",
    updateUnexpected: "No s'ha pogut actualitzar la recepta. Torna-ho a provar.",
    delete: 'Suprimeix la recepta',
    deleteTitle: 'Vols suprimir la recepta?',
    deleteConfirmation: (title) =>
      `Segur que vols suprimir «${title}»? Aquesta acció no es pot desfer.`,
    deleteConfirm: 'Suprimeix',
    deleteFailed: "No s'ha pogut suprimir la recepta perquè ha fallat l'emmagatzematge local.",
    deleteUnexpected: "No s'ha pogut suprimir la recepta. Torna-ho a provar.",
    deleteInUse: 'Treu aquesta recepta de tots els menús setmanals abans de suprimir-la.',
    title: 'Títol',
    category: 'Categoria',
    recipeFilters: 'Filtres de receptes',
    activeFilterCount: (count) =>
      count === 1 ? '1 filtre actiu' : `${String(count)} filtres actius`,
    categoryFilter: 'Filtra les receptes per categoria',
    allRecipes: 'Totes les receptes',
    uncategorized: 'Sense categoria',
    noMatches: 'No hi ha receptes que coincideixin amb els filtres seleccionats.',
    invalidCategory: 'Tria una categoria de recepta vàlida.',
    categories: {
      'breakfast-brunch': 'Esmorzars i brunch',
      'appetizers-snacks': 'Aperitius i refrigeris',
      'soups-stews': 'Sopes i guisats',
      salads: 'Amanides',
      'main-courses': 'Plats principals',
      'side-dishes': 'Guarnicions',
      'breads-baked-goods': 'Pans i productes al forn',
      desserts: 'Postres',
      'sauces-condiments': 'Salses i condiments',
      beverages: 'Begudes',
    },
    recipeLabels: 'Etiquetes de la recepta',
    labelFilters: 'Filtra per etiquetes de recepta',
    clearLabelFilters: 'Esborra els filtres d’etiquetes',
    unlabeled: 'Sense etiquetes',
    invalidLabels: 'Tria només etiquetes de recepta vàlides i diferents.',
    labelSafetyNote:
      'Les etiquetes dietètiques i d’al·lèrgens les assigna l’usuari i no són garanties de seguretat verificades.',
    selectedLabelCount: (count) =>
      count === 1 ? '1 seleccionada' : `${String(count)} seleccionades`,
    labelFacets: {
      mainIngredient: 'Ingredient principal',
      cookingMethod: 'Mètode de cocció',
      dietaryAllergens: 'Dietes i al·lèrgens',
      cuisineRegion: 'Cuina / Regió',
      mealOccasionEffort: 'Ocasió / Esforç',
    },
    labels: {
      'main-beef': 'Vedella',
      'main-pork': 'Porc',
      'main-poultry': 'Aus',
      'main-fish': 'Peix',
      'main-seafood': 'Marisc',
      'main-eggs': 'Ous',
      'main-tofu-tempeh': 'Tofu/Tempeh',
      'main-legumes': 'Llegums',
      'main-pasta-noodles': 'Pasta/Fideus',
      'main-rice-grains': 'Arròs/Cereals',
      'main-vegetables': 'Verdures',
      'method-stovetop': 'Fogons',
      'method-oven-roast': 'Forn/Rostit',
      'method-grill-bbq': 'Graella/Barbacoa',
      'method-slow-cooker': 'Olla de cocció lenta',
      'method-pressure-cooker': 'Olla de pressió / Instant Pot',
      'method-air-fryer': 'Fregidora d’aire',
      'method-no-cook': 'Sense cocció',
      'method-sous-vide': 'Cocció al buit',
      'diet-vegetarian': 'Vegetarià',
      'diet-vegan': 'Vegà',
      'diet-gluten-free': 'Sense gluten',
      'diet-dairy-free': 'Sense lactis',
      'diet-nut-free': 'Sense fruita seca',
      'diet-low-carb-keto': 'Baix en carbohidrats/Keto',
      'diet-high-protein': 'Alt en proteïnes',
      'cuisine-mediterranean': 'Mediterrània',
      'cuisine-italian': 'Italiana',
      'cuisine-mexican': 'Mexicana',
      'cuisine-japanese': 'Japonesa',
      'cuisine-chinese': 'Xinesa',
      'cuisine-indian': 'Índia',
      'cuisine-thai': 'Tailandesa',
      'cuisine-french': 'Francesa',
      'cuisine-middle-eastern': 'De l’Orient Mitjà',
      'cuisine-american': 'Estatunidenca',
      'occasion-weeknight-quick': 'Entre setmana / Ràpida (menys de 30 min)',
      'occasion-meal-prep-freezable': 'Preparació anticipada / Congelable',
      'occasion-one-pot': 'En una olla',
      'occasion-entertaining-holiday': 'Celebracions / Festivitats',
      'occasion-kid-friendly': 'Apta per a infants',
    },
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
