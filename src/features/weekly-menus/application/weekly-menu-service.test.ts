import type { WeeklyMenu } from '../domain/weekly-menu';
import { WeeklyMenuService } from './weekly-menu-service';
import type { WeeklyMenuStore } from './weekly-menu-store';
import { MenuAssignmentService } from './menu-assignment-service';
import type { MenuAssignmentStore } from './menu-assignment-store';

const assignmentStore: MenuAssignmentStore = {
  add: vi.fn(),
  list: vi.fn(),
  remove: vi.fn(),
};

it('creates separate records for the same date and rejects invalid drafts', async () => {
  const saved: WeeklyMenu[] = [];
  const store: WeeklyMenuStore = {
    list: () => Promise.resolve([...saved]),
    save: (menu) => {
      saved.push(menu);
      return Promise.resolve();
    },
    remove: (id) => {
      const index = saved.findIndex((menu) => menu.id === id);
      if (index < 0) return Promise.resolve(false);
      saved.splice(index, 1);
      return Promise.resolve(true);
    },
  };
  let id = 0;
  const service = new WeeklyMenuService(
    store,
    () => String(++id),
    new MenuAssignmentService(assignmentStore),
  );
  await service.create({ name: 'First', startDate: '2026-11-16' });
  await service.create({ name: 'Second', startDate: '2026-11-16' });
  expect(await service.list()).toEqual([
    { id: '1', name: 'First', startDate: '2026-11-16' },
    { id: '2', name: 'Second', startDate: '2026-11-16' },
  ]);
  expect((await service.create({ name: '', startDate: '' })).ok).toBe(false);
  expect(await service.list()).toHaveLength(2);
  expect(await service.remove('1')).toEqual({ ok: true, value: undefined });
  expect(await service.remove('1')).toEqual({ ok: false, error: 'not-found' });
});

it('propagates storage failures', async () => {
  const error = new Error('Storage unavailable');
  const store: WeeklyMenuStore = {
    list: () => Promise.reject(error),
    save: () => Promise.reject(error),
    remove: () => Promise.reject(error),
  };
  const service = new WeeklyMenuService(
    store,
    () => '1',
    new MenuAssignmentService(assignmentStore),
  );
  await expect(service.list()).rejects.toBe(error);
  await expect(service.create({ name: 'Menu', startDate: '2026-11-16' })).rejects.toBe(error);
  await expect(service.remove('1')).rejects.toBe(error);
});
