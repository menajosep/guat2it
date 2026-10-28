import { setupIonicReact } from '@ionic/react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../app/App';
import { createShoppingListService } from '../app/create-services';
import { ShoppingListService } from '../features/shopping-list/application/shopping-list-service';
import { DexieShoppingItemStore } from '../features/shopping-list/infrastructure/dexie-shopping-item-store';
import { AppDatabase } from '../infrastructure/persistence/app-database';
import { PersistenceError } from '../shared/errors/persistence-error';

setupIonicReact();

let counter = 0;
const uniqueDatabase = (prefix: string) => `${prefix}-${String(++counter)}`;

async function renderApp(databaseName: string) {
  const service = createShoppingListService(databaseName);
  const view = render(<App shoppingListService={service} />);
  await screen.findByText(/shopping list is empty|Bread|Milk|Flour|Storage unavailable/i);
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

type User = ReturnType<typeof userEvent.setup>;

async function editForm(): Promise<HTMLElement> {
  return waitFor(() => {
    const form = document.querySelector<HTMLElement>('.edit-item-form');
    if (!form) throw new Error('the edit form has not rendered yet');
    return form;
  });
}

async function editInput(): Promise<HTMLInputElement> {
  return waitFor(() => {
    const input = document.querySelector<HTMLInputElement>('.edit-item-form ion-input input');
    if (!input) throw new Error('the edit field has not rendered yet');
    return input;
  });
}

/**
 * Once Ionic hydrates a button it moves the aria-label to its inner native button, so row
 * buttons are located through their row instead of by label.
 */
async function rowButton(name: string, kind: 'edit' | 'remove'): Promise<HTMLElement> {
  return waitFor(() => {
    const row = screen.getByText(name).closest('ion-item');
    const selector = kind === 'edit' ? 'ion-button[data-edit-id]' : 'ion-button[color="danger"]';
    const button = row?.querySelector<HTMLElement>(selector);
    if (!button) throw new Error(`no ${kind} button for ${name}`);
    return button;
  });
}

async function startEdit(user: User, name: string) {
  await user.click(await rowButton(name, 'edit'));
  return editInput();
}

async function renameTo(user: User, currentName: string, newName: string) {
  const input = await startEdit(user, currentName);
  await user.clear(input);
  if (newName) await user.type(input, newName);
  await user.click(screen.getByText('Save'));
}

async function amountInput(scope: ParentNode = document): Promise<HTMLInputElement> {
  return waitFor(() => {
    const inputs = scope.querySelectorAll<HTMLInputElement>('ion-input input');
    const input = inputs[1];
    if (!input) throw new Error('the amount field has not rendered yet');
    return input;
  });
}

const unitSelect = (scope: ParentNode = document) =>
  within(scope as HTMLElement).getByLabelText(/^Unit/);

async function addWithQuantity(user: User, name: string, amount: string, unit: string) {
  const input = await nameInput();
  await user.clear(input);
  await user.type(input, name);
  if (amount) await user.type(await amountInput(), amount);
  if (unit) await user.selectOptions(unitSelect(), unit);
  await user.click(screen.getByText('Add item'));
}

/** The form has one alert region per field group, so look the message up by its text. */
async function expectAlert(
  text: string | RegExp,
  scope: Pick<typeof screen, 'findByText'> = screen,
) {
  const message = await scope.findByText(text);
  expect(message.closest('[role="alert"]')).not.toBeNull();
}

const statusMessage = () => within(screen.getByRole('status'));

/** Stores items (fixed ids and creation times) before the app renders; `done` marks completed ones. */
async function seedItems(databaseName: string, items: readonly { name: string; done?: boolean }[]) {
  let counter = 0;
  const seeder = new ShoppingListService({
    store: new DexieShoppingItemStore(new AppDatabase(databaseName)),
    generateId: () => `seed-${String(counter)}`,
    now: () => new Date(Date.UTC(2026, 0, 1, 0, 0, counter)),
  });
  for (const { name, done } of items) {
    counter += 1;
    const added = await seeder.addItem(name);
    if (done && added.ok) await seeder.setCompleted(added.value.id, true);
  }
}

async function renderSeededApp(
  databaseName: string,
  items: readonly { name: string; done?: boolean }[],
) {
  await seedItems(databaseName, items);
  const service = createShoppingListService(databaseName);
  const view = render(<App shoppingListService={service} />);
  await screen.findByText(items[0]?.name ?? '');
  return { service, ...view };
}

const clearCompletedButton = () => screen.queryByText('Clear completed');

async function openClearDialog(user: User): Promise<HTMLElement> {
  const trigger = await screen.findByText('Clear completed');
  await user.click(trigger);
  return screen.findByRole('alertdialog');
}

async function chooseInDialog(user: User, dialog: HTMLElement, name: 'Cancel' | 'Clear') {
  await user.click(within(dialog).getByRole('button', { name }));
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

    await user.click(await rowButton('Milk', 'remove'));
    expect(await screen.findByText(/shopping list is empty/i)).toBeInTheDocument();
    expect(await service.list()).toEqual([]);
  });

  it('shows validation feedback for a blank name and clears it after a valid one', async () => {
    const user = userEvent.setup();
    await renderApp(uniqueDatabase('validation'));

    await addItem(user, '   ');
    await expectAlert('Enter an item name.');
    expect(screen.getByText(/shopping list is empty/i)).toBeInTheDocument();

    await addItem(user, 'Eggs');
    await screen.findByText('Eggs');
    expect(screen.queryByText('Enter an item name.')).not.toBeInTheDocument();
  });

  it('rejects names that are too long', async () => {
    const user = userEvent.setup();
    await renderApp(uniqueDatabase('long'));

    await addItem(user, 'a'.repeat(101));
    await expectAlert(/at most 100 characters/i);
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

  it('renames an item in place, keeping its position and completion state', async () => {
    const user = userEvent.setup();
    const { service } = await renderApp(uniqueDatabase('rename'));
    await addItem(user, 'Milk');
    await addItem(user, 'Bread');
    await screen.findByText('Bread');
    const [milkCheckbox] = within(screen.getByLabelText('Shopping items')).getAllByRole(
      'checkbox',
      {
        hidden: true,
      },
    );
    if (!milkCheckbox) throw new Error('expected the Milk checkbox');
    await user.click(milkCheckbox);
    await waitFor(() => {
      expect(screen.getByText('Milk').closest('ion-checkbox')).toHaveClass('item-completed');
    });

    const input = await startEdit(user, 'Milk');
    expect(input.value).toBe('Milk');
    expect(input).toHaveFocus();
    await user.clear(input);
    await user.type(input, ' Oat milk ');
    await user.click(screen.getByText('Save'));

    const list = screen.getByLabelText('Shopping items');
    await waitFor(() => {
      expect(within(list).getByText('Oat milk')).toBeInTheDocument();
    });
    expect(within(list).queryByText('Milk')).not.toBeInTheDocument();
    expect(document.querySelector('.edit-item-form')).toBeNull();
    expect(within(list).getByText('Oat milk').closest('ion-checkbox')).toHaveClass(
      'item-completed',
    );
    expect((await service.list()).map((i) => [i.name, i.completed])).toEqual([
      ['Oat milk', true],
      ['Bread', false],
    ]);
    expect(statusMessage().getByText('Renamed Milk to Oat milk')).toBeInTheDocument();
  });

  it('saves a rename with the Enter key', async () => {
    const user = userEvent.setup();
    await renderApp(uniqueDatabase('rename-enter'));
    await addItem(user, 'Milk');
    const input = await startEdit(user, 'Milk');
    await user.clear(input);
    await user.type(input, 'Eggs{Enter}');

    expect(await rowButton('Eggs', 'edit')).toBeInTheDocument();
    expect(document.querySelector('.edit-item-form')).toBeNull();
  });

  it('keeps the old name and the editor open when the new name is invalid', async () => {
    const user = userEvent.setup();
    const { service } = await renderApp(uniqueDatabase('rename-invalid'));
    await addItem(user, 'Milk');

    await renameTo(user, 'Milk', '   ');
    const form = await editForm();
    await expectAlert('Enter an item name.', within(form));
    expect(statusMessage().queryByText(/Renamed/)).not.toBeInTheDocument();
    expect((await service.list())[0]?.name).toBe('Milk');

    const input = await editInput();
    await user.clear(input);
    await user.type(input, 'a'.repeat(101));
    await user.click(screen.getByText('Save'));
    expect(await within(form).findByText(/at most 100 characters/i)).toBeInTheDocument();
    expect((await service.list())[0]?.name).toBe('Milk');
  });

  it('cancels an edit with the Cancel button or Escape without any message', async () => {
    const user = userEvent.setup();
    const { service } = await renderApp(uniqueDatabase('rename-cancel'));
    await addItem(user, 'Bread');
    await screen.findByText('Bread');

    let input = await startEdit(user, 'Bread');
    await user.clear(input);
    await user.type(input, 'Rye');
    await user.click(screen.getByText('Cancel'));
    expect(document.querySelector('.edit-item-form')).toBeNull();

    input = await startEdit(user, 'Bread');
    await user.type(input, 'x{Escape}');
    expect(document.querySelector('.edit-item-form')).toBeNull();

    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect((await service.list())[0]?.name).toBe('Bread');
    expect(statusMessage().queryByText(/Renamed/)).not.toBeInTheDocument();
  });

  it('closes the editor without a message when the name is unchanged', async () => {
    const user = userEvent.setup();
    await renderApp(uniqueDatabase('rename-same'));
    await addItem(user, 'Bread');
    await screen.findByText('Bread');

    await startEdit(user, 'Bread');
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(document.querySelector('.edit-item-form')).toBeNull();
    });
    expect(statusMessage().queryByText(/Renamed/)).not.toBeInTheDocument();
  });

  it('allows duplicate names and edits one row at a time', async () => {
    const user = userEvent.setup();
    const { service } = await renderApp(uniqueDatabase('rename-duplicate'));
    await addItem(user, 'Milk');
    await addItem(user, 'Bread');
    await screen.findByText('Bread');

    await startEdit(user, 'Milk');
    await user.click(await rowButton('Bread', 'edit'));
    await waitFor(() => {
      expect(document.querySelectorAll('.edit-item-form')).toHaveLength(1);
    });
    expect(await rowButton('Milk', 'edit')).toBeInTheDocument();

    const input = await editInput();
    await user.clear(input);
    await user.type(input, 'Milk');
    await user.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(document.querySelector('.edit-item-form')).toBeNull();
    });
    expect((await service.list()).map((i) => i.name)).toEqual(['Milk', 'Milk']);
  });

  it('keeps the editor and the typed name when a rename cannot be stored, and the error can be dismissed', async () => {
    const user = userEvent.setup();
    const { service } = await renderApp(uniqueDatabase('rename-failure'));
    await addItem(user, 'Milk');
    await screen.findByText('Milk');
    vi.spyOn(service, 'updateItem').mockRejectedValueOnce(new PersistenceError('Could not save.'));

    await renameTo(user, 'Milk', 'Oat milk');
    const message = await screen.findByText('Could not save.');
    expect(message.closest('[role="alert"]')).not.toBeNull();
    expect((await editInput()).value).toBe('Oat milk');
    expect((await service.list())[0]?.name).toBe('Milk');

    const dismiss = document.querySelector<HTMLElement>('.feedback-toast-error ion-button');
    if (!dismiss) throw new Error('expected a dismiss button');
    await user.click(dismiss);
    expect(screen.queryByText('Could not save.')).not.toBeInTheDocument();
  });

  it('reports the outcome of adding, completing, reactivating and removing an item', async () => {
    const user = userEvent.setup();
    await renderApp(uniqueDatabase('feedback'));

    await addItem(user, 'Milk');
    expect(await statusMessage().findByText('Added Milk')).toBeInTheDocument();

    const checkbox = within(await screen.findByLabelText('Shopping items')).getByRole('checkbox', {
      hidden: true,
    });
    await user.click(checkbox);
    expect(await statusMessage().findByText('Marked Milk as completed')).toBeInTheDocument();
    expect(statusMessage().queryByText('Added Milk')).not.toBeInTheDocument();

    await user.click(checkbox);
    expect(await statusMessage().findByText('Marked Milk as active')).toBeInTheDocument();

    await user.click(await rowButton('Milk', 'remove'));
    expect(await statusMessage().findByText('Removed Milk')).toBeInTheDocument();
  });

  it('does not repeat validation errors as operation messages', async () => {
    const user = userEvent.setup();
    await renderApp(uniqueDatabase('feedback-validation'));

    await addItem(user, '   ');
    await expectAlert('Enter an item name.');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('shows an error message when completing or removing an item cannot be stored', async () => {
    const user = userEvent.setup();
    const { service } = await renderApp(uniqueDatabase('feedback-failure'));
    await addItem(user, 'Milk');
    const checkbox = within(await screen.findByLabelText('Shopping items')).getByRole('checkbox', {
      hidden: true,
    });
    vi.spyOn(service, 'setCompleted').mockRejectedValueOnce(
      new PersistenceError('Could not update.'),
    );
    vi.spyOn(service, 'removeItem').mockRejectedValueOnce(
      new PersistenceError('Could not remove.'),
    );

    await user.click(checkbox);
    expect(await screen.findByText('Could not update.')).toBeInTheDocument();

    await user.click(await rowButton('Milk', 'remove'));
    expect(await screen.findByText('Could not remove.')).toBeInTheDocument();
    expect(screen.queryByText('Could not update.')).not.toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('shows "Clear completed" only while at least one item is completed', async () => {
    const user = userEvent.setup();
    const { service } = await renderSeededApp(uniqueDatabase('clear-visibility'), [
      { name: 'Milk' },
      { name: 'Bread' },
    ]);
    expect(clearCompletedButton()).not.toBeInTheDocument();

    const [milkCheckbox] = within(screen.getByLabelText('Shopping items')).getAllByRole(
      'checkbox',
      { hidden: true },
    );
    if (!milkCheckbox) throw new Error('expected the Milk checkbox');
    await user.click(milkCheckbox);
    expect(await screen.findByText('Clear completed')).toBeInTheDocument();

    await user.click(milkCheckbox);
    await waitFor(() => {
      expect(clearCompletedButton()).not.toBeInTheDocument();
    });
    expect((await service.list()).every((item) => !item.completed)).toBe(true);
  });

  it('does not show "Clear completed" for an empty list', async () => {
    await renderApp(uniqueDatabase('clear-empty'));
    expect(clearCompletedButton()).not.toBeInTheDocument();
  });

  it('asks for confirmation with the number of items before removing anything', async () => {
    const user = userEvent.setup();
    const { service } = await renderSeededApp(uniqueDatabase('clear-confirm'), [
      { name: 'Milk', done: true },
      { name: 'Eggs', done: true },
      { name: 'Bread' },
    ]);

    const dialog = await openClearDialog(user);
    expect(dialog).toHaveAccessibleName('Clear completed items?');
    expect(dialog).toHaveAccessibleDescription('This removes 2 completed items from the list.');
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(await service.list()).toHaveLength(3);
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('uses singular wording for a single completed item', async () => {
    const user = userEvent.setup();
    await renderSeededApp(uniqueDatabase('clear-singular'), [{ name: 'Milk', done: true }]);

    const dialog = await openClearDialog(user);
    expect(dialog).toHaveAccessibleDescription('This removes 1 completed item from the list.');
  });

  it('removes only completed items when confirmed and reports how many', async () => {
    const user = userEvent.setup();
    const { service } = await renderSeededApp(uniqueDatabase('clear-confirmed'), [
      { name: 'Milk', done: true },
      { name: 'Bread' },
      { name: 'Eggs', done: true },
      { name: 'Rice' },
    ]);

    const dialog = await openClearDialog(user);
    await chooseInDialog(user, dialog, 'Clear');

    expect(await statusMessage().findByText('Cleared 2 completed items')).toBeInTheDocument();
    const list = screen.getByLabelText('Shopping items');
    expect(within(list).queryByText('Milk')).not.toBeInTheDocument();
    expect(within(list).queryByText('Eggs')).not.toBeInTheDocument();
    expect(
      within(list)
        .getAllByRole('checkbox', { hidden: true })
        .map((box) => box.closest('ion-checkbox')?.textContent),
    ).toEqual(['Bread', 'Rice']);
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(clearCompletedButton()).not.toBeInTheDocument();
    expect((await service.list()).map((item) => item.name)).toEqual(['Bread', 'Rice']);
  });

  it('keeps cleared items cleared after the app is loaded again', async () => {
    const user = userEvent.setup();
    const databaseName = uniqueDatabase('clear-reload');
    const first = await renderSeededApp(databaseName, [
      { name: 'Milk', done: true },
      { name: 'Bread' },
    ]);
    await chooseInDialog(user, await openClearDialog(user), 'Clear');
    await statusMessage().findByText('Cleared 1 completed item');
    first.unmount();

    await renderApp(databaseName);
    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect(screen.queryByText('Milk')).not.toBeInTheDocument();
  });

  it('shows the empty-list message when every item was completed', async () => {
    const user = userEvent.setup();
    await renderSeededApp(uniqueDatabase('clear-all'), [{ name: 'Milk', done: true }]);

    await chooseInDialog(user, await openClearDialog(user), 'Clear');
    expect(await screen.findByText(/shopping list is empty/i)).toBeInTheDocument();
  });

  it('changes nothing when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const { service } = await renderSeededApp(uniqueDatabase('clear-cancel'), [
      { name: 'Milk', done: true },
    ]);

    await chooseInDialog(user, await openClearDialog(user), 'Cancel');
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(await service.list()).toHaveLength(1);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('changes nothing when the confirmation is dismissed with Escape', async () => {
    const user = userEvent.setup();
    const { service } = await renderSeededApp(uniqueDatabase('clear-escape'), [
      { name: 'Milk', done: true },
    ]);

    await openClearDialog(user);
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(await service.list()).toHaveLength(1);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('keeps an item that was reactivated before the clearing was confirmed', async () => {
    const user = userEvent.setup();
    const { service } = await renderSeededApp(uniqueDatabase('clear-reactivated'), [
      { name: 'Milk', done: true },
      { name: 'Eggs', done: true },
    ]);

    const dialog = await openClearDialog(user);
    const milk = (await service.list()).find((item) => item.name === 'Milk');
    if (!milk) throw new Error('expected Milk to be stored');
    await service.setCompleted(milk.id, false);
    await chooseInDialog(user, dialog, 'Clear');

    expect(await statusMessage().findByText('Cleared 1 completed item')).toBeInTheDocument();
    expect((await service.list()).map((item) => item.name)).toEqual(['Milk']);
  });

  it('keeps every item and shows an error when clearing cannot be stored', async () => {
    const user = userEvent.setup();
    const { service } = await renderSeededApp(uniqueDatabase('clear-failure'), [
      { name: 'Milk', done: true },
      { name: 'Bread' },
    ]);
    vi.spyOn(service, 'clearCompleted').mockRejectedValueOnce(
      new PersistenceError('Could not remove the items.'),
    );

    await chooseInDialog(user, await openClearDialog(user), 'Clear');

    const message = await screen.findByText('Could not remove the items.');
    expect(message.closest('[role="alert"]')).not.toBeNull();
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect(await service.list()).toHaveLength(2);
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

  describe('amount and unit', () => {
    it('adds an item with amount and unit and clears the fields', async () => {
      const user = userEvent.setup();
      await renderApp(uniqueDatabase('quantity-add'));

      await addWithQuantity(user, 'Flour', '500', 'gram');

      expect(await screen.findByText('500 grams')).toBeInTheDocument();
      expect(screen.getByText('Flour')).toBeInTheDocument();
      expect((await nameInput()).value).toBe('');
      expect((await amountInput()).value).toBe('');
      expect(unitSelect()).toHaveValue('');
      expect(await statusMessage().findByText('Added Flour')).toBeInTheDocument();
    });

    it('adds an item without a quantity', async () => {
      const user = userEvent.setup();
      await renderApp(uniqueDatabase('quantity-none'));

      await addItem(user, 'Milk');

      expect(await screen.findByText('Milk')).toBeInTheDocument();
      expect(document.querySelector('.item-quantity')).toBeNull();
    });

    it('accepts a decimal comma and pluralizes by amount', async () => {
      const user = userEvent.setup();
      await renderApp(uniqueDatabase('quantity-plural'));

      await addWithQuantity(user, 'Salt', '0,5', 'teaspoon');
      await screen.findByText('0.5 teaspoons');
      await addWithQuantity(user, 'Rice', '1', 'cup');
      await screen.findByText('1 cup');
      await addWithQuantity(user, 'Oats', '2', 'cup');
      expect(await screen.findByText('2 cups')).toBeInTheDocument();
    });

    it('announces an amount without a unit and adds nothing', async () => {
      const user = userEvent.setup();
      const { service } = await renderApp(uniqueDatabase('quantity-unit-required'));

      await addWithQuantity(user, 'Flour', '2', '');

      await expectAlert('Choose a unit for the amount.');
      expect(await service.list()).toEqual([]);
      expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });

    it('announces a unit that needs an amount and adds nothing', async () => {
      const user = userEvent.setup();
      const { service } = await renderApp(uniqueDatabase('quantity-amount-required'));

      await addWithQuantity(user, 'Flour', '', 'cup');

      expect(await screen.findByText('Enter an amount for this unit.')).toBeInTheDocument();
      expect(await service.list()).toEqual([]);
    });

    it.each(['0', '1.234', '10000', 'abc'])('rejects the invalid amount %j', async (amount) => {
      const user = userEvent.setup();
      const { service } = await renderApp(uniqueDatabase('quantity-invalid'));

      await addWithQuantity(user, 'Flour', amount, 'cup');

      expect(await screen.findByText(/positive amount up to 9999.99/)).toBeInTheDocument();
      expect(await service.list()).toEqual([]);
    });

    it('disables and clears the amount for a unit that takes none', async () => {
      const user = userEvent.setup();
      await renderApp(uniqueDatabase('quantity-to-taste'));

      await user.type(await nameInput(), 'Pepper');
      await user.type(await amountInput(), '3');
      await user.selectOptions(unitSelect(), 'to taste');
      await waitFor(async () => {
        expect(await amountInput()).toBeDisabled();
      });
      expect((await amountInput()).value).toBe('');

      await user.click(screen.getByText('Add item'));
      expect(await screen.findByText('to taste', { selector: 'ion-note' })).toBeInTheDocument();
    });

    it('still validates the name together with the quantity', async () => {
      const user = userEvent.setup();
      await renderApp(uniqueDatabase('quantity-name'));

      await addWithQuantity(user, '   ', '2', 'cup');

      expect(await screen.findByText('Enter an item name.')).toBeInTheDocument();
    });

    it('keeps the quantity when completing and after a reload', async () => {
      const user = userEvent.setup();
      const database = uniqueDatabase('quantity-persist');
      await renderApp(database);
      await addWithQuantity(user, 'Flour', '500', 'gram');
      await screen.findByText('500 grams');

      const checkbox = within(await screen.findByLabelText('Shopping items')).getByRole(
        'checkbox',
        { hidden: true },
      );
      await user.click(checkbox);
      await waitFor(() => {
        expect(screen.getByText('Flour').closest('ion-checkbox')).toHaveClass('item-completed');
      });
      expect(screen.getByText('500 grams')).toBeInTheDocument();

      cleanup();
      await renderApp(database);
      expect(await screen.findByText('500 grams')).toBeInTheDocument();
    });

    it('lists items stored without a quantity and lets the user add one', async () => {
      const user = userEvent.setup();
      const { service } = await renderApp(uniqueDatabase('quantity-legacy'));
      await addItem(user, 'Milk');
      await screen.findByText('Milk');

      await startEdit(user, 'Milk');
      const form = await editForm();
      await user.type(await amountInput(form), '1');
      await user.selectOptions(unitSelect(form), 'liter');
      await user.click(screen.getByText('Save'));

      expect(await screen.findByText('1 liter')).toBeInTheDocument();
      expect((await service.list())[0]).toMatchObject({ amount: 1, unit: 'liter' });
    });

    it('prefills the editor, saves a new quantity and reports "Updated"', async () => {
      const user = userEvent.setup();
      const { service } = await renderApp(uniqueDatabase('quantity-edit'));
      await addWithQuantity(user, 'Flour', '500', 'gram');
      await screen.findByText('500 grams');

      await startEdit(user, 'Flour');
      const form = await editForm();
      expect((await amountInput(form)).value).toBe('500');
      expect(unitSelect(form)).toHaveValue('gram');

      const amount = await amountInput(form);
      await user.clear(amount);
      await user.type(amount, '2');
      await user.selectOptions(unitSelect(form), 'kilogram');
      await user.click(screen.getByText('Save'));

      expect(await screen.findByText('2 kilograms')).toBeInTheDocument();
      expect(document.querySelector('.edit-item-form')).toBeNull();
      expect(await statusMessage().findByText('Updated Flour')).toBeInTheDocument();
      expect((await service.list())[0]).toMatchObject({
        name: 'Flour',
        amount: 2,
        unit: 'kilogram',
      });
    });

    it('clears the quantity from the editor', async () => {
      const user = userEvent.setup();
      await renderApp(uniqueDatabase('quantity-clear'));
      await addWithQuantity(user, 'Flour', '500', 'gram');
      await screen.findByText('500 grams');

      await startEdit(user, 'Flour');
      const form = await editForm();
      await user.clear(await amountInput(form));
      await user.selectOptions(unitSelect(form), '');
      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.queryByText('500 grams')).not.toBeInTheDocument();
      });
      expect(screen.getByText('Flour')).toBeInTheDocument();
    });

    it('keeps the editor open and the item unchanged for an invalid quantity', async () => {
      const user = userEvent.setup();
      const { service } = await renderApp(uniqueDatabase('quantity-edit-invalid'));
      await addWithQuantity(user, 'Flour', '500', 'gram');
      await screen.findByText('500 grams');

      await startEdit(user, 'Flour');
      const form = await editForm();
      await user.selectOptions(unitSelect(form), '');
      await user.click(screen.getByText('Save'));

      expect(await within(form).findByText('Choose a unit for the amount.')).toBeInTheDocument();
      expect(document.querySelector('.edit-item-form')).not.toBeNull();
      expect((await service.list())[0]).toMatchObject({ amount: 500, unit: 'gram' });
      expect(screen.getByRole('status')).not.toHaveTextContent(/Updated|Renamed/);
    });

    it('discards quantity changes on cancel or Escape', async () => {
      const user = userEvent.setup();
      const { service } = await renderApp(uniqueDatabase('quantity-edit-cancel'));
      await addWithQuantity(user, 'Flour', '500', 'gram');
      await screen.findByText('500 grams');

      await startEdit(user, 'Flour');
      let form = await editForm();
      await user.selectOptions(unitSelect(form), 'kilogram');
      await user.click(screen.getByText('Cancel'));
      expect(document.querySelector('.edit-item-form')).toBeNull();

      await startEdit(user, 'Flour');
      form = await editForm();
      await user.selectOptions(unitSelect(form), 'cup');
      await user.type(await amountInput(form), '{Escape}');
      expect(document.querySelector('.edit-item-form')).toBeNull();

      expect(screen.getByText('500 grams')).toBeInTheDocument();
      expect((await service.list())[0]).toMatchObject({ amount: 500, unit: 'gram' });
      expect(screen.getByRole('status')).not.toHaveTextContent(/Updated|Renamed/);
    });
  });
});
