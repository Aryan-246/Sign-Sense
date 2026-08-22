import React, { useCallback } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { ConnectionStatusBadge } from '../components/ConnectionStatusBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import {
  RECOGNITION_CHARACTERISTIC_UUID,
  SERVICE_UUID,
} from '../ble/constants';
import { ConnectionStatus } from '../models/ConnectionState';
import { gloveController } from '../services/GloveController';
import { useGloveStore } from '../state/useGloveStore';
import { colors, font, spacing } from '../theme/theme';

function Field({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} selectable>
        {value}
      </Text>
    </View>
  );
}

export function BleDebugScreen(): React.JSX.Element {
  const status = useGloveStore((s) => s.status);
  const detail = useGloveStore((s) => s.statusDetail);
  const devices = useGloveStore((s) => s.devices);
  const totalMessages = useGloveStore((s) => s.totalMessages);
  const malformedCount = useGloveStore((s) => s.malformedCount);
  const lastRawMessage = useGloveStore((s) => s.lastRawMessage);
  const lastError = useGloveStore((s) => s.lastError);
  const lastMessageAt = useGloveStore((s) => s.lastMessageAt);
  const resetSession = useGloveStore((s) => s.resetSession);

  const scanning = status === ConnectionStatus.Scanning;

  const onScan = useCallback(async () => {
    const ready = await gloveController.ensureReady();
    if (ready.ok) await gloveController.startScan();
  }, []);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <ConnectionStatusBadge status={status} detail={detail} />

        <View style={styles.controls}>
          {scanning ? (
            <PrimaryButton
              label="Stop"
              variant="secondary"
              onPress={() => gloveController.stopScan()}
              style={styles.ctrlBtn}
            />
          ) : (
            <PrimaryButton label="Scan" onPress={onScan} style={styles.ctrlBtn} />
          )}
          <PrimaryButton
            label="Disconnect"
            variant="danger"
            onPress={() => gloveController.disconnect()}
            style={styles.ctrlBtn}
          />
        </View>

        <Card style={styles.card}>
          <Field label="Transport" value={gloveController.transportKind.toUpperCase()} />
          <Field label="Devices discovered" value={String(devices.length)} />
          <Field label="Messages parsed" value={String(totalMessages)} />
          <Field label="Malformed packets" value={String(malformedCount)} />
          <Field
            label="Last message at"
            value={lastMessageAt !== null ? new Date(lastMessageAt).toISOString() : '—'}
          />
        </Card>

        <Card style={styles.card}>
          <Field label="Service UUID" value={SERVICE_UUID} />
          <Field label="Notify characteristic" value={RECOGNITION_CHARACTERISTIC_UUID} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.fieldLabel}>Last raw payload</Text>
          <Text style={[styles.mono, styles.rawBox]} selectable>
            {lastRawMessage ?? '—'}
          </Text>
          {lastError ? (
            <>
              <Text style={[styles.fieldLabel, styles.errorLabel]}>Last error</Text>
              <Text style={[styles.mono, styles.errorText]} selectable>
                {lastError}
              </Text>
            </>
          ) : null}
        </Card>

        <View style={styles.resetWrap}>
          <PrimaryButton
            label="Reset counters"
            variant="secondary"
            onPress={resetSession}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  controls: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  ctrlBtn: { flex: 1, marginHorizontal: spacing.xs, paddingHorizontal: spacing.sm },
  card: { marginBottom: spacing.md },
  field: { paddingVertical: spacing.xs },
  fieldLabel: {
    color: colors.textDim,
    fontSize: font.small,
    marginBottom: 2,
  },
  fieldValue: { color: colors.text, fontSize: font.body },
  mono: { fontFamily: mono, fontSize: font.small, color: colors.text },
  rawBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  errorLabel: { marginTop: spacing.md },
  errorText: { color: colors.danger, marginTop: spacing.xs },
  resetWrap: { marginTop: spacing.sm },
});
