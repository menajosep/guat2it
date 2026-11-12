import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { PersistenceError } from '../../../shared/errors/persistence-error';
import type { WeeklyMenu } from '../domain/weekly-menu';
import { useWeeklyMenuService } from './weekly-menu-service-context';

type DeletionState = 'idle' | 'pending' | 'deleted' | 'not-found' | 'storage' | 'unexpected';

interface ActiveMenuState {
  menu: WeeklyMenu | null;
  selectMenu: (menu: WeeklyMenu) => void;
  deletedMenuIds: ReadonlySet<string>;
  deletion: DeletionState;
  deleteMenu: (id: string) => Promise<void>;
  clearDeletionFeedback: () => void;
}

const ActiveMenuContext = createContext<ActiveMenuState | null>(null);

export function ActiveMenuProvider({ children }: { children: ReactNode }) {
  const service = useWeeklyMenuService();
  const [menu, selectMenu] = useState<WeeklyMenu | null>(null);
  const [deletedMenuIds, setDeletedMenuIds] = useState<ReadonlySet<string>>(() => new Set());
  const [deletion, setDeletion] = useState<DeletionState>('idle');
  const deletingRef = useRef(false);
  const clearDeletionFeedback = useCallback(() => {
    if (!deletingRef.current) setDeletion('idle');
  }, []);
  const deleteMenu = useCallback(
    async (id: string) => {
      if (deletingRef.current) return;
      deletingRef.current = true;
      setDeletion('pending');
      try {
        const result = await service.remove(id);
        if (!result.ok) {
          setDeletion('not-found');
          return;
        }
        setDeletedMenuIds((current) => new Set([...current, id]));
        selectMenu((current) => (current?.id === id ? null : current));
        setDeletion('deleted');
      } catch (error) {
        console.error('Unable to delete weekly menu', error);
        setDeletion(error instanceof PersistenceError ? 'storage' : 'unexpected');
      } finally {
        deletingRef.current = false;
      }
    },
    [service],
  );
  const value = useMemo(
    () => ({ menu, selectMenu, deletedMenuIds, deletion, deleteMenu, clearDeletionFeedback }),
    [menu, deletedMenuIds, deletion, deleteMenu, clearDeletionFeedback],
  );
  return <ActiveMenuContext.Provider value={value}>{children}</ActiveMenuContext.Provider>;
}

export function useActiveMenu(): ActiveMenuState {
  const context = useContext(ActiveMenuContext);
  if (!context) throw new Error('useActiveMenu must be used inside an ActiveMenuProvider.');
  return context;
}
