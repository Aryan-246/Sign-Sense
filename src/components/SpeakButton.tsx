import React from 'react';
import { TextToSpeechService } from '../services/speech/TextToSpeechService';
import { useSettingsStore } from '../state/useSettingsStore';
import { PrimaryButton } from './PrimaryButton';

interface SpeakButtonProps {
  text: string | null;
  label?: string;
}

/**
 * Explicit "speak this text" action. Uses the current speech settings. Manual
 * presses always speak (no duplicate suppression — that only applies to
 * auto-speak). Disabled when speech is off or there is nothing to say.
 */
export function SpeakButton({
  text,
  label = 'Speak',
}: SpeakButtonProps): React.JSX.Element {
  const speechEnabled = useSettingsStore((s) => s.speechEnabled);
  const language = useSettingsStore((s) => s.language);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const speechPitch = useSettingsStore((s) => s.speechPitch);

  const canSpeak = speechEnabled && text !== null && text.trim().length > 0;

  return (
    <PrimaryButton
      label={label}
      disabled={!canSpeak}
      onPress={() => {
        if (text === null) return;
        TextToSpeechService.speak(text, {
          language,
          rate: speechRate,
          pitch: speechPitch,
        });
      }}
    />
  );
}
