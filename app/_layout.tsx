import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Inter_400Regular, Inter_500Medium, useFonts } from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  requestNotificationPermission,
  scheduleStreakReminder,
  scheduleMissedSession,
} from '@/lib/notifications';
import { useUserStore } from '@/stores/userStore';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Colors } from '@/constants/Colors';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: '(auth)' };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium });
  const user = useUserStore(s => s.user);

  const ready = Platform.OS === 'web' ? true : fontsLoaded;

  useEffect(() => {
    if (fontError) console.warn('Font load error:', fontError);
  }, [fontError]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    if (!user?.id) return;
    requestNotificationPermission().then(granted => {
      if (!granted) return;
      const lang = user.language ?? 'en';
      scheduleStreakReminder(lang);
      scheduleMissedSession(lang);
    });
  }, [user?.id, user?.language]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        {/* Global offline banner — shows on every screen when connection lost */}
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)"              options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)"              options={{ headerShown: false }} />
          <Stack.Screen name="workout/[sessionId]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}
