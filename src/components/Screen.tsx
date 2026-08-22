import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  edges?: readonly Edge[];
}

/** Safe-area screen wrapper with the app background and consistent padding. */
export function Screen({
  children,
  style,
  padded = true,
  edges = ['top', 'bottom'],
}: ScreenProps): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1 },
  padded: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
});
