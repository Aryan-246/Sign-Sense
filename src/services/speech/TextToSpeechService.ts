import * as Speech from 'expo-speech';

export interface SpeakOptions {
  language?: string;
  rate?: number;
  pitch?: number;
}

/**
 * Thin wrapper around expo-speech. This is the ONLY module that talks to the TTS
 * engine. Nothing in the BLE layer imports it — speech is driven from app state
 * (see useAutoSpeak) or from an explicit user action (the Speak button).
 */
export const TextToSpeechService = {
  speak(text: string, options: SpeakOptions = {}): void {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    Speech.speak(trimmed, {
      language: options.language,
      rate: options.rate,
      pitch: options.pitch,
    });
  },

  stop(): void {
    Speech.stop();
  },

  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch {
      return false;
    }
  },
};
