import type { WeeklyMenu } from '../domain/weekly-menu';
import { WeeklyMenuService } from './weekly-menu-service';
import type { WeeklyMenuStore } from './weekly-menu-store';

it('creates separate records for the same date and rejects invalid drafts', async () => {
  const saved: WeeklyMenu[] = [];
  const store: WeeklyMenuStore = {
    list: () => Promise.resolve([...saved]),
    save: (menu) => {
      saved.push(menu);
      return Promise.resolve();
    },
  };
  let id = 0;
  const service = new WeeklyMenuService(store, () => String(++id));
  await service.create({ name: 'First', startDate: '2026-11-16' });
  await service.create({ name: 'Second', startDate: '2026-11-16' });
  expect(await service.list()).toEqual([
    { id: '1', name: 'First', startDate: '2026-11-16' },
    { id: '2', name: 'Second', startDate: '2026-11-16' },
  ]);
  expect((await service.create({ name: '', startDate: '' })).ok).toBe(false);
  expect(await service.list()).toHaveLength(2);
});

it('propagates storage failures', async () => {
  const error = new Error('Storage unavailable');
  const store: WeeklyMenuStore = {
    list: () => Promise.reject(error),
    save: () => Promise.reject(error),
  };
  const service = new WeeklyMenuService(store, () => '1');
  await expect(service.list()).rejects.toBe(error);
  await expect(service.create({ name: 'Menu', startDate: '2026-11-16' })).rejects.toBe(error);
});
