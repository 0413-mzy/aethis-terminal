import { create } from 'zustand';

export type ModalType =
  | 'characterCreation'
  | 'levelUp'
  | 'bossEncounter'
  | 'victory'
  | 'dailyReward'
  | 'death'
  | 'storyChapter'
  | null;

export type ToastType = 'xp' | 'gold' | 'damage' | 'achievement' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  amount?: number;
}

interface UIState {
  activeView: 'tasks' | 'boss' | 'stats';
  sidebarTab: 'character' | 'filters' | 'inventory' | 'shop';
  sidebarOpen: boolean;
  activeModal: ModalType;
  modalData: unknown;
  toasts: Toast[];
  shaking: boolean;

  setView: (view: 'tasks' | 'boss' | 'stats') => void;
  setSidebarTab: (tab: 'character' | 'filters' | 'inventory' | 'shop') => void;
  toggleSidebar: () => void;
  openModal: (type: ModalType, data?: unknown) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  triggerShake: () => void;
}

let toastCounter = 0;

export const useUIStore = create<UIState>()((set, get) => ({
  activeView: 'tasks',
  sidebarTab: 'character',
  sidebarOpen: true,
  activeModal: null,
  modalData: null,
  toasts: [],
  shaking: false,

  setView: (view) => set({ activeView: view }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

  openModal: (type, data = null) => {
    set({ activeModal: type, modalData: data });
  },

  closeModal: () => {
    set({ activeModal: null, modalData: null });
  },

  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    set({ toasts: [...get().toasts, { ...toast, id }] });

    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 3000);
  },

  dismissToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  triggerShake: () => {
    set({ shaking: true });
    setTimeout(() => set({ shaking: false }), 500);
  },
}));
