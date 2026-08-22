import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAutoSpeak } from './src/hooks/useAutoSpeak';
import { RootNavigator } from './src/navigation/RootNavigator';
import { gloveController } from './src/services/GloveController';
import { colors } from './src/theme/theme';

const navigationTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
    notification: colors.primary,
  },
};

/** Mounts app-wide state→speech wiring once, inside the provider tree. */
function AppContent(): React.JSX.Element {
  useAutoSpeak();
  return <RootNavigator />;
}

export default function App(): React.JSX.Element {
  useEffect(() => {
    // Wire the transport to the stores once the app mounts.
    gloveController.init();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navigationTheme}>
        <AppContent />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
