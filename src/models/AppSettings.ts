/** User-configurable settings. Persisted locally (see useSettingsStore). */
export interface AppSettings {
  /** When true, newly received gestures are spoken automatically. */
  autoSpeak: boolean;
  /** Master enable/disable for all speech. */
  speechEnabled: boolean;
  /** expo-speech rate (platform-dependent; ~1.0 is normal). */
  speechRate: number;
  /** expo-speech pitch (1.0 is normal). */
  speechPitch: number;
  /** BCP-47 language for speech, e.g. "en-US". */
  language: string;
  /**
   * Suppress auto-speaking the same text again within this window (ms),
   * so a burst of identical gestures does not produce repeated audio (spec §13).
   */
  duplicateSuppressionMs: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoSpeak: true,
  speechEnabled: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  language: 'en-US',
  duplicateSuppressionMs: 2500,
};
