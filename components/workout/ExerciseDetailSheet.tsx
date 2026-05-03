import { useEffect, useState } from 'react';
import {
  Modal, View, Text, StyleSheet, Pressable,
  ScrollView, Dimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { Exercise } from '@/constants/exercises';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// ─── Depth palette ────────────────────────────────────────────────────────────
const E = {
  sheet:   '#1C1C1E',
  card:    '#242428',
  line:    '#333338',
};

// ─── Section glow configs ─────────────────────────────────────────────────────
const SECTIONS = {
  technique: { icon: '🎯', label: 'Technique',    color: '#00C9A7', iconBg: 'rgba(0,201,167,0.18)'    },
  why:       { icon: '✅', label: 'Why do it',    color: '#3FCC93', iconBg: 'rgba(63,204,147,0.18)'   },
  avoid:     { icon: '⚠️', label: 'What to avoid', color: '#FF7A85', iconBg: 'rgba(255,122,133,0.18)' },
  stats:     { icon: '📊', label: 'Your best',    color: '#6FA8FF', iconBg: 'rgba(111,168,255,0.18)'  },
};

// ─── Glow helpers ─────────────────────────────────────────────────────────────
// Cross-platform glow: colored border + faint bg tint + iOS shadow
function glowStyle(color: string, intensity: number = 1) {
  return {
    borderColor: `${color}${Math.round(55 * intensity).toString(16).padStart(2, '0')}`,
    backgroundColor: `${color}${Math.round(14 * intensity).toString(16).padStart(2, '0')}`,
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45 * intensity,
    shadowRadius: 10 * intensity,
    elevation: 4,
  } as const;
}

// ─── Muscle tag ───────────────────────────────────────────────────────────────
function MuscleTag({ label, primary }: { label: string; primary: boolean }) {
  return (
    <View style={[mt.wrap, primary ? mt.primary : mt.secondary]}>
      <Text style={[mt.text, primary ? mt.textP : mt.textS]}>{label}</Text>
    </View>
  );
}
const mt = StyleSheet.create({
  wrap:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, marginRight: 6, marginBottom: 6, borderWidth: 0.5 },
  primary: { backgroundColor: 'rgba(0,201,167,0.15)', borderColor: 'rgba(0,201,167,0.4)' },
  secondary:{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' },
  text:    { fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', textTransform: 'capitalize' },
  textP:   { color: '#00C9A7' },
  textS:   { color: '#AAAAAA' },
});

// ─── Section card with glow ───────────────────────────────────────────────────
function SectionCard({
  sectionKey, children,
}: {
  sectionKey: keyof typeof SECTIONS;
  children: React.ReactNode;
}) {
  const cfg = SECTIONS[sectionKey];
  return (
    <View style={[sc.card, { borderColor: `${cfg.color}40`, ...glowBorder(cfg.color) }]}>
      {/* Colored top accent line */}
      <View style={[sc.topLine, { backgroundColor: cfg.color }]} />

      <View style={sc.inner}>
        <View style={sc.header}>
          {/* Icon box with stronger glow */}
          <View style={[sc.iconWrap, { backgroundColor: cfg.iconBg, ...iconGlow(cfg.color) }]}>
            <Text style={sc.iconText}>{cfg.icon}</Text>
          </View>
          <Text style={sc.label}>{cfg.label}</Text>
        </View>
        {children}
      </View>
    </View>
  );
}

function glowBorder(color: string) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  };
}
function iconGlow(color: string) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: `${color}55`,
  };
}

const sc = StyleSheet.create({
  card: {
    backgroundColor: E.card,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  topLine: { height: 2, width: '100%' },
  inner:   { padding: 16 },
  header:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  iconWrap:{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconText:{ fontSize: 16 },
  label:   { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});

// ─── Bullet ───────────────────────────────────────────────────────────────────
function Bullet({ text, variant }: { text: string; variant: 'good' | 'bad' }) {
  const isGood = variant === 'good';
  const color  = isGood ? '#3FCC93' : '#FF7A85';
  return (
    <View style={bul.row}>
      <View style={[bul.dot, {
        backgroundColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 6,
        elevation: 3,
      }]}>
        <Ionicons name={isGood ? 'checkmark' : 'close'} size={10} color="#000" />
      </View>
      <Text style={bul.text}>{text}</Text>
    </View>
  );
}
const bul = StyleSheet.create({
  row:  { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  dot:  { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  text: { color: '#CCCCCC', fontSize: FontSize.bodySm, flex: 1, lineHeight: 20 },
});

// ─── Stat cell ────────────────────────────────────────────────────────────────
function StatCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={stat.cell}>
      <Text style={[stat.value, {
        // teal text glow on iOS
        textShadowColor: 'rgba(0,201,167,0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      }]}>{value}</Text>
      {sub ? <Text style={stat.sub}>{sub}</Text> : null}
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}
const stat = StyleSheet.create({
  cell:  { flex: 1, alignItems: 'center', paddingVertical: 4 },
  value: { color: Colors.teal, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  sub:   { color: '#666', fontSize: 10, marginTop: 1 },
  label: { color: '#666', fontSize: 10, marginTop: 4, textAlign: 'center' },
});

// ─── Records hook ─────────────────────────────────────────────────────────────
interface Records { maxWeight: number | null; maxReps: number | null; sessions: number; }

function usePersonalRecords(exerciseName: string, visible: boolean) {
  const user = useUserStore(s => s.user);
  const [data, setData]       = useState<Records | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !user?.id) return;
    setLoading(true);
    supabase
      .from('exercise_logs')
      .select('weight_kg, reps, session_id')
      .eq('exercise_name', exerciseName)
      .then(({ data: rows }) => {
        if (!rows || rows.length === 0) {
          setData({ maxWeight: null, maxReps: null, sessions: 0 });
        } else {
          const weights  = rows.map(r => r.weight_kg).filter(Boolean) as number[];
          const reps     = rows.map(r => r.reps).filter(Boolean) as number[];
          const sessions = new Set(rows.map(r => r.session_id)).size;
          setData({
            maxWeight: weights.length ? Math.max(...weights) : null,
            maxReps:   reps.length   ? Math.max(...reps)    : null,
            sessions,
          });
        }
        setLoading(false);
      });
  }, [exerciseName, visible, user?.id]);

  return { data, loading };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface ExerciseDetailSheetProps {
  exercise: Exercise | null;
  visible:  boolean;
  onClose:  () => void;
}

export function ExerciseDetailSheet({ exercise, visible, onClose }: ExerciseDetailSheetProps) {
  const { data: records, loading: recordsLoading } = usePersonalRecords(
    exercise?.name ?? '', visible
  );
  if (!exercise) return null;

  const hasRecords = records && (records.maxWeight !== null || records.maxReps !== null || records.sessions > 0);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        <View style={s.container}>
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <View style={s.tagRow}>
                {exercise.musclesPrimary.map(m => <MuscleTag key={m} label={m} primary />)}
                {exercise.musclesSecondary.map(m => <MuscleTag key={m} label={m} primary={false} />)}
              </View>
              <Text style={s.title}>{exercise.name}</Text>
              <Text style={s.meta}>
                {exercise.defaultSets} sets · {exercise.defaultReps} reps · {exercise.defaultRest}s rest
              </Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={18} color="#777" />
            </Pressable>
          </View>

          <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

            <SectionCard sectionKey="technique">
              <Text style={s.instrText}>{exercise.instructions_en}</Text>
            </SectionCard>

            <SectionCard sectionKey="why">
              {exercise.advantages.map((a, i) => <Bullet key={i} text={a} variant="good" />)}
            </SectionCard>

            <SectionCard sectionKey="avoid">
              {exercise.avoid.map((a, i) => <Bullet key={i} text={a} variant="bad" />)}
            </SectionCard>

            <SectionCard sectionKey="stats">
              {recordsLoading ? (
                <ActivityIndicator color={Colors.teal} size="small" />
              ) : hasRecords ? (
                <View style={s.statsRow}>
                  <StatCell label="Max weight" value={records!.maxWeight ? `${records!.maxWeight}kg` : '—'} />
                  <View style={s.statDiv} />
                  <StatCell
                    label="Max reps"
                    value={records!.maxReps ? `${records!.maxReps}` : '—'}
                    sub={records!.maxWeight ? `@ ${records!.maxWeight}kg` : undefined}
                  />
                  <View style={s.statDiv} />
                  <StatCell label="Sessions" value={`${records!.sessions}`} />
                </View>
              ) : (
                <Text style={s.noRecord}>
                  No data yet — complete a session with this exercise to see your personal bests.
                </Text>
              )}
            </SectionCard>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  container: {
    height: SCREEN_HEIGHT * 0.84,
    backgroundColor: E.sheet,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: E.line,
  },
  handle: {
    width: 36, height: 4, backgroundColor: '#444',
    borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: E.line, gap: 12,
  },
  tagRow:   { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  title:    { color: '#FFFFFF', fontSize: FontSize.h2, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  meta:     { color: '#777', fontSize: FontSize.caption },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.screenPadding, paddingBottom: 40 },
  instrText:{ color: '#CCCCCC', fontSize: FontSize.bodySm, lineHeight: 22 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statDiv:  { width: 1, height: 44, backgroundColor: E.line },
  noRecord: { color: '#555', fontSize: FontSize.caption, fontStyle: 'italic', lineHeight: 18 },
});
