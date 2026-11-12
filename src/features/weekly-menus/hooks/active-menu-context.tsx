import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { WeeklyMenu } from '../domain/weekly-menu';

interface ActiveMenuState {
  menu: WeeklyMenu | null;
  selectMenu: (menu: WeeklyMenu) => void;
}

const ActiveMenuContext = createContext<ActiveMenuState | null>(null);

export function ActiveMenuProvider({ children }: { children: ReactNode }) {
  const [menu, selectMenu] = useState<WeeklyMenu | null>(null);
  const value = useMemo(() => ({ menu, selectMenu }), [menu]);
  return <ActiveMenuContext.Provider value={value}>{children}</ActiveMenuContext.Provider>;
}

export function useActiveMenu(): ActiveMenuState {
  const context = useContext(ActiveMenuContext);
  if (!context) throw new Error('useActiveMenu must be used inside an ActiveMenuProvider.');
  return context;
}
