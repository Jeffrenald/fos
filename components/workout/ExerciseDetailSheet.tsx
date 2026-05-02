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
  wrap:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, marginRight: 6, marginBottom: 6 },
  primary:       { backgroundColor: Colors.tealDim },
  secondary:     { backgroundColor: Colors.surfaceRaised },
  text:          { fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', textTransform: 'capitalize' },
  textPrimary:   { color: Colors.teal },
  textSecondary: { color: Colors.textMuted },
});

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={sec.row}>
      <Text style={sec.icon}>{icon}</Text>
      <Text style={sec.label}>{label}</Text>
    </View>
  );
}

const sec = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  icon:  { fontSize: 16 },
  label: { color: Colors.textPrimary, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});

// ─── Bullet item ─────────────────────────────────────────────────────────────

function Bullet({ text, color = Colors.teal, icon = '•' }: { text: string; color?: string; icon?: string }) {
  return (
    <View style={bul.row}>
      <Text style={[bul.dot, { color }]}>{icon}</Text>
      <Text style={bul.text}>{text}</Text>
    </View>
  );
}

const bul = StyleSheet.create({
  row:  { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  dot:  { fontSize: 14, lineHeight: 20, width: 14 },
  text: { color: Colors.textSecondary, fontSize: FontSize.bodySm, flex: 1, lineHeight: 20 },
});

// ─── Personal record stat ─────────────────────────────────────────────────────

function PRStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={pr.cell}>
      <Text style={pr.value}>{value}</Text>
      {sub ? <Text style={pr.sub}>{sub}</Text> : null}
      <Text style={pr.label}>{label}</Text>
    </View>
  );
}

const pr = StyleSheet.create({
  cell:  { flex: 1, alignItems: 'center' },
  value: { color: Colors.teal, fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  sub:   { color: Colors.textDim, fontSize: 10, marginTop: 1 },
  label: { color: Colors.textMuted, fontSize: 10, marginTop: 3, textAlign: 'center' },
});

// ─── Personal records loader ──────────────────────────────────────────────────

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

// ─── Main Sheet ───────────────────────────────────────────────────────────────

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

  const hasRecords = records && (records.maxWeight !== null || records.maxReps !== null);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={sheet.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        <View style={sheet.container}>
          {/* Handle */}
          <View style={sheet.handle} />

          {/* Header */}
          <View style={sheet.header}>
            <View style={{ flex: 1 }}>
              <View style={sheet.tagRow}>
                {exercise.musclesPrimary.map(m => (
                  <MuscleTag key={m} label={m} primary />
                ))}
                {exercise.musclesSecondary.map(m => (
                  <MuscleTag key={m} label={m} primary={false} />
                ))}
              </View>
              <Text style={sheet.title}>{exercise.name}</Text>
              <Text style={sheet.meta}>
                {exercise.defaultSets} sets · {exercise.defaultReps} reps · {exercise.defaultRest}s rest
              </Text>
            </View>
            <Pressable onPress={onClose} style={sheet.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            style={sheet.scroll}
            contentContainerStyle={sheet.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Technique */}
            <View style={sheet.section}>
              <SectionHeader icon="🎯" label="Technique" />
              <Text style={sheet.instructionText}>{exercise.instructions_en}</Text>
            </View>

            <View style={sheet.divider} />

            {/* Advantages */}
            <View style={sheet.section}>
              <SectionHeader icon="✅" label="Why do it" />
              {exercise.advantages.map((a, i) => (
                <Bullet key={i} text={a} color={Colors.teal} />
              ))}
            </View>

            <View style={sheet.divider} />

            {/* Avoid */}
            <View style={sheet.section}>
              <SectionHeader icon="⚠️" label="What to avoid" />
              {exercise.avoid.map((a, i) => (
                <Bullet key={i} text={a} color={Colors.danger} icon="✕" />
              ))}
            </View>

            <View style={sheet.divider} />

            {/* Personal records */}
            <View style={sheet.section}>
              <SectionHeader icon="📊" label="Your best" />
              {recordsLoading ? (
                <ActivityIndicator color={Colors.teal} size="small" style={{ marginVertical: 8 }} />
              ) : hasRecords ? (
                <View style={sheet.prRow}>
                  <PRStat
                    label="Max weight"
                    value={records.maxWeight ? `${records.maxWeight}kg` : '—'}
                  />
                  <View style={sheet.prDivider} />
                  <PRStat
                    label="Max reps"
                    value={records.maxReps ? `${records.maxReps}` : '—'}
                    sub={records.maxWeight ? `@ ${records.maxWeight}kg` : undefined}
                  />
                  <View style={sheet.prDivider} />
                  <PRStat
                    label="Sessions"
                    value={`${records.sessions}`}
                  />
                </View>
              ) : (
                <Text style={sheet.noRecord}>
                  No data yet — log this exercise to track your personal best.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const sheet = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    height: SCREEN_HEIGHT * 0.82,
    backgroundColor: Colors.background,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    borderTopWidth: 0.5,
    borderColor: Colors.border,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  tagRow:  { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  title:   { color: Colors.textPrimary, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  meta:    { color: Colors.textMuted,   fontSize: FontSize.caption },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },

  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  section:  { paddingHorizontal: Spacing.screenPadding, paddingVertical: 18 },
  divider:  { height: 0.5, backgroundColor: Colors.border, marginHorizontal: Spacing.screenPadding },

  instructionText: {
    color: Colors.textSecondary,
    fontSize: FontSize.bodySm,
    lineHeight: 22,
  },

  prRow:     { flexDirection: 'row', alignItems: 'center' },
  prDivider: { width: 0.5, height: 40, backgroundColor: Colors.border },

  noRecord: {
    color: Colors.textDim,
    fontSize: FontSize.caption,
    fontStyle: 'italic',
  },
});
