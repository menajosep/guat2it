import { IonApp, setupIonicReact } from '@ionic/react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createWeeklyMenuService } from '../app/create-services';
import type { Language } from '../features/language/domain/language';
import { LanguageContextProvider } from '../features/language/hooks/language-context';
import type { WeeklyMenuService } from '../features/weekly-menus/application/weekly-menu-service';
import { MenuSlots } from '../features/weekly-menus/components/MenuSlots';
import { WeeklyMenuServiceProvider } from '../features/weekly-menus/hooks/weekly-menu-service-context';
import { AppDatabase } from '../infrastructure/persistence/app-database';

setupIonicReact();

let counter = 0;
const menu = { id: 'menu', name: 'Family', startDate: '2026-11-18', servings: 4 };
const otherMenu = { id: 'other', name: 'Other', startDate: '2026-11-18', servings: 4 };

function firstButton(buttons: HTMLElement[]): HTMLElement {
  const first = buttons[0];
  if (!first) throw new Error('Expected a removal button.');
  return first;
}

async function setup(title = 'Soup') {
  const name = `menu-removal-${String(++counter)}`;
  const db = new AppDatabase(name);
  await db.weeklyMenus.bulkAdd([menu, otherMenu]);
  await db.recipes.add({
    id: 'recipe',
    title,
    sourceUrl: 'https://www.directoalpaladar.com/example',
    yield: 4,
    ingredients: [{ name: 'lentils', amount: 200, unit: 'gram' }],
    instructions: 'Cook.',
    imageUrl: 'https://example.com/image.jpg',
  });
  const service = createWeeklyMenuService(name);
  await service.assignments.add(menu.id, 'recipe', 0, 'lunch');
  await service.assignments.add(menu.id, 'recipe', 1, 'dinner');
  await service.assignments.add(otherMenu.id, 'recipe', 0, 'lunch');
  return { db, service };
}

function slotView(service: WeeklyMenuService, language: Language = 'en', selected = menu) {
  return (
    <IonApp>
      <LanguageContextProvider
        value={{ language, setLanguage: () => undefined, notRemembered: false }}
      >
        <WeeklyMenuServiceProvider value={service}>
          <MenuSlots key={selected.id} menu={selected} />
        </WeeklyMenuServiceProvider>
      </LanguageContextProvider>
    </IonApp>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('requires confirmation, supports cancel and dismissal, and removes only the chosen slot', async () => {
  const { db, service } = await setup();
  const remove = vi.spyOn(service.assignments, 'remove');
  const user = userEvent.setup();
  render(slotView(service));
  const buttons = await screen.findAllByRole('button', { name: 'Remove Soup from this meal' });
  await user.click(firstButton(buttons));
  let dialog = await screen.findByRole('alertdialog');
  expect(dialog).toHaveTextContent('Soup');
  expect(dialog).toHaveTextContent('Wednesday, November 18, 2026');
  expect(dialog).toHaveTextContent('Lunch');
  expect(remove).not.toHaveBeenCalled();
  await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(remove).not.toHaveBeenCalled();
  expect(await db.menuAssignments.count()).toBe(3);

  await user.click(
    firstButton(screen.getAllByRole('button', { name: 'Remove Soup from this meal' })),
  );
  await screen.findByRole('alertdialog');
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(remove).not.toHaveBeenCalled();

  await user.click(
    firstButton(screen.getAllByRole('button', { name: 'Remove Soup from this meal' })),
  );
  dialog = await screen.findByRole('alertdialog');
  await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
  await waitFor(() => {
    expect(remove).toHaveBeenCalledOnce();
  });
  await waitFor(() => {
    expect(screen.getAllByRole('button', { name: 'Remove Soup from this meal' })).toHaveLength(1);
  });
  expect(await db.menuAssignments.toArray()).toMatchObject([
    { menuId: 'menu', dayOffset: 1, meal: 'dinner' },
    { menuId: 'other', dayOffset: 0, meal: 'lunch' },
  ]);
  expect(await db.recipes.get('recipe')).toBeDefined();
  db.close();
});

it.each(['failure', 'missing'])(
  'reports %s after confirmation and retains the displayed slot',
  async (kind) => {
    const { db, service } = await setup();
    const remove = vi.spyOn(service.assignments, 'remove');
    if (kind === 'failure') remove.mockRejectedValueOnce(new Error('Storage unavailable'));
    else remove.mockResolvedValueOnce({ ok: false, error: 'not-found' });
    const user = userEvent.setup();
    render(slotView(service));
    await user.click(
      firstButton(await screen.findAllByRole('button', { name: 'Remove Soup from this meal' })),
    );
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not remove the assignment');
    expect(screen.getAllByRole('button', { name: 'Remove Soup from this meal' })).toHaveLength(2);
    expect(await db.menuAssignments.count()).toBe(3);
    db.close();
  },
);

it('updates the open prompt on language changes and renders recipe text safely', async () => {
  const title = '<img src=x onerror=alert(1)> & <b>Soup</b>';
  const { db, service } = await setup(title);
  const user = userEvent.setup();
  const view = render(slotView(service));
  await user.click(
    firstButton(await screen.findAllByRole('button', { name: `Remove ${title} from this meal` })),
  );
  const dialog = await screen.findByRole('alertdialog');
  await waitFor(() => {
    expect(dialog).toHaveTextContent(title);
  });
  expect(dialog.querySelector('img, b')).toBeNull();
  view.rerender(slotView(service, 'es'));
  await waitFor(() => expect(dialog).toHaveTextContent('Almuerzo'));
  expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  view.rerender(slotView(service, 'ca'));
  await waitFor(() => expect(dialog).toHaveTextContent('Dinar'));
  await user.click(within(dialog).getByRole('button', { name: 'Treu' }));
  await waitFor(async () => {
    expect(await db.menuAssignments.count()).toBe(2);
  });
  expect(await db.menuAssignments.toArray()).toMatchObject([
    { menuId: 'menu', dayOffset: 1 },
    { menuId: 'other', dayOffset: 0 },
  ]);
  db.close();
});

it('dismisses the pending target when switching menus', async () => {
  const { db, service } = await setup();
  const remove = vi.spyOn(service.assignments, 'remove');
  const user = userEvent.setup();
  const view = render(slotView(service));
  await user.click(
    firstButton(await screen.findAllByRole('button', { name: 'Remove Soup from this meal' })),
  );
  await screen.findByRole('alertdialog');
  view.rerender(slotView(service, 'en', otherMenu));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(remove).not.toHaveBeenCalled();
  expect(await db.menuAssignments.count()).toBe(3);
  db.close();
});
