import { setupIonicReact } from '@ionic/react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../app/App';
import { createLanguageService, createShoppingListService } from '../app/create-services';
import { PersistenceError } from '../shared/errors/persistence-error';

setupIonicReact();

type User = ReturnType<typeof userEvent.setup>;

let counter = 0;
const uniqueDatabase = () => `language-${String(++counter)}`;

function renderApp(options: { databaseName?: string; storage?: Storage } = {}) {
  const service = createShoppingListService(options.databaseName ?? uniqueDatabase());
  const view = render(
    <App shoppingListService={service} languageService={createLanguageService(options.storage)} />,
  );
  return { service, ...view };
}

const languageSelect = (name: string) => screen.findByRole('combobox', { name });

async function nameInput(): Promise<HTMLInputElement> {
  return waitFor(() => {
    const input = document.querySelector<HTMLInputElement>('ion-input input');
    if (!input) throw new Error('ion-input has not rendered its native input yet');
    return input;
  });
}

async function choose(user: User, current: string, option: string) {
  await user.selectOptions(await languageSelect(current), option);
}

function storageThatCannotSave(): Storage {
  const failing = Object.create(localStorage) as Storage;
  failing.setItem = () => {
    throw new Error('quota exceeded');
  };
  return failing;
}

describe('interface language', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.documentElement.lang = '';
  });

  it('starts in English and offers each language written in itself', async () => {
    renderApp();
    expect(await screen.findByText('Shopping list')).toBeInTheDocument();

    const select = await languageSelect('Language');
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent);
    expect(options).toEqual(['English', 'Español', 'Català']);
    expect(select).toHaveValue('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('switches the whole interface at once and back', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Shopping list');

    await choose(user, 'Language', 'Català');
    expect(await screen.findByText('Llista de la compra')).toBeInTheDocument();
    expect(screen.getByText('Afegeix un article')).toBeInTheDocument();
    expect(screen.getByText(/La teva llista de la compra és buida/)).toBeInTheDocument();
    expect(screen.queryByText('Shopping list')).not.toBeInTheDocument();
    expect(await languageSelect('Idioma')).toHaveValue('ca');
    expect(document.documentElement.lang).toBe('ca');

    await choose(user, 'Idioma', 'Español');
    expect(await screen.findByText('Lista de la compra')).toBeInTheDocument();
    expect(screen.getByText('Añadir artículo')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('es');

    await choose(user, 'Idioma', 'English');
    expect(await screen.findByText('Shopping list')).toBeInTheDocument();
    expect(await languageSelect('Language')).toHaveValue('en');
  });

  it('keeps the text typed in a form and the stored items when the language changes', async () => {
    const user = userEvent.setup();
    const { service } = renderApp();
    await service.addItem('Milk', { amount: '2', unit: 'tablespoon' });
    await screen.findByText('Shopping list');
    await screen.findByText('Milk');

    await user.type(await nameInput(), 'Flour');
    await choose(user, 'Language', 'Español');

    await screen.findByText('Lista de la compra');
    expect(await nameInput()).toHaveValue('Flour');
    expect(screen.getByText('Milk')).toBeInTheDocument();
    const stored = await service.list();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ name: 'Milk', amount: 2, unit: 'tablespoon' });
  });

  it('shows units in the selected language while storing only the unit id', async () => {
    const user = userEvent.setup();
    const { service } = renderApp();
    await service.addItem('Flour', { amount: '2', unit: 'tablespoon' });
    await service.addItem('Salt', { amount: '', unit: 'to-taste' });
    expect(await screen.findByText('2 tablespoons')).toBeInTheDocument();

    await choose(user, 'Language', 'Español');
    expect(await screen.findByText('2 cucharadas')).toBeInTheDocument();
    expect(screen.getByText('al gusto')).toBeInTheDocument();

    await choose(user, 'Idioma', 'Català');
    expect(await screen.findByText('2 cullerades')).toBeInTheDocument();
    expect(screen.getByText('al gust')).toBeInTheDocument();

    const stored = await service.list();
    expect(stored.map((item) => item.unit)).toEqual(['tablespoon', 'to-taste']);
  });

  it('offers the unit names in the selected language in the same order', async () => {
    const user = userEvent.setup();
    renderApp();
    await choose(user, 'Language', 'Español');
    const units = await screen.findByRole('combobox', { name: 'Unidad' });
    const labels = Array.from(units.querySelectorAll('option')).map((o) => o.textContent);
    expect(labels.slice(0, 4)).toEqual(['Sin unidad', 'al gusto', 'un poco', 'barra']);
    expect(labels).toHaveLength(40);
    expect(screen.getByRole('combobox', { name: 'Unidad' })).toBeInTheDocument();
  });

  it('words validation and operation messages in the selected language', async () => {
    const user = userEvent.setup();
    renderApp();
    await choose(user, 'Language', 'Español');
    await screen.findByText('Añadir artículo');

    await user.click(screen.getByText('Añadir artículo'));
    expect(await screen.findByText('Escribe el nombre del artículo.')).toBeInTheDocument();

    await user.type(await nameInput(), 'Milk');
    await user.click(screen.getByText('Añadir artículo'));
    expect(await screen.findByRole('status')).toHaveTextContent('Añadido Milk');
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('shows a message that is already visible in the newly selected language', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(await nameInput(), 'Milk');
    await user.click(await screen.findByText('Add item'));
    expect(await screen.findByRole('status')).toHaveTextContent('Added Milk');

    await choose(user, 'Language', 'Català');
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent("S'ha afegit Milk");
    });
  });

  it('words storage failures in the selected language', async () => {
    const user = userEvent.setup();
    const { service } = renderApp();
    await screen.findByText('Shopping list');
    await choose(user, 'Language', 'Català');
    await screen.findByText('Llista de la compra');

    vi.spyOn(service, 'addItem').mockRejectedValueOnce(
      new PersistenceError('Could not save the item because local storage failed.', {
        action: 'save-item',
      }),
    );
    await user.type(await nameInput(), 'Milk');
    await user.click(screen.getByText('Afegeix un article'));

    const message = await screen.findByText(
      "No s'ha pogut desar l'article perquè ha fallat l'emmagatzematge local.",
    );
    expect(message.closest('[role="alert"]')).not.toBeNull();
  });

  it('keeps the chosen language after a reload', async () => {
    const user = userEvent.setup();
    const databaseName = uniqueDatabase();
    const first = renderApp({ databaseName });
    await choose(user, 'Language', 'Español');
    await screen.findByText('Lista de la compra');
    first.unmount();

    renderApp({ databaseName });
    expect(await screen.findByText('Lista de la compra')).toBeInTheDocument();
    expect(await languageSelect('Idioma')).toHaveValue('es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('starts in the device language when it is supported, including regional variants', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR', 'ca-ES']);
    renderApp();
    expect(await screen.findByText('Llista de la compra')).toBeInTheDocument();
  });

  it('starts in Spanish for es-MX and in English for unsupported languages', async () => {
    const languages = vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-MX']);
    renderApp();
    expect(await screen.findByText('Lista de la compra')).toBeInTheDocument();
    cleanup();

    languages.mockReturnValue(['fr-FR']);
    renderApp();
    expect(await screen.findByText('Shopping list')).toBeInTheDocument();
  });

  it('prefers the saved choice over the device language', async () => {
    localStorage.setItem('guat2it.language', 'en');
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es']);
    renderApp();
    expect(await screen.findByText('Shopping list')).toBeInTheDocument();
  });

  it('ignores a saved value that is not a supported language', async () => {
    localStorage.setItem('guat2it.language', 'klingon');
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ca']);
    renderApp();
    expect(await screen.findByText('Llista de la compra')).toBeInTheDocument();
  });

  it('still changes the language when the choice cannot be remembered, and says so', async () => {
    const user = userEvent.setup();
    renderApp({ storage: storageThatCannotSave() });
    await choose(user, 'Language', 'Español');

    expect(await screen.findByText('Lista de la compra')).toBeInTheDocument();
    const message = await screen.findByText(
      'No se pudo recordar tu elección de idioma en este dispositivo.',
    );
    expect(message.closest('[role="alert"]')).not.toBeNull();
  });
});
