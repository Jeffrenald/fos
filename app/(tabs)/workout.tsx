import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { WorkoutTemplateCard } from '@/components/workout/WorkoutTemplateCard';
import { VariationSheet } from '@/components/workout/VariationSheet';
import { ExerciseDetailSheet } from '@/components/workout/ExerciseDetailSheet';
import { EXERCISES, TEMPLATES, WorkoutTemplate, WorkoutType, Exercise } from '@/constants/exercises';
import { useUserStore } from '@/stores/userStore';
import type { Level } from '@/constants/exercises';

// ─── Filter chips ─────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: WorkoutType | 'all' }[] = [
  { label: 'All',      value: 'all'  },
  { label: '💪 Push',  value: 'push' },
  { label: '🔗 Pull',  value: 'pull' },
  { label: '🦵 Legs',  value: 'legs' },
  { label: '🔥 Core',  value: 'core' },
];

// ─── Exercise row ─────────────────────────────────────────────────────────────

function ExerciseRow({ exercise, onPress }: { exercise: Exercise; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Card style={row.card}>
        <View style={row.inner}>
          <View style={{ flex: 1 }}>
            <Text style={row.name}>{exercise.name}</Text>
            <Text style={row.muscles} numberOfLines={1}>
              {exercise.musclesPrimary.join(' · ')}
              {exercise.musclesSecondary.length > 0 && ` · ${exercise.musclesSecondary.join(' · ')}`}
            </Text>
          </View>
          <View style={row.metaCol}>
            <Text style={row.sets}>{exercise.defaultSets}×{exercise.defaultReps}</Text>
            <View style={row.typePill}>
              <Text style={row.typeText}>{exercise.type}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textDim} style={{ marginLeft: 4 }} />
        </View>
        <Text style={row.tip} numberOfLines={1}>{exercise.instructions_en}</Text>
      </Card>
    </TouchableOpacity>
  );
}

const row = StyleSheet.create({
  card:    { marginBottom: 10 },
  inner:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 6 },
  name:    { color: Colors.textPrimary, fontSize: FontSize.body,    fontFamily: 'Inter_500Medium' },
  muscles: { color: Colors.textMuted,   fontSize: FontSize.caption, textTransform: 'capitalize', marginTop: 2 },
  metaCol: { alignItems: 'flex-end', gap: 6 },
  sets:    { color: Colors.teal,        fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  typePill:{ backgroundColor: Colors.tealDim, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  typeText:{ color: Colors.teal,        fontSize: 10, fontFamily: 'Inter_500Medium' },
  tip:     { color: Colors.textMuted,   fontSize: FontSize.caption, lineHeight: 18 },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function WorkoutScreen() {
  const user = useUserStore(s => s.user);
  const userLevel: Level = (user?.level as Level) ?? 'intermediate';

  const [filter, setFilter]              = useState<WorkoutType | 'all'>('all');
  const [selectedTemplate, setSelected]  = useState<WorkoutTemplate | null>(null);
  const [sheetOpen, setSheetOpen]        = useState(false);
  const [selectedExercise, setExercise]  = useState<Exercise | null>(null);
  const [detailOpen, setDetailOpen]      = useState(false);

  const filtered = filter === 'all'
    ? EXERCISES
    : EXERCISES.filter(e => e.type === filter);

  function openSheet(template: WorkoutTemplate) {
    setSelected(template);
    setSheetOpen(true);
  }

  function startVariation(variationId: string, exerciseIds: string[]) {
    const sessionId = `${variationId}-${Date.now()}`;
    router.push(`/workout/${sessionId}?variation=${variationId}&ids=${exerciseIds.join(',')}`);
  }

  return (
    <>
      <ScreenWrapper scrollable>

        {/* ── Header ── */}
        <Text style={s.heading}>Train 🏋️</Text>

        {/* ── Quick start ── */}
        <Text style={s.section}>Quick Start</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.cardScroll}
          contentContainerStyle={s.cardScrollContent}
        >
          {TEMPLATES.map(tmpl => (
            <WorkoutTemplateCard
              key={tmpl.key}
              template={tmpl}
              onPress={() => openSheet(tmpl)}
            />
          ))}
        </ScrollView>

        {/* ── Exercise library ── */}
        <Text style={s.section}>Exercise Library</Text>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.chipScroll}
          contentContainerStyle={s.chipScrollContent}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[s.chip, filter === f.value && s.chipActive]}
              onPress={() => setFilter(f.value as any)}
              activeOpacity={0.8}
            >
              <Text style={[s.chipText, filter === f.value && s.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Exercise list */}
        {filtered.map(ex => (
          <ExerciseRow
            key={ex.id}
            exercise={ex}
            onPress={() => { setExercise(ex); setDetailOpen(true); }}
          />
        ))}
      </ScreenWrapper>

      <VariationSheet
        template={selectedTemplate}
        userLevel={userLevel}
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onStart={startVariation}
      />

      <ExerciseDetailSheet
        exercise={selectedExercise}
        visible={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}

const s = StyleSheet.create({
  heading: {
    color: Colors.textPrimary,
    fontSize: FontSize.h1,
    fontFamily: 'Inter_500Medium',
    marginBottom: 20,
  },
  section: {
    color: Colors.textPrimary,
    fontSize: FontSize.bodyLg,
    fontFamily: 'Inter_500Medium',
    marginBottom: 14,
  },
  cardScroll:        { marginHorizontal: -Spacing.screenPadding },
  cardScrollContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 24 },

  chipScroll:        { marginHorizontal: -Spacing.screenPadding, marginBottom: 16 },
  chipScrollContent: { paddingHorizontal: Spacing.screenPadding, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: Radius.full, borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive:     { backgroundColor: Colors.tealDim, borderColor: Colors.teal },
  chipText:       { color: Colors.textMuted,  fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  chipTextActive: { color: Colors.teal },
});
