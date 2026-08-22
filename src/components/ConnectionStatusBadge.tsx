import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CONNECTION_STATUS_LABEL,
  ConnectionStatus,
} from '../models/ConnectionState';
import { colors, font, radius, spacing } from '../theme/theme';

function colorFor(status: ConnectionStatus): string {
  switch (status) {
    case ConnectionStatus.Connected:
      return colors.success;
    case ConnectionStatus.Scanning:
    case ConnectionStatus.Connecting:
    case ConnectionStatus.Reconnecting:
      return colors.warning;
    case ConnectionStatus.ConnectionLost:
    case ConnectionStatus.Error:
      return colors.danger;
    default:
      return colors.textDim;
  }
}

interface BadgeProps {
  status: ConnectionStatus;
  detail?: string | null;
}

/** Pill showing the current connection status with a colored dot. */
export function ConnectionStatusBadge({
  status,
  detail,
}: BadgeProps): React.JSX.Element {
  const color = colorFor(status);
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>
        {CONNECTION_STATUS_LABEL[status]}
      </Text>
      {detail ? (
        <Text style={styles.detail} numberOfLines={1}>
          {`· ${detail}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: font.small,
    fontWeight: '700',
  },
  detail: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.textDim,
    fontSize: font.small,
  },
});
