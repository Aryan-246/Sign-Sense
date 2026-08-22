import React, { useCallback } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { HistoryItem } from '../components/HistoryItem';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useHistoryStore } from '../state/useHistoryStore';
import { colors, font, spacing } from '../theme/theme';

export function HistoryScreen(): React.JSX.Element {
  const items = useHistoryStore((s) => s.items);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  const onClear = useCallback(() => {
    if (items.length === 0) return;
    Alert.alert('Clear history', 'Remove all recognized gestures?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearHistory },
    ]);
  }, [items.length, clearHistory]);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Text style={styles.count}>{`${items.length} recognized`}</Text>
        <PrimaryButton
          label="Clear"
          variant="secondary"
          disabled={items.length === 0}
          onPress={onClear}
          style={styles.clearBtn}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryItem entry={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No history yet. Recognized gestures will appear here.
          </Text>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  count: { color: colors.textDim, fontSize: font.small },
  clearBtn: { minHeight: 40, paddingHorizontal: spacing.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  empty: {
    color: colors.textDim,
    fontSize: font.body,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
