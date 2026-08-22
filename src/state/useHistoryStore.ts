import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { HistoryEntry } from '../models/HistoryEntry';

/** Keep local history bounded so AsyncStorage never grows without limit. */
export const HISTORY_LIMIT = 500;

interface HistoryState {
  items: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}

/**
 * Local, persisted recognition history. Newest entries first. This is the
 * "History service" layer — it reacts to recognized gestures (written by the
 * controller) and never touches BLE or the UI.
 */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [],
      addEntry: (entry) =>
        set((state) => ({
          items: [entry, ...state.items].slice(0, HISTORY_LIMIT),
        })),
      clearHistory: () => set({ items: [] }),
    }),
    {
      name: 'signbridge-history',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
