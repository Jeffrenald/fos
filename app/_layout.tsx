import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Inter_400Regular, Inter_500Medium, useFonts } from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: '(auth)' };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium });

  // On web fonts load via CSS — don't block on them
  const ready = Platform.OS === 'web' ? true : fontsLoaded;

  useEffect(() => {
    if (fontError) console.warn('Font load error:', fontError);
  }, [fontError]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)"             options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"             options={{ headerShown: false }} />
        <Stack.Screen name="workout/[sessionId]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaProvider>
  );
}
