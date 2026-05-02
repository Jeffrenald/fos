import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { VariationSheet } from '@/components/workout/VariationSheet';
import { EXERCISES, TEMPLATES, WorkoutTemplate, WorkoutType } from '@/constants/exercises';
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

function ExerciseRow({ id }: { id: string }) {
  const ex = EXERCISES.find(e => e.id === id);
  if (!ex) return null;
  return (
    <Card style={row.card}>
      <View style={row.inner}>
        <View style={{ flex: 1 }}>
          <Text style={row.name}>{ex.name}</Text>
          <Text style={row.muscles} numberOfLines={1}>
            {ex.musclesPrimary.join(' · ')}
          </Text>
        </View>
        <View style={row.metaCol}>
          <Text style={row.sets}>{ex.defaultSets}×{ex.defaultReps}</Text>
          <View style={row.typePill}>
            <Text style={row.typeText}>{ex.type}</Text>
          </View>
        </View>
      </View>
      <Text style={row.tip} numberOfLines={2}>{ex.instructions_en}</Text>
    </Card>
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

// ─── Template card (quick start) ─────────────────────────────────────────────

function TemplateCard({ template, onPress }: { template: WorkoutTemplate; onPress: () => void }) {
  const varCount = template.variations.length;
  return (
    <TouchableOpacity style={tmpl.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={tmpl.emoji}>{template.emoji}</Text>
      <Text style={tmpl.name}>{template.name}</Text>
      <Text style={tmpl.meta}>{varCount} levels</Text>
      <View style={tmpl.levelRow}>
        {template.variations.map(v => (
          <View
            key={v.id}
            style={[tmpl.levelDot, {
              backgroundColor:
                v.level === 'beginner'     ? '#3FCC93' :
                v.level === 'intermediate' ? Colors.teal : '#FF7A85',
            }]}
          />
        ))}
      </View>
    </TouchableOpacity>
  );
}

const tmpl = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: 16, marginRight: 12, width: 140, alignItems: 'center', gap: 6,
  },
  emoji:    { fontSize: 32 },
  name:     { color: Colors.textPrimary, fontSize: FontSize.body, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  meta:     { color: Colors.textMuted,   fontSize: FontSize.caption },
  levelRow: { flexDirection: 'row', gap: 4, marginTop: 2 },
  levelDot: { width: 8, height: 8, borderRadius: 4 },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function WorkoutScreen() {
  const user = useUserStore(s => s.user);
  const userLevel: Level = (user?.level as Level) ?? 'intermediate';

  const [filter, setFilter]           = useState<WorkoutType | 'all'>('all');
  const [selectedTemplate, setSelected] = useState<WorkoutTemplate | null>(null);
  const [sheetOpen, setSheetOpen]       = useState(false);

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
        <Text style={s.heading}>Train 🏋️</Text>

        {/* ── Quick start ── */}
        <Text style={s.section}>Quick Start</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {TEMPLATES.map(tmpl => (
            <TemplateCard key={tmpl.key} template={tmpl} onPress={() => openSheet(tmpl)} />
          ))}
        </ScrollView>

        {/* ── Exercise library ── */}
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

        {filtered.map(ex => <ExerciseRow key={ex.id} id={ex.id} />)}
      </ScreenWrapper>

      {/* ── Variation sheet ── */}
      <VariationSheet
        template={selectedTemplate}
        userLevel={userLevel}
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onStart={startVariation}
      />
    </>
  );
}

const s = StyleSheet.create({
  heading: { color: Colors.textPrimary, fontSize: FontSize.h1, fontFamily: 'Inter_500Medium', marginBottom: 20 },
  section: { color: Colors.textPrimary, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 12 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 0.5,
    borderColor: Colors.border, marginRight: 8,
    backgroundColor: Colors.surface,
  },
  chipActive:     { backgroundColor: Colors.tealDim, borderColor: Colors.teal },
  chipText:       { color: Colors.textMuted,  fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  chipTextActive: { color: Colors.teal },
});
