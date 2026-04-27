import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { EXERCISES, WORKOUT_TEMPLATES, Exercise, WorkoutType } from '@/constants/exercises';

const FILTERS: { label: string; value: WorkoutType | 'all' }[] = [
  { label: 'All',  value: 'all'  },
  { label: '💪 Push', value: 'push' },
  { label: '🔗 Pull', value: 'pull' },
  { label: '🦵 Legs', value: 'legs' },
  { label: '🔥 Core', value: 'core' },
];

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <Card style={s.exCard}>
      <View style={s.exRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.exName}>{exercise.name}</Text>
          <Text style={s.exMuscles}>
            {exercise.musclesPrimary.join(', ')}
            {exercise.musclesSecondary.length > 0 && ` · ${exercise.musclesSecondary.join(', ')}`}
          </Text>
        </View>
        <View style={s.exMeta}>
          <Text style={s.exSets}>{exercise.defaultSets}×{exercise.defaultReps}</Text>
          <Tag label={exercise.type} variant="teal" />
        </View>
      </View>
      <Text style={s.exInstructions} numberOfLines={2}>{exercise.instructions_en}</Text>
    </Card>
  );
}

export default function WorkoutScreen() {
  const [filter, setFilter] = useState<WorkoutType | 'all'>('all');

  const filtered = filter === 'all' ? EXERCISES : EXERCISES.filter(e => e.type === filter);

  function startTemplate(key: string) {
    const sessionId = `${key}-${Date.now()}`;
    router.push(`/workout/${sessionId}?template=${key}`);
  }

  return (
    <ScreenWrapper scrollable>
      <Text style={s.heading}>{`Train 🏋️`}</Text>

      {/* Quick start */}
      <Text style={s.section}>Quick Start</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
        {Object.entries(WORKOUT_TEMPLATES).map(([key, tmpl]) => (
          <TouchableOpacity
            key={key}
            style={s.tmplCard}
            onPress={() => startTemplate(key)}
            activeOpacity={0.8}
          >
            <Text style={s.tmplEmoji}>{tmpl.emoji}</Text>
            <Text style={s.tmplName}>{tmpl.name}</Text>
            <Text style={s.tmplCount}>{tmpl.exerciseIds.length} exercises</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter chips */}
      <Text style={s.section}>Exercise Library</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[s.chip, filter === f.value && s.chipActive]}
            onPress={() => setFilter(f.value as any)}
            activeOpacity={0.8}
          >
            <Text style={[s.chipText, filter === f.value && s.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise list */}
      {filtered.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  heading: { color: Colors.textPrimary, fontSize: FontSize.h1, fontFamily: 'Inter_500Medium', marginBottom: 20 },
  section: { color: Colors.textPrimary, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 12 },

  tmplCard: {
    backgroundColor: Colors.surface, borderRadius: 18,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: 16, marginRight: 12, width: 130, alignItems: 'center', gap: 6,
  },
  tmplEmoji: { fontSize: 30 },
  tmplName:  { color: Colors.textPrimary, fontSize: FontSize.body, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  tmplCount: { color: Colors.textMuted,   fontSize: FontSize.caption },

  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 0.5,
    borderColor: Colors.border, marginRight: 8,
    backgroundColor: Colors.surface,
  },
  chipActive:     { backgroundColor: Colors.tealDim, borderColor: Colors.teal },
  chipText:       { color: Colors.textMuted,   fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  chipTextActive: { color: Colors.teal },

  exCard:         { marginBottom: 10 },
  exRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  exName:         { color: Colors.textPrimary, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  exMuscles:      { color: Colors.textMuted,   fontSize: FontSize.caption, marginTop: 2, textTransform: 'capitalize' },
  exMeta:         { alignItems: 'flex-end', gap: 6 },
  exSets:         { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  exInstructions: { color: Colors.textMuted, fontSize: FontSize.caption, lineHeight: 18 },
});
