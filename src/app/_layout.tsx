import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SimulationProvider } from '@/state/simulation';
import { useVsTheme, VsThemeProvider } from '@/theme/theme-context';

SplashScreen.preventAutoHideAsync();

function ThemedStack() {
  const { theme } = useVsTheme();
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return (
    <>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bgTop }, animation: 'fade' }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <VsThemeProvider>
      <SimulationProvider>
        <ThemedStack />
      </SimulationProvider>
    </VsThemeProvider>
  );
}
