import { useEffect, useRef } from 'react';
import { TextToSpeechService } from '../services/speech/TextToSpeechService';
import { useGloveStore } from '../state/useGloveStore';
import { useSettingsStore } from '../state/useSettingsStore';

/**
 * Speaks each NEW recognized gesture when auto-speak is on — decoupled from BLE:
 * it only watches store state (spec §19, BLE must not call TTS directly).
 *
 * Duplicate suppression: identical text repeated within duplicateSuppressionMs is
 * not spoken again, so rapid repeats of the same gesture don't stutter.
 * Mount once, near the app root.
 */
export function useAutoSpeak(): void {
  const gestureSeq = useGloveStore((s) => s.gestureSeq);
  const latestGesture = useGloveStore((s) => s.latestGesture);

  const autoSpeak = useSettingsStore((s) => s.autoSpeak);
  const speechEnabled = useSettingsStore((s) => s.speechEnabled);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const speechPitch = useSettingsStore((s) => s.speechPitch);
  const language = useSettingsStore((s) => s.language);
  const duplicateSuppressionMs = useSettingsStore((s) => s.duplicateSuppressionMs);

  const lastSpokenSeqRef = useRef(0);
  const lastSpokenTextRef = useRef<string | null>(null);
  const lastSpokenAtRef = useRef(0);

  useEffect(() => {
    if (gestureSeq === 0 || latestGesture === null) return;
    // React only to a genuinely new gesture event.
    if (gestureSeq === lastSpokenSeqRef.current) return;
    lastSpokenSeqRef.current = gestureSeq;

    if (!speechEnabled || !autoSpeak) return;

    const text = latestGesture.text;
    const now = Date.now();
    const isDuplicate =
      lastSpokenTextRef.current === text &&
      now - lastSpokenAtRef.current < duplicateSuppressionMs;
    if (isDuplicate) return;

    lastSpokenTextRef.current = text;
    lastSpokenAtRef.current = now;
    TextToSpeechService.speak(text, {
      language,
      rate: speechRate,
      pitch: speechPitch,
    });
  }, [
    gestureSeq,
    latestGesture,
    autoSpeak,
    speechEnabled,
    speechRate,
    speechPitch,
    language,
    duplicateSuppressionMs,
  ]);
}
