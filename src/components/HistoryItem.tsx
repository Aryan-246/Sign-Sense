import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HistoryEntry } from '../models/HistoryEntry';
import { colors, font, spacing } from '../theme/theme';
import { formatClock } from '../utils/format';

interface HistoryItemProps {
  entry: HistoryEntry;
}

/** A single recognized-gesture row in the history list. */
export function HistoryItem({ entry }: HistoryItemProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.text} numberOfLines={2}>
          {entry.text}
        </Text>
        {typeof entry.confidence === 'number' ? (
          <Text style={styles.meta}>
            {`${(entry.confidence * 100).toFixed(0)}%`}
          </Text>
        ) : null}
      </View>
      <Text style={styles.time}>{formatClock(entry.receivedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  textWrap: { flex: 1, marginRight: spacing.md },
  text: { color: colors.text, fontSize: font.body, fontWeight: '600' },
  meta: { color: colors.textDim, fontSize: font.small, marginTop: 2 },
  time: { color: colors.textDim, fontSize: font.small },
});
