import { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

// ─── Rich text renderer ───────────────────────────────────────────────────────

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

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDot({ delay }: { delay: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      y.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(0,  { duration: 280, easing: Easing.in(Easing.quad)  }),
        ), -1, false,
      );
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);
  return <Animated.View style={[td.dot, useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }))]} />;
}

function TypingIndicator() {
  return (
    <View style={td.row}>
      <View style={td.avatar}><Text style={td.icon}>⚡</Text></View>
      <View style={td.bubble}>
        <TypingDot delay={0} />
        <TypingDot delay={140} />
        <TypingDot delay={280} />
      </View>
    </View>
  );
}

const td = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, paddingHorizontal: Spacing.screenPadding },
  avatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center', marginRight: 8, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 3 },
  icon:   { fontSize: 13 },
  bubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 0.5, borderColor: '#2A2A2E', gap: 5 },
  dot:    { width: 7, height: 7, borderRadius: 4, backgroundColor: '#444' },
});

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <View style={[mb.row, isUser && mb.rowUser]}>
      {!isUser && (
        <View style={mb.avatar}><Text style={mb.avatarIcon}>⚡</Text></View>
      )}
      <View style={[mb.bubble, isUser ? mb.user : mb.assistant]}>
        <RichText text={content} style={[mb.text, isUser && mb.textUser]} />
      </View>
    </View>
  );
}

const mb = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14, paddingHorizontal: Spacing.screenPadding },
  rowUser:    { flexDirection: 'row-reverse' },
  avatar:     { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 8, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 3 },
  avatarIcon: { fontSize: 13 },
  bubble:     { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  assistant:  { backgroundColor: '#1C1C1E', borderBottomLeftRadius: 4, borderWidth: 0.5, borderColor: '#2A2A2E' },
  user:       { backgroundColor: Colors.teal, borderBottomRightRadius: 4, marginLeft: 8, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 3 },
  text:       { color: '#CCCCCC', fontSize: FontSize.body, lineHeight: 22 },
  textUser:   { color: Colors.background },
});

// ─── Quick replies (2-column grid with icons) ─────────────────────────────────

interface QuickReply {
  key:   string;
  label: string;
  icon:  string;
  color: string;
}

const QUICK_REPLIES: QuickReply[] = [
  { key: 'fixForm',       label: 'Fix my form',         icon: 'body-outline',        color: Colors.teal  },
  { key: 'adjustPlan',    label: 'Adjust my plan',       icon: 'calendar-outline',    color: '#5A78FF'    },
  { key: 'whatToEat',     label: 'What should I eat?',  icon: 'restaurant-outline',  color: '#F0B040'    },
  { key: 'missedSession', label: 'I missed a session',  icon: 'sad-outline',         color: '#FF7A85'    },
  { key: 'motivate',      label: 'Motivate me',         icon: 'flash-outline',       color: '#3FCC93'    },
  { key: 'haitian',       label: 'Haitian food macros', icon: 'flag-outline',        color: '#CE1126'    },
];

function QuickReplies({ onSelect, disabled }: { onSelect: (label: string) => void; disabled: boolean }) {
  return (
    <View style={qr.wrap}>
      <Text style={qr.heading}>Ask Kouraj</Text>
      <View style={qr.grid}>
        {QUICK_REPLIES.map(q => (
          <TouchableOpacity
            key={q.key}
            style={[qr.chip, disabled && qr.chipDim, { borderColor: `${q.color}30` }]}
            onPress={() => onSelect(q.label)}
            disabled={disabled}
            activeOpacity={0.75}
          >
            <View style={[qr.iconWrap, { backgroundColor: `${q.color}18` }]}>
              <Ionicons name={q.icon as any} size={15} color={q.color} />
            </View>
            <Text style={qr.label} numberOfLines={2}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const qr = StyleSheet.create({
  wrap:    { paddingHorizontal: Spacing.screenPadding, paddingTop: 12, paddingBottom: 8 },
  heading: { color: '#444', fontSize: 10, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  grid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    width: '48%',
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#141416',
    borderRadius: 12, borderWidth: 0.5,
    padding: 10, gap: 8,
  },
  chipDim:  { opacity: 0.4 },
  iconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  label:    { color: '#CCCCCC', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', flex: 1, lineHeight: 17 },
});

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={eb.wrap}>
      <Ionicons name="warning-outline" size={14} color={Colors.danger} />
      <Text style={eb.text} numberOfLines={2}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={eb.btn}>
        <Text style={eb.btnText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const eb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,122,133,0.08)', borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(255,122,133,0.25)', padding: 10, marginHorizontal: Spacing.screenPadding, marginBottom: 6 },
  text: { flex: 1, color: Colors.danger, fontSize: FontSize.caption },
  btn:  { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,122,133,0.12)', borderRadius: Radius.full },
  btnText: { color: Colors.danger, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
});

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={es.wrap}>
      <View style={es.avatar}><Text style={es.icon}>⚡</Text></View>
      <Text style={es.title}>Kouraj is ready</Text>
      <Text style={es.sub}>
        Ask about workouts, nutrition, or how to stay consistent.{'\n'}
        I speak your language, frè m. 💪
      </Text>
    </View>
  );
}

const es = StyleSheet.create({
  wrap:  { alignItems: 'center', paddingHorizontal: Spacing.screenPadding, paddingTop: 40, paddingBottom: 16 },
  avatar:{ width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 6 },
  icon:  { fontSize: 28 },
  title: { color: '#FFFFFF', fontSize: FontSize.h2, fontFamily: 'Inter_500Medium', marginBottom: 8 },
  sub:   { color: '#555', fontSize: FontSize.bodySm, textAlign: 'center', lineHeight: 22 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const user   = useUserStore(s => s.user);
  const { messages, isLoading, error, send, streak } = useKouraj();
  const [input,    setInput]    = useState('');
  const [lastText, setLastText] = useState('');
  const [showQR,   setShowQR]   = useState(true);   // hide quick replies once chat starts
  const listRef = useRef<FlatList>(null);

  function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setLastText(msg);
    setInput('');
    setShowQR(false);
    send(msg);
  }

  useEffect(() => {
    if (messages.length > 1) setShowQR(false);
  }, [messages.length]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 80);
    }
  }, [messages.length]);

  // On Android, 'padding' behavior pushes the view up when keyboard appears.
  // On iOS, 'padding' is standard. Both work correctly here.
  const kavBehavior = Platform.OS === 'ios' ? 'padding' : 'padding';
  const kavOffset   = Platform.OS === 'ios' ? insets.top + 60 : 0;

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: insets.top }]}
      behavior={kavBehavior}
      keyboardVerticalOffset={kavOffset}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.avatar}>
            <Text style={s.avatarIcon}>⚡</Text>
          </View>
          <View>
            <Text style={s.name}>Kouraj</Text>
            <View style={s.statusRow}>
              <View style={[s.dot, isLoading && s.dotBusy]} />
              <Text style={s.statusText}>{isLoading ? 'Thinking…' : 'Your AI coach'}</Text>
            </View>
          </View>
        </View>
        {streak > 0 && (
          <View style={s.streakBadge}>
            <Text style={s.streakText}>🔥 {streak}</Text>
          </View>
        )}
      </View>

      {/* ── Messages ── */}
      <FlatList
        ref={listRef}
        data={[...messages].reverse()}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <MessageBubble role={item.role} content={item.content} />}
        inverted
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        ListFooterComponent={messages.length === 0 && !isLoading ? <EmptyState /> : null}
        ListHeaderComponent={isLoading ? <TypingIndicator /> : null}
      />

      {/* ── Error ── */}
      {!!error && <ErrorBanner message={error} onRetry={() => lastText && send(lastText)} />}

      {/* ── Quick replies — visible until user starts chatting ── */}
      {showQR && messages.length <= 1 && (
        <QuickReplies onSelect={handleSend} disabled={isLoading} />
      )}

      {/* ── Input bar ── */}
      <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Message Kouraj…"
          placeholderTextColor="#3A3A3E"
          multiline
          maxLength={500}
          onFocus={() => setShowQR(false)}
          returnKeyType="default"
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || isLoading) && s.sendBtnOff]}
          onPress={() => handleSend()}
          disabled={!input.trim() || isLoading}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color="#555" size="small" />
            : <Ionicons name="arrow-up" size={18} color={input.trim() ? Colors.background : '#333'} />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#141416',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.teal,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 4,
  },
  avatarIcon: { fontSize: 18 },
  name:       { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  dot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.teal },
  dotBusy:    { backgroundColor: Colors.warning },
  statusText: { color: '#555', fontSize: 10 },
  streakBadge:{ backgroundColor: 'rgba(240,176,64,0.1)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 0.5, borderColor: 'rgba(240,176,64,0.25)' },
  streakText: { color: '#F0B040', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },

  listContent: { paddingTop: 16, paddingBottom: 6 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: Spacing.screenPadding, paddingTop: 10,
    borderTopWidth: 0.5, borderTopColor: '#141416',
    backgroundColor: Colors.background,
    gap: 8,
  },
  input: {
    flex: 1, backgroundColor: '#141416',
    borderRadius: 22, borderWidth: 0.5, borderColor: '#1E1E20',
    paddingHorizontal: 16, paddingVertical: 10,
    color: '#FFFFFF', fontSize: FontSize.body,
    maxHeight: 120, lineHeight: 20,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.teal,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 4,
  },
  sendBtnOff: { backgroundColor: '#1A1A1C', shadowOpacity: 0, elevation: 0 },
});
