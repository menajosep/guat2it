import { createContext, useContext } from 'react';
import type { WeeklyMenuService } from '../application/weekly-menu-service';

const WeeklyMenuServiceContext = createContext<WeeklyMenuService | null>(null);

export const WeeklyMenuServiceProvider = WeeklyMenuServiceContext.Provider;

export function useWeeklyMenuService(): WeeklyMenuService {
  const service = useContext(WeeklyMenuServiceContext);
  if (!service)
    throw new Error('useWeeklyMenuService must be used inside a WeeklyMenuServiceProvider.');
  return service;
}
