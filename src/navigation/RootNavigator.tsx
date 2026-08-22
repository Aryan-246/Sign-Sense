import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { BleDebugScreen } from '../screens/BleDebugScreen';
import { ConnectGloveScreen } from '../screens/ConnectGloveScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { RecognitionScreen } from '../screens/RecognitionScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'SignBridge' }}
      />
      <Stack.Screen
        name="ConnectGlove"
        component={ConnectGloveScreen}
        options={{ title: 'Connect Glove' }}
      />
      <Stack.Screen
        name="Recognition"
        component={RecognitionScreen}
        options={{ title: 'Recognition' }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="BleDebug"
        component={BleDebugScreen}
        options={{ title: 'BLE Debug' }}
      />
    </Stack.Navigator>
  );
}
