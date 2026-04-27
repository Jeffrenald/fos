import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Inter_400Regular, Inter_500Medium, useFonts } from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import type { Session } from '@supabase/supabase-js';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: '(tabs)' };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium });
  const [session, setSession]    = useState<Session | null | undefined>(undefined);
  const [ready, setReady]        = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    }).catch(() => setSession(null));

    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // On web, fonts load via CSS — don't block on them
  const fontsReady = Platform.OS === 'web' ? true : fontsLoaded;

  useEffect(() => {
    if (fontError) console.warn('Font error:', fontError);
  }, [fontError]);

  useEffect(() => {
    if (fontsReady && session !== undefined) {
      SplashScreen.hideAsync();
      setReady(true);
    }
  }, [fontsReady, session]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.teal} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)"     options={{ headerShown: false }} />
        <Stack.Screen name="(auth)"     options={{ headerShown: false }} />
        <Stack.Screen name="workout"    options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaProvider>
  );
}
