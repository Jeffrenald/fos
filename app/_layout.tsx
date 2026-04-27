import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Inter_400Regular, Inter_500Medium, useFonts } from '@expo-google-fonts/inter';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';
import type { Session } from '@supabase/supabase-js';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium });
  const [session, setSession]     = useState<Session | null | undefined>(undefined);
  const isOnboarded               = useUserStore(s => s.isOnboarded);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && session !== undefined) SplashScreen.hideAsync();
  }, [fontsLoaded, session]);

  if (!fontsLoaded || session === undefined) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)"     options={{ headerShown: false }} />
        <Stack.Screen name="(auth)"     options={{ headerShown: false }} />
        <Stack.Screen name="workout"    options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
