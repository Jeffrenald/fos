import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, Vibration, SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { EXERCISES, WORKOUT_TEMPLATES, Exercise } from '@/constants/exercises';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SetLog { weight: string; reps: string; done: boolean; }

// ─── Rest Timer ──────────────────────────────────────────────────────────────

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft]       = useState(seconds);
  const [running, setRunning] = useState(true);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setLeft(l => {
        if (l <= 1) {
          clearInterval(ref.current!);
          Vibration.vibrate([0, 200, 100, 200]);
          onDone();
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, [running, onDone]);

  const mins = Math.floor(left / 60);
  const secs = left % 60;

  return (
    <TouchableOpacity
      style={timer.wrap}
      onPress={() => setRunning(r => !r)}
      activeOpacity={0.8}
    >
      <View style={[timer.ring, { borderColor: left < 10 ? Colors.danger : Colors.teal }]}>
        <Text style={timer.time}>{mins}:{secs.toString().padStart(2, '0')}</Text>
        <Text style={timer.tap}>{running ? 'tap to pause' : 'tap to resume'}</Text>
      </View>
      <Text style={timer.label}>Rest Timer</Text>
    </TouchableOpacity>
  );
}

const timer = StyleSheet.create({
  wrap:  { alignItems: 'center', paddingVertical: 20 },
  ring: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 4, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  time:  { color: Colors.textPrimary, fontSize: 42, fontFamily: 'Inter_500Medium' },
  tap:   { color: Colors.textMuted,   fontSize: FontSize.caption, marginTop: 4 },
  label: { color: Colors.textMuted,   fontSize: FontSize.bodySm, marginTop: 12 },
});

// ─── Set Logger ──────────────────────────────────────────────────────────────

function SetLogger({
  exercise, logs, onUpdate, onSetDone,
}: {
  exercise: Exercise;
  logs: SetLog[];
  onUpdate: (i: number, field: 'weight' | 'reps', val: string) => void;
  onSetDone: (i: number) => void;
}) {
  return (
    <View>
      {/* Header row */}
      <View style={sl.headerRow}>
        <Text style={[sl.col, sl.colSet]}>SET</Text>
        <Text style={[sl.col, sl.colKg]}>KG</Text>
        <Text style={[sl.col, sl.colReps]}>REPS</Text>
        <Text style={[sl.col, sl.colDone]}></Text>
      </View>

      {logs.map((log, i) => (
        <View key={i} style={[sl.row, log.done && sl.rowDone]}>
          <Text style={[sl.col, sl.colSet, sl.setNum]}>{i + 1}</Text>
          <TextInput
            style={[sl.col, sl.colKg, sl.input, log.done && sl.inputDone]}
            value={log.weight}
            onChangeText={v => onUpdate(i, 'weight', v)}
            keyboardType="decimal-pad"
            placeholder={exercise.defaultReps !== 'BW' ? '0' : 'BW'}
            placeholderTextColor={Colors.textDim}
            editable={!log.done}
          />
          <TextInput
            style={[sl.col, sl.colReps, sl.input, log.done && sl.inputDone]}
            value={log.reps}
            onChangeText={v => onUpdate(i, 'reps', v)}
            keyboardType="number-pad"
            placeholder={exercise.defaultReps}
            placeholderTextColor={Colors.textDim}
            editable={!log.done}
          />
          <TouchableOpacity
            style={[sl.col, sl.colDone, sl.checkBtn, log.done && sl.checkDone]}
            onPress={() => onSetDone(i)}
          >
            <Ionicons
              name={log.done ? 'checkmark' : 'ellipse-outline'}
              size={22}
              color={log.done ? Colors.background : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const sl = StyleSheet.create({
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 4, marginBottom: 8,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 0.5, borderColor: Colors.border,
    marginBottom: 8, paddingVertical: 10, paddingHorizontal: 4,
  },
  rowDone:  { backgroundColor: Colors.tealDim, borderColor: Colors.tealBorder },
  col:      { textAlign: 'center' },
  colSet:   { width: 40, color: Colors.textMuted, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  colKg:    { flex: 1 },
  colReps:  { flex: 1 },
  colDone:  { width: 44, alignItems: 'center' },
  setNum:   { color: Colors.textSecondary, fontFamily: 'Inter_500Medium' },
  input: {
    color: Colors.textPrimary, fontSize: FontSize.bodyLg,
    fontFamily: 'Inter_500Medium', textAlign: 'center',
    paddingVertical: 4,
  },
  inputDone: { color: Colors.teal },
  checkBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center', justifyContent: 'center',
  },
  checkDone: { backgroundColor: Colors.teal },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function WorkoutSessionScreen() {
  const { sessionId, template } = useLocalSearchParams<{ sessionId: string; template: string }>();
  const user = useUserStore(s => s.user);

  // Build exercise list from template
  const exercises: Exercise[] = (() => {
    const tmpl = WORKOUT_TEMPLATES[template ?? 'push'];
    return tmpl ? tmpl.exerciseIds.map(id => EXERCISES.find(e => e.id === id)!).filter(Boolean) : [];
  })();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [sets, setSets]             = useState<SetLog[][]>(() =>
    exercises.map(ex => Array.from({ length: ex.defaultSets }, () => ({ weight: '', reps: '', done: false })))
  );
  const [resting, setResting]       = useState(false);
  const [startedAt]                 = useState(() => new Date());
  const [saving, setSaving]         = useState(false);

  const current = exercises[currentIdx];
  const currentSets = sets[currentIdx] ?? [];
  const allSetsDone = currentSets.length > 0 && currentSets.every(s => s.done);
  const isLast = currentIdx === exercises.length - 1;
  const progress = ((currentIdx) / exercises.length) * 100;

  function updateSet(exIdx: number, setIdx: number, field: 'weight' | 'reps', val: string) {
    setSets(prev => {
      const next = prev.map(s => [...s]);
      next[exIdx][setIdx] = { ...next[exIdx][setIdx], [field]: val };
      return next;
    });
  }

  function markSetDone(setIdx: number) {
    setSets(prev => {
      const next = prev.map(s => [...s]);
      const set = { ...next[currentIdx][setIdx] };
      set.done = !set.done;
      next[currentIdx][setIdx] = set;
      return next;
    });
    // Auto-start rest timer when set is marked done
    if (!currentSets[setIdx].done) setResting(true);
  }

  function nextExercise() {
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(i => i + 1);
      setResting(false);
    }
  }

  async function finishSession() {
    setSaving(true);
    try {
      const endedAt   = new Date();
      const duration  = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);
      const volume    = sets.flat().reduce((sum, s) => {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps) || 0;
        return sum + w * r;
      }, 0);

      const { data: session } = await supabase
        .from('workout_sessions')
        .insert({
          user_id:          user?.id,
          started_at:       startedAt.toISOString(),
          completed_at:     endedAt.toISOString(),
          duration_seconds: duration,
          total_volume_kg:  Math.round(volume * 10) / 10,
        })
        .select('id')
        .single();

      if (session) {
        const logs = exercises.flatMap((ex, exIdx) =>
          sets[exIdx].map((set, setIdx) => ({
            session_id:    session.id,
            exercise_name: ex.name,
            muscle_group:  ex.musclesPrimary[0],
            set_number:    setIdx + 1,
            weight_kg:     parseFloat(set.weight) || null,
            reps:          parseInt(set.reps) || null,
          }))
        );
        await supabase.from('exercise_logs').insert(logs);
      }

      router.replace('/(tabs)');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function confirmFinish() {
    Alert.alert(
      'Finish Session?',
      `${exercises.length} exercises · ${Math.round((Date.now() - startedAt.getTime()) / 60000)} min`,
      [
        { text: 'Keep Going', style: 'cancel' },
        { text: 'Finish 💪', onPress: finishSession },
      ]
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={screen.root}>
        <Text style={{ color: Colors.textPrimary, padding: 20 }}>No exercises found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screen.root}>
      {/* ── Header ── */}
      <View style={screen.header}>
        <TouchableOpacity onPress={() => Alert.alert('Quit?', 'Session progress will be lost.', [
          { text: 'Cancel' },
          { text: 'Quit', style: 'destructive', onPress: () => router.back() },
        ])}>
          <Ionicons name="close" size={24} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 16 }}>
          <View style={screen.progressBar}>
            <View style={[screen.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={screen.progressText}>{currentIdx + 1} / {exercises.length}</Text>
        </View>
        <TouchableOpacity onPress={confirmFinish}>
          <Text style={screen.finishLink}>Finish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={screen.scroll} keyboardShouldPersistTaps="handled">
        {/* ── Exercise hero ── */}
        <View style={screen.hero}>
          <View style={screen.heroTagRow}>
            {current.musclesPrimary.map(m => (
              <View key={m} style={screen.muscleTag}>
                <Text style={screen.muscleTagText}>{m}</Text>
              </View>
            ))}
          </View>
          <Text style={screen.exerciseName}>{current.name}</Text>
          <Text style={screen.exerciseTip}>{current.instructions_en}</Text>
        </View>

        {/* ── Rest timer ── */}
        {resting && (
          <RestTimer
            seconds={current.defaultRest}
            onDone={() => setResting(false)}
          />
        )}

        {/* ── Set logger ── */}
        <View style={{ paddingHorizontal: Spacing.screenPadding }}>
          <SetLogger
            exercise={current}
            logs={currentSets}
            onUpdate={(i, field, val) => updateSet(currentIdx, i, field, val)}
            onSetDone={markSetDone}
          />
        </View>

        {/* ── Rest toggle ── */}
        {!resting && (
          <TouchableOpacity
            style={screen.restBtn}
            onPress={() => setResting(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="timer-outline" size={18} color={Colors.teal} />
            <Text style={screen.restBtnText}>Start {current.defaultRest}s rest</Text>
          </TouchableOpacity>
        )}

        {/* ── Next / Finish ── */}
        <View style={screen.footer}>
          {!isLast ? (
            <TouchableOpacity
              style={[screen.nextBtn, !allSetsDone && screen.nextBtnDim]}
              onPress={nextExercise}
              activeOpacity={0.85}
            >
              <Text style={screen.nextBtnText}>Next: {exercises[currentIdx + 1]?.name}</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.background} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={screen.nextBtn}
              onPress={confirmFinish}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={screen.nextBtnText}>
                {saving ? 'Saving…' : 'Finish Session 💪'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const screen = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  progressBar: {
    height: 4, backgroundColor: Colors.surfaceRaised,
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill:   { height: 4, backgroundColor: Colors.teal },
  progressText:   { color: Colors.textMuted, fontSize: FontSize.caption, marginTop: 4 },
  finishLink:     { color: Colors.teal, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },

  hero: {
    backgroundColor: Colors.surface,
    padding: Spacing.screenPadding, paddingTop: 24, paddingBottom: 24,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
    marginBottom: 20,
  },
  heroTagRow:     { flexDirection: 'row', gap: 8, marginBottom: 10 },
  muscleTag: {
    backgroundColor: Colors.tealDim, paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: Radius.full,
  },
  muscleTagText:  { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', textTransform: 'capitalize' },
  exerciseName:   { color: Colors.textPrimary, fontSize: FontSize.h1, fontFamily: 'Inter_500Medium', marginBottom: 8 },
  exerciseTip:    { color: Colors.textMuted,   fontSize: FontSize.bodySm, lineHeight: 20 },

  restBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'center', marginTop: 8, marginBottom: 20,
    backgroundColor: Colors.tealDim, borderRadius: Radius.full,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  restBtnText:    { color: Colors.teal, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },

  footer:         { paddingHorizontal: Spacing.screenPadding, marginTop: 24 },
  nextBtn: {
    backgroundColor: Colors.teal, borderRadius: 14,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnDim:     { opacity: 0.6 },
  nextBtnText:    { color: Colors.background, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },
});
