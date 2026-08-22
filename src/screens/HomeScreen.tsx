import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ConnectionStatusBadge } from '../components/ConnectionStatusBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { ConnectionStatus } from '../models/ConnectionState';
import { RootStackParamList } from '../navigation/types';
import { useGloveStore } from '../state/useGloveStore';
import { colors, font, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const status = useGloveStore((s) => s.status);
  const detail = useGloveStore((s) => s.statusDetail);
  const connected = status === ConnectionStatus.Connected;

  return (
    <Screen>
      <Text style={styles.title}>SignBridge</Text>
      <Text style={styles.subtitle}>Sign language glove companion</Text>

      <View style={styles.badge}>
        <ConnectionStatusBadge status={status} detail={detail} />
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label={connected ? 'Go to Recognition' : 'Connect Glove'}
          onPress={() =>
            navigation.navigate(connected ? 'Recognition' : 'ConnectGlove')
          }
        />
        <PrimaryButton
          label="Recognition"
          variant="secondary"
          style={styles.gap}
          onPress={() => navigation.navigate('Recognition')}
        />
        <PrimaryButton
          label="History"
          variant="secondary"
          style={styles.gap}
          onPress={() => navigation.navigate('History')}
        />
        <PrimaryButton
          label="Settings"
          variant="secondary"
          style={styles.gap}
          onPress={() => navigation.navigate('Settings')}
        />
        <PrimaryButton
          label="BLE Debug"
          variant="secondary"
          style={styles.gap}
          onPress={() => navigation.navigate('BleDebug')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: font.h1, fontWeight: '800' },
  subtitle: {
    color: colors.textDim,
    fontSize: font.body,
    marginTop: spacing.xs,
  },
  badge: { marginTop: spacing.lg },
  actions: { marginTop: spacing.xl },
  gap: { marginTop: spacing.sm },
});
