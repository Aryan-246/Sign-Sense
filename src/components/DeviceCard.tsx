import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GloveDevice } from '../models/GloveDevice';
import { colors, font, spacing } from '../theme/theme';
import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';

interface DeviceCardProps {
  device: GloveDevice;
  onConnect: (deviceId: string) => void;
  connecting?: boolean;
  disabled?: boolean;
}

/** A discovered BLE device with a Connect action. */
export function DeviceCard({
  device,
  onConnect,
  connecting = false,
  disabled = false,
}: DeviceCardProps): React.JSX.Element {
  return (
    <Card style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {device.name ?? 'Unknown device'}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {device.id}
        </Text>
        <Text style={styles.meta}>
          {device.rssi !== null ? `Signal ${device.rssi} dBm` : 'Signal —'}
        </Text>
      </View>
      <PrimaryButton
        label={connecting ? 'Connecting' : 'Connect'}
        loading={connecting}
        disabled={disabled}
        onPress={() => onConnect(device.id)}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  info: { flex: 1, marginRight: spacing.md },
  name: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  meta: { color: colors.textDim, fontSize: font.small, marginTop: 2 },
  button: { minWidth: 120, paddingHorizontal: spacing.md },
});
