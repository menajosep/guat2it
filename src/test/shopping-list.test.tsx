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

const statusMessage = () => within(screen.getByRole('status'));

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
    expect(await within(form).findByRole('alert')).toHaveTextContent('Enter an item name.');
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
    vi.spyOn(service, 'renameItem').mockRejectedValueOnce(new PersistenceError('Could not save.'));

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
    expect(await screen.findByRole('alert')).toHaveTextContent('Enter an item name.');
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
