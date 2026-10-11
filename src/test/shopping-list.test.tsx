import { setupIonicReact } from '@ionic/react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../app/App';
import { createShoppingListService } from '../app/create-services';
import { PersistenceError } from '../shared/errors/persistence-error';

setupIonicReact();

let counter = 0;
const uniqueDatabase = (prefix: string) => `${prefix}-${String(++counter)}`;

async function renderApp(databaseName: string) {
  const service = createShoppingListService(databaseName);
  const view = render(<App shoppingListService={service} />);
  await screen.findByText(/shopping list is empty|Bread|Milk|Storage unavailable/i);
  return { service, ...view };
}

/** Ionic renders its native input inside <ion-input> once the component has hydrated. */
async function nameInput(): Promise<HTMLInputElement> {
  return waitFor(() => {
    const input = document.querySelector<HTMLInputElement>('ion-input input');
    if (!input) throw new Error('ion-input has not rendered its native input yet');
    return input;
  });
}

async function addItem(user: ReturnType<typeof userEvent.setup>, name: string) {
  const input = await nameInput();
  await user.clear(input);
  if (name) await user.type(input, name);
  await user.click(screen.getByText('Add item'));
}

describe('shopping list', () => {
  afterEach(cleanup);

  it('supports the add, complete and remove flow', async () => {
    const user = userEvent.setup();
    const { service } = await renderApp(uniqueDatabase('flow'));
    expect(screen.getByText(/shopping list is empty/i)).toBeInTheDocument();

    await addItem(user, 'Milk');
    const list = await screen.findByLabelText('Shopping items');
    expect(within(list).getByText('Milk')).toBeInTheDocument();
    expect(screen.queryByText(/shopping list is empty/i)).not.toBeInTheDocument();

    const checkbox = within(list).getByRole('checkbox', { hidden: true });
    const milk = () => within(list).getByText('Milk').closest('ion-checkbox');

    await user.click(checkbox);
    await waitFor(() => {
      expect(milk()).toHaveClass('item-completed');
    });
    expect((await service.list())[0]?.completed).toBe(true);

    await user.click(checkbox);
    await waitFor(() => {
      expect(milk()).not.toHaveClass('item-completed');
    });
    expect((await service.list())[0]?.completed).toBe(false);

    await user.click(screen.getByLabelText('Remove Milk'));
    expect(await screen.findByText(/shopping list is empty/i)).toBeInTheDocument();
    expect(await service.list()).toEqual([]);
  });

  it('shows validation feedback for a blank name and clears it after a valid one', async () => {
    const user = userEvent.setup();
    await renderApp(uniqueDatabase('validation'));

    await addItem(user, '   ');
    expect(await screen.findByRole('alert')).toHaveTextContent('Enter an item name.');
    expect(screen.getByText(/shopping list is empty/i)).toBeInTheDocument();

    await addItem(user, 'Eggs');
    await screen.findByText('Eggs');
    expect(screen.queryByText('Enter an item name.')).not.toBeInTheDocument();
  });

  it('rejects names that are too long', async () => {
    const user = userEvent.setup();
    await renderApp(uniqueDatabase('long'));

    await addItem(user, 'a'.repeat(101));
    expect(await screen.findByRole('alert')).toHaveTextContent(/at most 100 characters/i);
  });

  it('restores items after the app is loaded again', async () => {
    const user = userEvent.setup();
    const databaseName = uniqueDatabase('reload');
    const first = await renderApp(databaseName);
    await addItem(user, 'Bread');
    await screen.findByText('Bread');
    first.unmount();

    await renderApp(databaseName);
    expect(screen.getByText('Bread')).toBeInTheDocument();
  });

  it('reports a failed save and keeps the typed name', async () => {
    const user = userEvent.setup();
    const { service } = await renderApp(uniqueDatabase('save-error'));
    vi.spyOn(service, 'addItem').mockRejectedValueOnce(new PersistenceError('Could not save.'));

    await addItem(user, 'Milk');
    const message = await screen.findByText('Could not save.');
    expect(message.closest('[role="alert"]')).not.toBeNull();
    expect((await nameInput()).value).toBe('Milk');
    expect(screen.getByText(/shopping list is empty/i)).toBeInTheDocument();
  });

  it('shows an error with a retry when loading fails', async () => {
    const user = userEvent.setup();
    const service = createShoppingListService(uniqueDatabase('error'));
    const list = vi.spyOn(service, 'list').mockRejectedValueOnce(new Error('Storage unavailable'));
    render(<App shoppingListService={service} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Storage unavailable');

    await user.click(screen.getByText('Try again'));
    expect(await screen.findByText(/shopping list is empty/i)).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(2);
  });
});
