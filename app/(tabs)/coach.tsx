import { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { i18n } from '@/lib/i18n';
import { useKouraj } from '@/hooks/useKouraj';
import { useUserStore } from '@/stores/userStore';

// ─── Bold text renderer ───────────────────────────────────────────────────────
// Renders **bold** markers from Claude responses as actual bold text

function RichText({ text, style }: { text: string; style?: any }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={style}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <Text key={i} style={{ fontFamily: 'Inter_500Medium' }}>{p.slice(2, -2)}</Text>
          : <Text key={i}>{p}</Text>
      )}
    </Text>
  );
}

// ─── Typing indicator (3 animated dots) ──────────────────────────────────────

function TypingDot({ delay }: { delay: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 300, easing: Easing.out(Easing.quad) }),
        withTiming(0,  { duration: 300, easing: Easing.in(Easing.quad)  }),
      ),
      -1,
      false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  // stagger each dot
  useEffect(() => {
    const t = setTimeout(() => {
      y.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(0,  { duration: 300, easing: Easing.in(Easing.quad) }),
        ), -1, false,
      );
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);
  return <Animated.View style={[td.dot, style]} />;
}

function TypingIndicator() {
  return (
    <View style={td.wrap}>
      <View style={td.avatar}><Text style={td.avatarIcon}>⚡</Text></View>
      <View style={td.bubble}>
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </View>
    </View>
  );
}

const td = StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12, paddingHorizontal: Spacing.screenPadding },
  avatar:     { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 3 },
  avatarIcon: { fontSize: 14 },
  bubble:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#1C1C1E', borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 0.5, borderColor: '#2A2A2E' },
  dot:        { width: 7, height: 7, borderRadius: 4, backgroundColor: '#555' },
});

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <View style={[mb.row, isUser && mb.rowUser]}>
      {!isUser && (
        <View style={mb.avatar}>
          <Text style={mb.avatarIcon}>⚡</Text>
        </View>
      )}
      <View style={[mb.bubble, isUser ? mb.bubbleUser : mb.bubbleAssistant]}>
        <RichText
          text={content}
          style={[mb.text, isUser && mb.textUser]}
        />
      </View>
    </View>
  );
}

const mb = StyleSheet.create({
  row:              { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12, paddingHorizontal: Spacing.screenPadding },
  rowUser:          { flexDirection: 'row-reverse' },
  avatar:           { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center', flexShrink: 0, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 3 },
  avatarIcon:       { fontSize: 14 },
  bubble:           { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAssistant:  { backgroundColor: '#1C1C1E', borderBottomLeftRadius: 4, borderWidth: 0.5, borderColor: '#2A2A2E' },
  bubbleUser:       { backgroundColor: Colors.teal, borderBottomRightRadius: 4, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 3 },
  text:             { color: '#CCCCCC', fontSize: FontSize.body, lineHeight: 22 },
  textUser:         { color: Colors.background },
});

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={eb.wrap}>
      <Ionicons name="warning-outline" size={14} color={Colors.danger} />
      <Text style={eb.text} numberOfLines={2}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={eb.retry}>
        <Text style={eb.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const eb = StyleSheet.create({
  wrap:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,122,133,0.1)', borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(255,122,133,0.3)', padding: 10, marginHorizontal: Spacing.screenPadding, marginBottom: 8 },
  text:      { flex: 1, color: Colors.danger, fontSize: FontSize.caption },
  retry:     { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,122,133,0.15)', borderRadius: Radius.full },
  retryText: { color: Colors.danger, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

const QUICK_REPLIES_KEYS = [
  'fixForm', 'adjustPlan', 'whatToEat', 'missedSession', 'motivate',
] as const;

export default function CoachScreen() {
  const user = useUserStore(s => s.user);
  const { messages, isLoading, error, send, streak } = useKouraj();
  const [input,    setInput]    = useState('');
  const [lastText, setLastText] = useState('');
  const listRef = useRef<FlatList>(null);

  const quickReplies = QUICK_REPLIES_KEYS.map(k => ({
    key: k,
    label: i18n.t(`coach.quickReplies.${k}`),
  }));

  function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setLastText(msg);
    setInput('');
    send(msg);
  }

  function handleRetry() {
    if (lastText) send(lastText);
  }

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
    }
  }, [messages.length]);

  return (
    <SafeAreaView style={s.root}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerAvatar}>
            <Text style={s.headerAvatarIcon}>⚡</Text>
          </View>
          <View>
            <Text style={s.headerName}>Kouraj</Text>
            <View style={s.statusRow}>
              <View style={[s.statusDot, isLoading && s.statusDotThinking]} />
              <Text style={s.statusText}>
                {isLoading ? 'Thinking…' : 'Your AI coach'}
              </Text>
            </View>
          </View>
        </View>
        {streak > 0 && (
          <View style={s.streakBadge}>
            <Text style={s.streakBadgeText}>🔥 {streak}</Text>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Messages (inverted FlatList — newest at bottom) ── */}
        <FlatList
          ref={listRef}
          data={[...messages].reverse()}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <MessageBubble role={item.role} content={item.content} />
          )}
          inverted
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            messages.length === 0 && !isLoading
              ? <EmptyState />
              : null
          }
          ListHeaderComponent={
            isLoading ? <TypingIndicator /> : null
          }
        />

        {/* ── Error ── */}
        {error && <ErrorBanner message={error} onRetry={handleRetry} />}

        {/* ── Quick replies ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.quickScroll}
          contentContainerStyle={s.quickContent}
        >
          {quickReplies.map(qr => (
            <TouchableOpacity
              key={qr.key}
              style={[s.quickChip, isLoading && s.quickChipDim]}
              onPress={() => handleSend(qr.label)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={s.quickChipText}>{qr.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Input ── */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder={i18n.t('coach.placeholder')}
            placeholderTextColor="#3A3A3E"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || isLoading) && s.sendBtnDim, {
              shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
              shadowOpacity: input.trim() && !isLoading ? 0.5 : 0,
              shadowRadius: 8, elevation: input.trim() && !isLoading ? 4 : 0,
            }]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color={Colors.background} size="small" />
              : <Ionicons name="arrow-up" size={18} color={Colors.background} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={es.wrap}>
      <View style={es.avatar}><Text style={es.avatarIcon}>⚡</Text></View>
      <Text style={es.title}>Kouraj is here</Text>
      <Text style={es.sub}>
        Ask me about your workouts, nutrition, or how to fix your form.
        I know you're training for greatness, frè m. 💪
      </Text>
    </View>
  );
}

const es = StyleSheet.create({
  wrap:       { alignItems: 'center', paddingHorizontal: Spacing.screenPadding, paddingTop: 60, paddingBottom: 24 },
  avatar:     { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 16, elevation: 6 },
  avatarIcon: { fontSize: 30 },
  title:      { color: '#FFFFFF', fontSize: FontSize.h2, fontFamily: 'Inter_500Medium', marginBottom: 10 },
  sub:        { color: '#555', fontSize: FontSize.bodySm, textAlign: 'center', lineHeight: 22 },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#1A1A1C',
  },
  headerLeft:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.teal,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55, shadowRadius: 10, elevation: 4,
  },
  headerAvatarIcon: { fontSize: 20 },
  headerName:       { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },
  statusRow:        { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.teal },
  statusDotThinking:{ backgroundColor: Colors.warning },
  statusText:       { color: '#555', fontSize: 10 },
  streakBadge:      { backgroundColor: 'rgba(240,176,64,0.12)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 0.5, borderColor: 'rgba(240,176,64,0.3)' },
  streakBadgeText:  { color: '#F0B040', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },

  // List
  listContent: { paddingTop: 16, paddingBottom: 8 },

  // Quick replies
  quickScroll:  { borderTopWidth: 0.5, borderTopColor: '#141416', paddingVertical: 10 },
  quickContent: { paddingHorizontal: Spacing.screenPadding, gap: 8 },
  quickChip: {
    backgroundColor: '#1C1C1E', borderRadius: Radius.full,
    borderWidth: 0.5, borderColor: '#2A2A2E',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  quickChipDim:  { opacity: 0.4 },
  quickChipText: { color: '#AAAAAA', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },

  // Input
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 12,
    borderTopWidth: 0.5, borderTopColor: '#141416',
  },
  input: {
    flex: 1, backgroundColor: '#1A1A1C',
    borderRadius: 20, borderWidth: 0.5, borderColor: '#252528',
    paddingHorizontal: 16, paddingVertical: 10,
    color: '#FFFFFF', fontSize: FontSize.body,
    maxHeight: 100, lineHeight: 20,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.teal,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDim: { backgroundColor: '#1C1C1E', },
});
