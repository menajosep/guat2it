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
import type { TransferChoice, TransferSnapshot } from '../domain/menu-transfer';
import { useWeeklyMenuService } from './weekly-menu-service-context';

type DeletionState = 'idle' | 'pending' | 'deleted' | 'not-found' | 'storage' | 'unexpected';
type TransferState =
  | 'idle'
  | 'pending'
  | 'success'
  | 'stale'
  | 'menu-not-found'
  | 'recipe-not-found'
  | 'invalid'
  | 'storage'
  | 'unexpected';

interface ActiveMenuState {
  menu: WeeklyMenu | null;
  selectMenu: (menu: WeeklyMenu) => void;
  deletedMenuIds: ReadonlySet<string>;
  deletion: DeletionState;
  deleteMenu: (id: string) => Promise<void>;
  clearDeletionFeedback: () => void;
  transfer: TransferState;
  transferMenu: (
    snapshot: TransferSnapshot,
    choices: ReadonlyMap<string, TransferChoice>,
  ) => Promise<'success' | 'stale' | 'failed'>;
  clearTransferFeedback: () => void;
}

const ActiveMenuContext = createContext<ActiveMenuState | null>(null);

export function ActiveMenuProvider({ children }: { children: ReactNode }) {
  const service = useWeeklyMenuService();
  const [menu, selectMenu] = useState<WeeklyMenu | null>(null);
  const [deletedMenuIds, setDeletedMenuIds] = useState<ReadonlySet<string>>(() => new Set());
  const [deletion, setDeletion] = useState<DeletionState>('idle');
  const [transfer, setTransfer] = useState<TransferState>('idle');
  const deletingRef = useRef(false);
  const transferringRef = useRef(false);
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
  const clearTransferFeedback = useCallback(() => {
    if (!transferringRef.current) setTransfer('idle');
  }, []);
  const transferMenu = useCallback(
    async (snapshot: TransferSnapshot, choices: ReadonlyMap<string, TransferChoice>) => {
      if (transferringRef.current) return 'failed';
      transferringRef.current = true;
      setTransfer('pending');
      try {
        const result = await service.transfer.commit(snapshot, choices);
        if (!result.ok) {
          setTransfer(typeof result.error === 'string' ? result.error : 'invalid');
          return result.error === 'stale' ||
            result.error === 'menu-not-found' ||
            result.error === 'recipe-not-found'
            ? 'stale'
            : 'failed';
        }
        setTransfer('success');
        return 'success';
      } catch (error) {
        console.error('Unable to transfer menu ingredients', error);
        setTransfer(error instanceof PersistenceError ? 'storage' : 'unexpected');
        return 'failed';
      } finally {
        transferringRef.current = false;
      }
    },
    [service],
  );
  const value = useMemo(
    () => ({
      menu,
      selectMenu,
      deletedMenuIds,
      deletion,
      deleteMenu,
      clearDeletionFeedback,
      transfer,
      transferMenu,
      clearTransferFeedback,
    }),
    [
      menu,
      deletedMenuIds,
      deletion,
      deleteMenu,
      clearDeletionFeedback,
      transfer,
      transferMenu,
      clearTransferFeedback,
    ],
  );
  return <ActiveMenuContext.Provider value={value}>{children}</ActiveMenuContext.Provider>;
}

export function useActiveMenu(): ActiveMenuState {
  const context = useContext(ActiveMenuContext);
  if (!context) throw new Error('useActiveMenu must be used inside an ActiveMenuProvider.');
  return context;
}
