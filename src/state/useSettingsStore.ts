import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppSettings, DEFAULT_SETTINGS } from '../models/AppSettings';

interface SettingsState extends AppSettings {
  setAutoSpeak: (value: boolean) => void;
  setSpeechEnabled: (value: boolean) => void;
  setSpeechRate: (value: number) => void;
  setSpeechPitch: (value: number) => void;
  setLanguage: (value: string) => void;
  setDuplicateSuppressionMs: (value: number) => void;
  resetSettings: () => void;
}

/**
 * User settings, persisted locally via AsyncStorage (no backend). Starts from
 * DEFAULT_SETTINGS and rehydrates asynchronously on launch.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setAutoSpeak: (autoSpeak) => set({ autoSpeak }),
      setSpeechEnabled: (speechEnabled) => set({ speechEnabled }),
      setSpeechRate: (speechRate) => set({ speechRate }),
      setSpeechPitch: (speechPitch) => set({ speechPitch }),
      setLanguage: (language) => set({ language }),
      setDuplicateSuppressionMs: (duplicateSuppressionMs) =>
        set({ duplicateSuppressionMs }),
      resetSettings: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'signbridge-settings',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
