import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme/theme';

interface GestureDisplayProps {
  text: string | null;
  confidence?: number;
  receiving: boolean;
}

/** Large display of the most recent recognized gesture text. */
export function GestureDisplay({
  text,
  confidence,
  receiving,
}: GestureDisplayProps): React.JSX.Element {
  const hasText = text !== null && text.length > 0;
  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.dot,
            { backgroundColor: receiving ? colors.success : colors.textDim },
          ]}
        />
        <Text style={styles.statusText}>
          {receiving ? 'Receiving data' : 'Waiting for data'}
        </Text>
      </View>

      <Text
        style={[styles.gesture, !hasText && styles.placeholder]}
        numberOfLines={3}
        adjustsFontSizeToFit
      >
        {hasText ? text : '—'}
      </Text>

      {hasText && typeof confidence === 'number' ? (
        <Text style={styles.confidence}>
          {`Confidence ${(confidence * 100).toFixed(0)}%`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  statusText: { color: colors.textDim, fontSize: font.small },
  gesture: {
    color: colors.text,
    fontSize: font.h1,
    fontWeight: '800',
    textAlign: 'center',
  },
  placeholder: { color: colors.textDim, fontWeight: '400' },
  confidence: {
    marginTop: spacing.md,
    color: colors.textDim,
    fontSize: font.body,
  },
});
