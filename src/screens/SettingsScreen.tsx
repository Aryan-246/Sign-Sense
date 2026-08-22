import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SpeakButton } from '../components/SpeakButton';
import { useSettingsStore } from '../state/useSettingsStore';
import { colors, font, radius, spacing } from '../theme/theme';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

interface StepperProps {
  label: string;
  display: string;
  onDec: () => void;
  onInc: () => void;
}

function Stepper({ label, display, onDec, onInc }: StepperProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.itemLabel}>{label}</Text>
      <View style={styles.stepper}>
        <PrimaryButton
          label="–"
          variant="secondary"
          onPress={onDec}
          style={styles.stepBtn}
        />
        <Text style={styles.stepValue}>{display}</Text>
        <PrimaryButton
          label="+"
          variant="secondary"
          onPress={onInc}
          style={styles.stepBtn}
        />
      </View>
    </View>
  );
}

export function SettingsScreen(): React.JSX.Element {
  const settings = useSettingsStore();

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Speech</Text>
        <Card>
          <View style={styles.row}>
            <Text style={styles.itemLabel}>Speech enabled</Text>
            <Switch
              value={settings.speechEnabled}
              onValueChange={settings.setSpeechEnabled}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.itemLabel}>Auto-speak gestures</Text>
            <Switch
              value={settings.autoSpeak}
              onValueChange={settings.setAutoSpeak}
            />
          </View>
          <View style={styles.divider} />
          <Stepper
            label="Speech rate"
            display={settings.speechRate.toFixed(1)}
            onDec={() =>
              settings.setSpeechRate(round1(clamp(settings.speechRate - 0.1, 0.5, 2.0)))
            }
            onInc={() =>
              settings.setSpeechRate(round1(clamp(settings.speechRate + 0.1, 0.5, 2.0)))
            }
          />
          <View style={styles.divider} />
          <Stepper
            label="Speech pitch"
            display={settings.speechPitch.toFixed(1)}
            onDec={() =>
              settings.setSpeechPitch(round1(clamp(settings.speechPitch - 0.1, 0.5, 2.0)))
            }
            onInc={() =>
              settings.setSpeechPitch(round1(clamp(settings.speechPitch + 0.1, 0.5, 2.0)))
            }
          />
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.itemLabel}>Language</Text>
            <TextInput
              value={settings.language}
              onChangeText={settings.setLanguage}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="en-US"
              placeholderTextColor={colors.textDim}
              style={styles.input}
            />
          </View>
        </Card>

        <View style={styles.testWrap}>
          <SpeakButton text="SignBridge speech test" label="Test speech" />
        </View>

        <Text style={styles.section}>Recognition</Text>
        <Card>
          <Stepper
            label="Duplicate suppression"
            display={`${settings.duplicateSuppressionMs} ms`}
            onDec={() =>
              settings.setDuplicateSuppressionMs(
                clamp(settings.duplicateSuppressionMs - 500, 0, 10000),
              )
            }
            onInc={() =>
              settings.setDuplicateSuppressionMs(
                clamp(settings.duplicateSuppressionMs + 500, 0, 10000),
              )
            }
          />
          <Text style={styles.helpText}>
            Identical gestures repeated within this window are not spoken again.
          </Text>
        </Card>

        <View style={styles.resetWrap}>
          <PrimaryButton
            label="Reset to defaults"
            variant="secondary"
            onPress={settings.resetSettings}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  section: {
    color: colors.textDim,
    fontSize: font.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  itemLabel: { color: colors.text, fontSize: font.body, flex: 1 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { minWidth: 48, minHeight: 40, paddingHorizontal: spacing.md },
  stepValue: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
    minWidth: 80,
    textAlign: 'center',
  },
  input: {
    color: colors.text,
    fontSize: font.body,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 120,
    textAlign: 'right',
  },
  helpText: {
    color: colors.textDim,
    fontSize: font.small,
    marginTop: spacing.sm,
  },
  testWrap: { marginTop: spacing.md },
  resetWrap: { marginTop: spacing.xl },
});
