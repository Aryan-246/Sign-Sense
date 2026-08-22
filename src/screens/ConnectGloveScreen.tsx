import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ConnectionStatusBadge } from '../components/ConnectionStatusBadge';
import { DeviceCard } from '../components/DeviceCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { ConnectionStatus } from '../models/ConnectionState';
import { RootStackParamList } from '../navigation/types';
import { gloveController } from '../services/GloveController';
import { useGloveStore } from '../state/useGloveStore';
import { colors, font, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ConnectGlove'>;

export function ConnectGloveScreen({ navigation }: Props): React.JSX.Element {
  const status = useGloveStore((s) => s.status);
  const detail = useGloveStore((s) => s.statusDetail);
  const devices = useGloveStore((s) => s.devices);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const scanning = status === ConnectionStatus.Scanning;
  const connecting = connectingId !== null;

  const onScan = useCallback(async () => {
    setNotice(null);
    const ready = await gloveController.ensureReady();
    if (!ready.ok) {
      setNotice(ready.message ?? 'Bluetooth is not ready.');
      return;
    }
    await gloveController.startScan();
  }, []);

  const onStop = useCallback(() => {
    gloveController.stopScan();
  }, []);

  const onConnect = useCallback(
    async (deviceId: string) => {
      setNotice(null);
      setConnectingId(deviceId);
      try {
        await gloveController.connect(deviceId);
        navigation.navigate('Recognition');
      } catch {
        setNotice('Failed to connect. Check the glove and try again.');
      } finally {
        setConnectingId(null);
      }
    },
    [navigation],
  );

  // Stop any in-progress scan when leaving this screen.
  useEffect(() => {
    return () => {
      gloveController.stopScan();
    };
  }, []);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <ConnectionStatusBadge status={status} detail={detail} />
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <View style={styles.controls}>
          {scanning ? (
            <PrimaryButton label="Stop scan" variant="secondary" onPress={onStop} />
          ) : (
            <PrimaryButton label="Scan for glove" onPress={onScan} />
          )}
        </View>
        <Text style={styles.hint}>
          {scanning
            ? 'Scanning for the glove…'
            : 'Tap scan, then connect to your glove.'}
        </Text>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            connecting={connectingId === item.id}
            disabled={connecting && connectingId !== item.id}
            onConnect={onConnect}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {scanning
              ? 'No devices found yet…'
              : 'No devices. Start a scan to discover your glove.'}
          </Text>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  notice: {
    marginTop: spacing.sm,
    color: colors.warning,
    fontSize: font.small,
  },
  controls: { marginTop: spacing.md },
  hint: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    color: colors.textDim,
    fontSize: font.small,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  empty: {
    color: colors.textDim,
    fontSize: font.body,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
