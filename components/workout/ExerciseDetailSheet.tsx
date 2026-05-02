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

// ─── Elevation palette (lifts sheet off the app background) ──────────────────
const E = {
  sheet:   '#1C1C1E',   // sheet background — clearly above app #0A0A0A
  card:    '#242428',   // section cards — lifted off sheet
  cardAlt: '#2A2A2E',   // alternate raised card
  line:    '#333338',   // visible divider
};

// ─── Muscle tag ───────────────────────────────────────────────────────────────

function MuscleTag({ label, primary }: { label: string; primary: boolean }) {
  return (
    <View style={[mt.wrap, primary ? mt.primary : mt.secondary]}>
      <Text style={[mt.text, primary ? mt.textPrimary : mt.textSecondary]}>
        {label}
      </Text>
    </View>
  );
}

const mt = StyleSheet.create({
  wrap:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, marginRight: 6, marginBottom: 6 },
  primary:       { backgroundColor: 'rgba(0,201,167,0.18)', borderWidth: 0.5, borderColor: Colors.tealBorder },
  secondary:     { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  text:          { fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', textTransform: 'capitalize' },
  textPrimary:   { color: Colors.teal },
  textSecondary: { color: '#AAAAAA' },
});

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon, label, iconBg, children,
}: {
  icon: string; label: string; iconBg: string; children: React.ReactNode;
}) {
  return (
    <View style={sc.card}>
      <View style={sc.header}>
        <View style={[sc.iconWrap, { backgroundColor: iconBg }]}>
          <Text style={sc.iconText}>{icon}</Text>
        </View>
        <Text style={sc.label}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    backgroundColor: E.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: E.line,
    padding: 16,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 16 },
  label:    { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});

// ─── Bullet ───────────────────────────────────────────────────────────────────

function Bullet({ text, variant }: { text: string; variant: 'good' | 'bad' }) {
  const isGood = variant === 'good';
  return (
    <View style={bul.row}>
      <View style={[bul.dot, { backgroundColor: isGood ? Colors.teal : Colors.danger }]}>
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
      <Text style={stat.value}>{value}</Text>
      {sub ? <Text style={stat.sub}>{sub}</Text> : null}
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  cell:  { flex: 1, alignItems: 'center', paddingVertical: 4 },
  value: { color: Colors.teal, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  sub:   { color: '#888', fontSize: 10, marginTop: 1 },
  label: { color: '#888', fontSize: 10, marginTop: 4, textAlign: 'center' },
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

// ─── Main component ───────────────────────────────────────────────────────────

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

          {/* ── Header ── */}
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
              <Ionicons name="close" size={18} color="#888" />
            </Pressable>
          </View>

          {/* ── Scrollable content ── */}
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Technique */}
            <SectionCard icon="🎯" label="Technique" iconBg="rgba(0,201,167,0.15)">
              <Text style={s.instructionText}>{exercise.instructions_en}</Text>
            </SectionCard>

            {/* Why do it */}
            <SectionCard icon="✅" label="Why do it" iconBg="rgba(63,204,147,0.15)">
              {exercise.advantages.map((a, i) => <Bullet key={i} text={a} variant="good" />)}
            </SectionCard>

            {/* Avoid */}
            <SectionCard icon="⚠️" label="What to avoid" iconBg="rgba(255,122,133,0.15)">
              {exercise.avoid.map((a, i) => <Bullet key={i} text={a} variant="bad" />)}
            </SectionCard>

            {/* Personal records */}
            <SectionCard icon="📊" label="Your best" iconBg="rgba(111,168,255,0.15)">
              {recordsLoading ? (
                <ActivityIndicator color={Colors.teal} size="small" />
              ) : hasRecords ? (
                <View style={s.statsRow}>
                  <StatCell
                    label="Max weight"
                    value={records!.maxWeight ? `${records!.maxWeight}kg` : '—'}
                  />
                  <View style={s.statsDivider} />
                  <StatCell
                    label="Max reps"
                    value={records!.maxReps ? `${records!.maxReps}` : '—'}
                    sub={records!.maxWeight ? `@ ${records!.maxWeight}kg` : undefined}
                  />
                  <View style={s.statsDivider} />
                  <StatCell
                    label="Sessions"
                    value={`${records!.sessions}`}
                  />
                </View>
              ) : (
                <Text style={s.noRecord}>
                  No data yet — complete a session with this exercise to see your personal bests here.
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    height: SCREEN_HEIGHT * 0.84,
    backgroundColor: E.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: E.line,
  },
  handle: {
    width: 36, height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10, marginBottom: 4,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: E.line,
    gap: 12,
  },
  tagRow:  { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  title:   { color: '#FFFFFF', fontSize: FontSize.h2, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  meta:    { color: '#888', fontSize: FontSize.caption },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#2A2A2E',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },

  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.screenPadding, paddingBottom: 40 },

  instructionText: {
    color: '#CCCCCC',
    fontSize: FontSize.bodySm,
    lineHeight: 22,
  },

  statsRow:     { flexDirection: 'row', alignItems: 'center' },
  statsDivider: { width: 1, height: 44, backgroundColor: E.line },

  noRecord: {
    color: '#666',
    fontSize: FontSize.caption,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
