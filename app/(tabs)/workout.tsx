import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { WorkoutTemplateCard } from '@/components/workout/WorkoutTemplateCard';
import { VariationSheet } from '@/components/workout/VariationSheet';
import { ExerciseDetailSheet } from '@/components/workout/ExerciseDetailSheet';
import { UltimateGrowthSheet } from '@/components/plan/UltimateGrowthSheet';
import { MuscleMap, MuscleFilter, MUSCLE_TO_GROUP } from '@/components/train/MuscleMap';
import { EXERCISES, TEMPLATES, WorkoutTemplate, Exercise } from '@/constants/exercises';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/lib/supabase';
import type { Level } from '@/constants/exercises';

// ─── Not-recently-trained hook ────────────────────────────────────────────────

function useRecentExercises(userId: string | undefined) {
  const [recentIds, setRecentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 10);
    supabase
      .from('exercise_logs')
      .select('exercise_name')
      .gte('logged_at', cutoff.toISOString())
      .then(({ data }) => {
        if (!data) return;
        const names = new Set(data.map(r => r.exercise_name as string));
        const ids = new Set(
          EXERCISES.filter(e => names.has(e.name)).map(e => e.id)
        );
        setRecentIds(ids);
      });
  }, [userId]);

  return recentIds;
}

// ─── Superset badge ───────────────────────────────────────────────────────────

function SupersetBadge({ paired, onToggle }: { paired: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      style={[ss.badge, paired && ss.badgeActive]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Text style={[ss.badgeText, paired && ss.badgeTextActive]}>SS</Text>
    </TouchableOpacity>
  );
}

const ss = StyleSheet.create({
  badge: {
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 0.5,
    borderColor: '#333', backgroundColor: '#1E1E20',
  },
  badgeActive:     { backgroundColor: 'rgba(0,201,167,0.15)', borderColor: 'rgba(0,201,167,0.4)' },
  badgeText:       { color: '#555', fontSize: 9, fontFamily: 'Inter_500Medium' },
  badgeTextActive: { color: Colors.teal },
});

// ─── Exercise row ─────────────────────────────────────────────────────────────

function ExerciseRow({
  exercise, onPress, isSuperset, onToggleSuperset,
}: {
  exercise:         Exercise;
  onPress:          () => void;
  isSuperset:       boolean;
  onToggleSuperset: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Card style={[row.card, isSuperset && row.cardSuperset]}>
        <View style={row.inner}>
          <View style={{ flex: 1 }}>
            <Text style={row.name}>{exercise.name}</Text>
            <Text style={row.muscles} numberOfLines={1}>
              {[...exercise.musclesPrimary, ...exercise.musclesSecondary]
                .map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' · ')}
            </Text>
          </View>
          <View style={row.right}>
            <Text style={row.sets}>{exercise.defaultSets}×{exercise.defaultReps}</Text>
            <SupersetBadge paired={isSuperset} onToggle={onToggleSuperset} />
          </View>
          <Ionicons name="chevron-forward" size={14} color="#3A3A3E" style={{ marginLeft: 6 }} />
        </View>
        {isSuperset && (
          <View style={row.supersetTag}>
            <Text style={row.supersetTagText}>⚡ Superset</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const row = StyleSheet.create({
  card:        { marginBottom: 8 },
  cardSuperset:{ borderColor: 'rgba(0,201,167,0.35)', backgroundColor: 'rgba(0,201,167,0.04)' },
  inner:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name:        { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  muscles:     { color: '#555', fontSize: 10 },
  right:       { alignItems: 'flex-end', gap: 5 },
  sets:        { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  supersetTag: { marginTop: 6, flexDirection: 'row' },
  supersetTagText: { color: Colors.teal, fontSize: 9, fontFamily: 'Inter_500Medium' },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function WorkoutScreen() {
  const user      = useUserStore(s => s.user);
  const userLevel: Level = (user?.level as Level) ?? 'intermediate';
  const recentIds = useRecentExercises(user?.id);

  const [muscleFilter, setMuscleFilter]  = useState<MuscleFilter>('all');
  const [search, setSearch]              = useState('');
  const [supersets, setSupersets]        = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelected]  = useState<WorkoutTemplate | null>(null);
  const [sheetOpen, setSheetOpen]        = useState(false);
  const [selectedExercise, setExercise]  = useState<Exercise | null>(null);
  const [detailOpen, setDetailOpen]      = useState(false);
  const [ugOpen, setUgOpen]             = useState(false);

  const notTrained = EXERCISES.filter(e => !recentIds.has(e.id)).slice(0, 8);

  // Filter library by muscle map + search
  const filtered = EXERCISES.filter(ex => {
    const matchMuscle = muscleFilter === 'all'
      || MUSCLE_TO_GROUP[muscleFilter].some(m => [...ex.musclesPrimary, ...ex.musclesSecondary].includes(m as any))
      || (muscleFilter === 'chest'     && ex.type === 'push' && ex.musclesPrimary.includes('chest'))
      || (muscleFilter === 'back'      && ex.type === 'pull' && ex.musclesPrimary.includes('back'))
      || (muscleFilter === 'shoulders' && ex.musclesPrimary.includes('shoulders'))
      || (muscleFilter === 'arms'      && (ex.musclesPrimary.includes('biceps') || ex.musclesPrimary.includes('triceps')))
      || (muscleFilter === 'legs'      && ex.type === 'legs')
      || (muscleFilter === 'core'      && ex.type === 'core');
    const matchSearch = search === '' || ex.name.toLowerCase().includes(search.toLowerCase());
    return matchMuscle && matchSearch;
  });

  function toggleSuperset(id: string) {
    setSupersets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startSupersetSession() {
    const ids = Array.from(supersets);
    if (ids.length === 0) return;
    const sessionId = `superset-${Date.now()}`;
    router.push(`/workout/${sessionId}?variation=superset&ids=${ids.join(',')}`);
  }

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
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={s.cardScroll} contentContainerStyle={s.cardScrollContent}
        >
          {/* Ultimate Growth */}
          <TouchableOpacity style={s.ugCard} onPress={() => setUgOpen(true)} activeOpacity={0.85}>
            <View style={s.ugBar} />
            <Text style={s.ugCrown}>👑</Text>
            <Text style={s.ugName}>Ultimate{'\n'}Growth</Text>
            <Text style={s.ugSub}>5-day · Multi-muscle</Text>
            <View style={s.ugPill}><Text style={s.ugPillText}>Advanced</Text></View>
          </TouchableOpacity>

          {TEMPLATES.map(tmpl => (
            <WorkoutTemplateCard key={tmpl.key} template={tmpl} onPress={() => openSheet(tmpl)} />
          ))}
        </ScrollView>

        {/* ── Not trained recently ── */}
        {notTrained.length > 0 && user?.id && (
          <>
            <Text style={s.section}>You haven't trained these lately</Text>
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              style={s.notTrainedScroll} contentContainerStyle={s.cardScrollContent}
            >
              {notTrained.map(ex => (
                <TouchableOpacity
                  key={ex.id}
                  style={s.ntCard}
                  onPress={() => { setExercise(ex); setDetailOpen(true); }}
                  activeOpacity={0.8}
                >
                  <View style={s.ntTypeTag}>
                    <Text style={s.ntTypeText}>{ex.type}</Text>
                  </View>
                  <Text style={s.ntName}>{ex.name}</Text>
                  <Text style={s.ntMuscle} numberOfLines={1}>
                    {ex.musclesPrimary.join(' · ')}
                  </Text>
                  <Text style={s.ntSets}>{ex.defaultSets}×{ex.defaultReps}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Exercise library ── */}
        <Text style={[s.section, { marginTop: 4 }]}>Exercise Library</Text>

        {/* Muscle map */}
        <MuscleMap selected={muscleFilter} onChange={setMuscleFilter} />

        {/* Search */}
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={16} color="#555" />
          <TextInput
            style={s.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor="#444"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#555" />
            </TouchableOpacity>
          )}
        </View>

        {/* Superset banner */}
        {supersets.size > 0 && (
          <TouchableOpacity style={s.supersetBanner} onPress={startSupersetSession} activeOpacity={0.85}>
            <Ionicons name="flash" size={16} color={Colors.teal} />
            <Text style={s.supersetBannerText}>
              {supersets.size} superset{supersets.size > 1 ? 's' : ''} selected
            </Text>
            <View style={s.supersetStart}>
              <Text style={s.supersetStartText}>Start →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Exercise list */}
        {filtered.length === 0 ? (
          <Text style={s.emptyText}>No exercises match "{search}"</Text>
        ) : (
          filtered.map(ex => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              isSuperset={supersets.has(ex.id)}
              onToggleSuperset={() => toggleSuperset(ex.id)}
              onPress={() => { setExercise(ex); setDetailOpen(true); }}
            />
          ))
        )}
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

      <UltimateGrowthSheet visible={ugOpen} onClose={() => setUgOpen(false)} />
    </>
  );
}

const s = StyleSheet.create({
  heading: { color: '#FFFFFF', fontSize: FontSize.h1, fontFamily: 'Inter_500Medium', marginBottom: 20 },
  section: { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 14 },

  cardScroll:        { marginHorizontal: -Spacing.screenPadding },
  cardScrollContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 24 },

  // Ultimate Growth card
  ugCard: {
    width: 140, marginRight: 12,
    backgroundColor: '#1A1A1C', borderRadius: 20, overflow: 'hidden', paddingBottom: 14,
    borderWidth: 1, borderColor: 'rgba(240,176,64,0.35)',
    shadowColor: '#F0B040', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 6,
  },
  ugBar:   { height: 4, backgroundColor: '#F0B040', width: '100%', marginBottom: 14 },
  ugCrown: { fontSize: 30, textAlign: 'center', marginBottom: 8 },
  ugName:  { color: '#F0B040', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', textAlign: 'center', marginBottom: 6, paddingHorizontal: 10 },
  ugSub:   { color: '#666', fontSize: 10, textAlign: 'center', marginBottom: 10 },
  ugPill:  { backgroundColor: 'rgba(240,176,64,0.12)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'center', borderWidth: 0.5, borderColor: 'rgba(240,176,64,0.3)' },
  ugPillText: { color: '#F0B040', fontSize: 9, fontFamily: 'Inter_500Medium' },

  // Not trained recently
  notTrainedScroll: { marginHorizontal: -Spacing.screenPadding, marginBottom: 20 },
  ntCard: {
    width: 130, backgroundColor: '#1C1C1E',
    borderRadius: 14, borderWidth: 0.5, borderColor: '#2A2A2E',
    padding: 12, marginRight: 10, gap: 5,
  },
  ntTypeTag: { backgroundColor: '#242428', borderRadius: Radius.full, alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderWidth: 0.5, borderColor: '#333' },
  ntTypeText:{ color: '#666', fontSize: 8, fontFamily: 'Inter_500Medium' },
  ntName:    { color: '#FFFFFF', fontSize: FontSize.bodySm, fontFamily: 'Inter_500Medium' },
  ntMuscle:  { color: '#555', fontSize: 9, textTransform: 'capitalize' },
  ntSets:    { color: Colors.teal, fontSize: 9, fontFamily: 'Inter_500Medium', marginTop: 2 },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1E1E20', borderRadius: 12,
    borderWidth: 0.5, borderColor: '#2A2A2E',
    paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: FontSize.body, padding: 0 },

  // Superset banner
  supersetBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,201,167,0.08)',
    borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(0,201,167,0.3)',
    padding: 12, marginBottom: 12,
    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  supersetBannerText: { flex: 1, color: Colors.teal, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  supersetStart:      { backgroundColor: Colors.teal, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  supersetStartText:  { color: Colors.background, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },

  emptyText: { color: '#444', fontSize: FontSize.body, textAlign: 'center', marginTop: 24, fontStyle: 'italic' },
});
