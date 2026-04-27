import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { i18n } from '@/lib/i18n';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/(tabs)');
      } else {
        if (!name) { Alert.alert('', 'Enter your name'); return; }
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw error;
        router.replace('/(auth)/onboarding');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>⚡</Text>
          </View>
          <Text style={styles.wordmark}>Fòs</Text>
          <Text style={styles.tagline}>Built for the diaspora. Built for you.</Text>
        </View>

        {/* Mode toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'login' && styles.toggleActive]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'signup' && styles.toggleActive]}
            onPress={() => setMode('signup')}
          >
            <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === 'signup' && (
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={Colors.textDim}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textDim}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </View>

          <TouchableOpacity
            style={[styles.cta, loading && styles.ctaDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.background} />
              : <Text style={styles.ctaText}>
                  {mode === 'login' ? 'Log In' : "Kòmanse — Let's Go 💪"}
                </Text>
            }
          </TouchableOpacity>
        </View>

        {/* Proverb */}
        <Text style={styles.proverb}>"Dèyè mòn gen mòn"</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.screenPadding, paddingVertical: 48 },

  logoWrap:   { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.teal,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  logoEmoji:  { fontSize: 32 },
  wordmark:   { color: Colors.textPrimary, fontSize: 36, fontFamily: 'Inter_500Medium', letterSpacing: -0.5 },
  tagline:    { color: Colors.textMuted, fontSize: FontSize.caption, marginTop: 4 },

  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: 28,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  toggleActive: { backgroundColor: Colors.surfaceRaised },
  toggleText:       { color: Colors.textMuted,    fontSize: FontSize.body, fontFamily: 'Inter_400Regular' },
  toggleTextActive: { color: Colors.textPrimary,  fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },

  form:      { gap: 16, marginBottom: 32 },
  inputWrap: { gap: 6 },
  label:     { color: Colors.textSecondary, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5, borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 16, paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: FontSize.body,
    fontFamily: 'Inter_400Regular',
  },

  cta: {
    backgroundColor: Colors.teal,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: {
    color: Colors.background,
    fontSize: FontSize.bodyLg,
    fontFamily: 'Inter_500Medium',
  },

  proverb: {
    color: Colors.textDim,
    fontSize: FontSize.caption,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
