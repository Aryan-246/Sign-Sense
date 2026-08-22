import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { ConnectionStatusBadge } from '../components/ConnectionStatusBadge';
import { GestureDisplay } from '../components/GestureDisplay';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SpeakButton } from '../components/SpeakButton';
import { useIsReceivingData } from '../hooks/useIsReceivingData';
import { ConnectionStatus } from '../models/ConnectionState';
import { RootStackParamList } from '../navigation/types';
import { gloveController } from '../services/GloveController';
import { useGloveStore } from '../state/useGloveStore';
import { useSettingsStore } from '../state/useSettingsStore';
import { colors, font, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Recognition'>;

export function RecognitionScreen({ navigation }: Props): React.JSX.Element {
  const status = useGloveStore((s) => s.status);
  const detail = useGloveStore((s) => s.statusDetail);
  const latest = useGloveStore((s) => s.latestGesture);
  const receiving = useIsReceivingData();

  const autoSpeak = useSettingsStore((s) => s.autoSpeak);
  const setAutoSpeak = useSettingsStore((s) => s.setAutoSpeak);

  const connected = status === ConnectionStatus.Connected;
  const lost =
    status === ConnectionStatus.ConnectionLost ||
    status === ConnectionStatus.Error;

  const onDisconnect = useCallback(async () => {
    await gloveController.disconnect();
  }, []);

  const onReconnect = useCallback(async () => {
    try {
      await gloveController.reconnect();
    } catch {
      // Status/detail already reflect the failure via controller callbacks.
    }
  }, []);

  return (
    <Screen>
      <ConnectionStatusBadge status={status} detail={detail} />

      <View style={styles.display}>
        <GestureDisplay
          text={latest?.text ?? null}
          confidence={latest?.confidence}
          receiving={receiving}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Auto-speak</Text>
        <Switch value={autoSpeak} onValueChange={setAutoSpeak} />
      </View>

      <SpeakButton text={latest?.text ?? null} />

      <View style={styles.actions}>
        {connected ? (
          <PrimaryButton
            label="Disconnect"
            variant="danger"
            style={styles.gap}
            onPress={onDisconnect}
          />
        ) : null}
        {lost ? (
          <PrimaryButton label="Reconnect" style={styles.gap} onPress={onReconnect} />
        ) : null}
        {!connected && !lost ? (
          <PrimaryButton
            label="Connect a glove"
            style={styles.gap}
            onPress={() => navigation.navigate('ConnectGlove')}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  display: { marginTop: spacing.md, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  rowLabel: { color: colors.text, fontSize: font.body, fontWeight: '600' },
  actions: { marginTop: spacing.md },
  gap: { marginTop: spacing.sm },
});
