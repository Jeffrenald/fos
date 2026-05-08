import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Animated, FlatList,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { Card } from '@/components/ui/Card';
import { WorkoutTemplateCard } from '@/components/workout/WorkoutTemplateCard';
import { VariationSheet } from '@/components/workout/VariationSheet';
import { ExerciseDetailSheet } from '@/components/workout/ExerciseDetailSheet';
import { UltimateGrowthSheet } from '@/components/plan/UltimateGrowthSheet';
import { MuscleMap, MuscleFilter, MUSCLE_TO_GROUP } from '@/components/train/MuscleMap';
import { EXERCISES, TEMPLATES, WorkoutTemplate, Exercise, WorkoutType } from '@/constants/exercises';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/lib/supabase';
import type { Level } from '@/constants/exercises';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'start' | 'library';
type TypeFilter = 'all' | WorkoutType;

// ─── Hooks ───────────────────────────────────────────────────────────────────

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
        setRecentIds(new Set(EXERCISES.filter(e => names.has(e.name)).map(e => e.id)));
      });
  }, [userId]);
  return recentIds;
}

// ─── Animated tab indicator ───────────────────────────────────────────────────

function TabSwitcher({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const indicator = useRef(new Animated.Value(active === 'start' ? 0 : 1)).current;

  function switchTo(t: Tab) {
    onChange(t);
    Animated.spring(indicator, {
      toValue: t === 'start' ? 0 : 1,
      useNativeDriver: true,
      tension: 80, friction: 12,
    }).start();
  }

  const translateX = indicator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  return (
    <View style={ts.wrap}>
      {/* Sliding teal underline */}
      <Animated.View style={[ts.indicator, { transform: [{ translateX }] }]} />

      {(['start', 'library'] as Tab[]).map(t => (
        <TouchableOpacity
          key={t}
          style={ts.tab}
          onPress={() => switchTo(t)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={t === 'start'
              ? (active === 'start' ? 'flash' : 'flash-outline')
              : (active === 'library' ? 'barbell' : 'barbell-outline')}
            size={16}
            color={active === t ? Colors.teal : '#444'}
          />
          <Text style={[ts.label, active === t && ts.labelActive]}>
            {t === 'start' ? 'Start' : 'Library'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const ts = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: '#141416',
    borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: '#222',
    padding: 4, marginBottom: 20,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4, left: 4,
    width: 120, bottom: 4,
    backgroundColor: 'rgba(0,201,167,0.12)',
    borderRadius: Radius.md,
    borderWidth: 0.5, borderColor: 'rgba(0,201,167,0.3)',
    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 2,
  },
  tab:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  label:      { color: '#444', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  labelActive:{ color: Colors.teal },
});

// ─── Ultimate Growth card ─────────────────────────────────────────────────────

function UGCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={ug.card} onPress={onPress} activeOpacity={0.85}>
      <View style={ug.bar} />
      <Text style={ug.crown}>👑</Text>
      <Text style={ug.name}>Ultimate{'\n'}Growth</Text>
      <Text style={ug.sub}>5-day · Multi-muscle</Text>
      <View style={ug.pill}><Text style={ug.pillText}>Advanced</Text></View>
    </TouchableOpacity>
  );
}

const ug = StyleSheet.create({
  card: {
    width: 145, marginRight: 12,
    backgroundColor: '#1A1A1C', borderRadius: 20, overflow: 'hidden', paddingBottom: 14,
    borderWidth: 1, borderColor: 'rgba(240,176,64,0.35)',
    shadowColor: '#F0B040', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 6,
  },
  bar:   { height: 4, backgroundColor: '#F0B040', marginBottom: 14 },
  crown: { fontSize: 30, textAlign: 'center', marginBottom: 8 },
  name:  { color: '#F0B040', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', textAlign: 'center', marginBottom: 6, paddingHorizontal: 10 },
  sub:   { color: '#666', fontSize: 10, textAlign: 'center', marginBottom: 10 },
  pill:  { backgroundColor: 'rgba(240,176,64,0.12)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'center', borderWidth: 0.5, borderColor: 'rgba(240,176,64,0.3)' },
  pillText:{ color: '#F0B040', fontSize: 9, fontFamily: 'Inter_500Medium' },
});

// ─── Not-trained card ─────────────────────────────────────────────────────────

function NtCard({ exercise, onPress }: { exercise: Exercise; onPress: () => void }) {
  const TYPE_COLOR: Record<string, string> = {
    push: Colors.teal, pull: '#5A78FF', legs: '#F0B040', core: '#FF7A85',
    upper: '#6FA8FF', full: '#3FCC93',
  };
  const color = TYPE_COLOR[exercise.type] ?? Colors.teal;

  return (
    <TouchableOpacity style={[nt.card, { borderColor: `${color}30` }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[nt.typeBar, { backgroundColor: color }]} />
      <View style={nt.body}>
        <Text style={nt.name} numberOfLines={1}>{exercise.name}</Text>
        <Text style={nt.muscle} numberOfLines={1}>
          {exercise.musclesPrimary.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' · ')}
        </Text>
        <Text style={[nt.sets, { color }]}>{exercise.defaultSets}×{exercise.defaultReps}</Text>
      </View>
    </TouchableOpacity>
  );
}

const nt = StyleSheet.create({
  card: {
    width: 140, backgroundColor: '#1C1C1E',
    borderRadius: 14, borderWidth: 0.5,
    marginRight: 10, overflow: 'hidden',
  },
  typeBar: { height: 3, width: '100%' },
  body:    { padding: 11, gap: 4 },
  name:    { color: '#FFFFFF', fontSize: FontSize.bodySm, fontFamily: 'Inter_500Medium' },
  muscle:  { color: '#555', fontSize: 9 },
  sets:    { fontSize: 9, fontFamily: 'Inter_500Medium', marginTop: 2 },
});

// ─── Type filter chips ────────────────────────────────────────────────────────

const TYPE_CHIPS: { label: string; value: TypeFilter; emoji: string }[] = [
  { label: 'All',   value: 'all',  emoji: '⚡' },
  { label: 'Push',  value: 'push', emoji: '💪' },
  { label: 'Pull',  value: 'pull', emoji: '🔗' },
  { label: 'Legs',  value: 'legs', emoji: '🦵' },
  { label: 'Core',  value: 'core', emoji: '🔥' },
];

// ─── Exercise row ─────────────────────────────────────────────────────────────

function ExerciseRow({
  exercise, onPress, isSuperset, onToggleSuperset,
}: {
  exercise: Exercise; onPress: () => void;
  isSuperset: boolean; onToggleSuperset: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Card style={[er.card, isSuperset && er.cardSS]}>
        <View style={er.inner}>
          <View style={{ flex: 1 }}>
            <Text style={er.name}>{exercise.name}</Text>
            <Text style={er.muscles} numberOfLines={1}>
              {[...exercise.musclesPrimary, ...exercise.musclesSecondary]
                .map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' · ')}
            </Text>
          </View>
          <Text style={er.sets}>{exercise.defaultSets}×{exercise.defaultReps}</Text>
          <TouchableOpacity
            style={[er.ssBtn, isSuperset && er.ssBtnActive]}
            onPress={onToggleSuperset}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="link" size={12} color={isSuperset ? Colors.teal : '#333'} />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={13} color="#2A2A2E" />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const er = StyleSheet.create({
  card:   { marginBottom: 8 },
  cardSS: { borderColor: 'rgba(0,201,167,0.35)', backgroundColor: 'rgba(0,201,167,0.04)' },
  inner:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name:   { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  muscles:{ color: '#555', fontSize: 10 },
  sets:   { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  ssBtn:  { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1A1A1C', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#222' },
  ssBtnActive: { backgroundColor: 'rgba(0,201,167,0.12)', borderColor: 'rgba(0,201,167,0.4)' },
});

// ─── Floating superset button ─────────────────────────────────────────────────

function SupersetFAB({ count, onPress, onClear }: { count: number; onPress: () => void; onClear: () => void }) {
  if (count === 0) return null;
  return (
    <View style={fab.wrap}>
      <TouchableOpacity style={fab.clearBtn} onPress={onClear} activeOpacity={0.8}>
        <Ionicons name="close" size={14} color="#888" />
      </TouchableOpacity>
      <TouchableOpacity style={[fab.btn, {
        shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6, shadowRadius: 14, elevation: 8,
      }]} onPress={onPress} activeOpacity={0.85}>
        <Ionicons name="flash" size={16} color={Colors.background} />
        <Text style={fab.text}>{count} superset{count > 1 ? 's' : ''}</Text>
        <Text style={fab.arrow}>Start →</Text>
      </TouchableOpacity>
    </View>
  );
}

const fab = StyleSheet.create({
  wrap:     { position: 'absolute', bottom: 16, left: Spacing.screenPadding, right: Spacing.screenPadding, flexDirection: 'row', gap: 8, alignItems: 'center' },
  clearBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#333' },
  btn:      { flex: 1, backgroundColor: Colors.teal, borderRadius: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  text:     { color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  arrow:    { color: 'rgba(0,0,0,0.5)', fontSize: FontSize.caption },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function WorkoutScreen() {
  const user      = useUserStore(s => s.user);
  const userLevel: Level = (user?.level as Level) ?? 'intermediate';
  const recentIds = useRecentExercises(user?.id);

  const [activeTab,     setActiveTab]     = useState<Tab>('start');
  const [typeFilter,    setTypeFilter]    = useState<TypeFilter>('all');
  const [muscleFilter,  setMuscleFilter]  = useState<MuscleFilter>('all');
  const [search,        setSearch]        = useState('');
  const [mapExpanded,   setMapExpanded]   = useState(false);
  const [supersets,     setSupersets]     = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelected]  = useState<WorkoutTemplate | null>(null);
  const [sheetOpen,     setSheetOpen]     = useState(false);
  const [selectedEx,    setSelectedEx]    = useState<Exercise | null>(null);
  const [detailOpen,    setDetailOpen]    = useState(false);
  const [ugOpen,        setUgOpen]        = useState(false);

  const notTrained = EXERCISES.filter(e => !recentIds.has(e.id)).slice(0, 8);

  const filtered = EXERCISES.filter(ex => {
    const matchType = typeFilter === 'all' || ex.type === typeFilter;
    const matchMuscle = muscleFilter === 'all'
      || MUSCLE_TO_GROUP[muscleFilter].some(m =>
          [...ex.musclesPrimary, ...ex.musclesSecondary].includes(m as any))
      || (muscleFilter === 'chest'     && ex.musclesPrimary.includes('chest'))
      || (muscleFilter === 'back'      && ex.musclesPrimary.includes('back'))
      || (muscleFilter === 'shoulders' && ex.musclesPrimary.includes('shoulders'))
      || (muscleFilter === 'arms'      && (ex.musclesPrimary.includes('biceps') || ex.musclesPrimary.includes('triceps')))
      || (muscleFilter === 'legs'      && ex.type === 'legs')
      || (muscleFilter === 'core'      && ex.type === 'core');
    const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchMuscle && matchSearch;
  });

  function toggleSuperset(id: string) {
    setSupersets(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function startSupersets() {
    const ids = Array.from(supersets);
    if (!ids.length) return;
    router.push(`/workout/superset-${Date.now()}?variation=superset&ids=${ids.join(',')}`);
  }

  function openSheet(t: WorkoutTemplate) { setSelected(t); setSheetOpen(true); }
  function startVariation(vId: string, exIds: string[]) {
    router.push(`/workout/${vId}-${Date.now()}?variation=${vId}&ids=${exIds.join(',')}`);
  }

  // Switching to Library clears muscle map by default
  function handleTabSwitch(t: Tab) {
    setActiveTab(t);
    if (t === 'library') setMapExpanded(false);
  }

  return (
    <SafeAreaView style={s.root}>

      {/* ── Fixed header ── */}
      <View style={s.header}>
        <Text style={s.heading}>Train 🏋️</Text>
        <TabSwitcher active={activeTab} onChange={handleTabSwitch} />
      </View>

      {/* ── START tab ── */}
      {activeTab === 'start' && (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick start */}
          <Text style={s.section}>Quick Start</Text>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={s.hScroll} contentContainerStyle={s.hScrollContent}
          >
            <UGCard onPress={() => setUgOpen(true)} />
            {TEMPLATES.map(tmpl => (
              <WorkoutTemplateCard key={tmpl.key} template={tmpl} onPress={() => openSheet(tmpl)} />
            ))}
          </ScrollView>

          {/* Not trained recently */}
          {notTrained.length > 0 && user?.id && (
            <>
              <Text style={s.section}>You haven't trained these lately</Text>
              <Text style={s.sectionSub}>Tap any to see technique, muscles, and your personal best.</Text>
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                style={s.hScroll} contentContainerStyle={s.hScrollContent}
              >
                {notTrained.map(ex => (
                  <NtCard
                    key={ex.id}
                    exercise={ex}
                    onPress={() => { setSelectedEx(ex); setDetailOpen(true); }}
                  />
                ))}
              </ScrollView>
            </>
          )}

          {/* CTA to library */}
          <TouchableOpacity style={s.libraryLink} onPress={() => setActiveTab('library')} activeOpacity={0.8}>
            <Ionicons name="barbell-outline" size={16} color={Colors.teal} />
            <Text style={s.libraryLinkText}>Browse all exercises →</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── LIBRARY tab ── */}
      {activeTab === 'library' && (
        <View style={s.libraryContainer}>

          {/* Search — sticky at top */}
          <View style={s.searchWrap}>
            <Ionicons name="search-outline" size={16} color="#555" />
            <TextInput
              style={s.searchInput}
              placeholder="Search 27 exercises..."
              placeholderTextColor="#444"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#555" />
              </TouchableOpacity>
            )}
          </View>

          {/* Type filter chips */}
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={s.chipScroll} contentContainerStyle={s.chipContent}
          >
            {TYPE_CHIPS.map(c => {
              const count = c.value === 'all'
                ? EXERCISES.length
                : EXERCISES.filter(e => e.type === c.value).length;
              const active = typeFilter === c.value;
              return (
                <TouchableOpacity
                  key={c.value}
                  style={[s.chip, active && s.chipActive, active && {
                    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.35, shadowRadius: 6, elevation: 2,
                  }]}
                  onPress={() => setTypeFilter(c.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.chipText, active && s.chipTextActive]}>
                    {c.emoji} {c.label}
                  </Text>
                  <Text style={[s.chipCount, active && s.chipCountActive]}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Muscle map toggle */}
          <TouchableOpacity
            style={[s.mapToggle, mapExpanded && s.mapToggleActive]}
            onPress={() => setMapExpanded(v => !v)}
            activeOpacity={0.8}
          >
            <Ionicons name="body-outline" size={14} color={mapExpanded ? Colors.teal : '#555'} />
            <Text style={[s.mapToggleText, mapExpanded && s.mapToggleTextActive]}>
              Filter by muscle group
            </Text>
            {muscleFilter !== 'all' && (
              <View style={s.mapActiveDot} />
            )}
            <Ionicons
              name={mapExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={mapExpanded ? Colors.teal : '#444'}
            />
          </TouchableOpacity>

          {mapExpanded && (
            <View style={s.mapWrap}>
              <MuscleMap selected={muscleFilter} onChange={f => {
                setMuscleFilter(f);
                if (f !== 'all') setTypeFilter('all'); // clear type filter when muscle selected
              }} />
            </View>
          )}

          {/* Results count + superset hint */}
          <View style={s.resultsRow}>
            <Text style={s.resultsText}>
              {filtered.length} exercise{filtered.length !== 1 ? 's' : ''}
              {search ? ` matching "${search}"` : ''}
            </Text>
            {supersets.size === 0 && (
              <Text style={s.ssHint}>Tap 🔗 to superset</Text>
            )}
          </View>

          {/* Exercise list */}
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ExerciseRow
                exercise={item}
                isSuperset={supersets.has(item.id)}
                onToggleSuperset={() => toggleSuperset(item.id)}
                onPress={() => { setSelectedEx(item); setDetailOpen(true); }}
              />
            )}
            contentContainerStyle={[s.listContent, supersets.size > 0 && { paddingBottom: 88 }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={s.emptyText}>No exercises match your filter.</Text>
            }
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* ── Floating superset button ── */}
      <SupersetFAB
        count={supersets.size}
        onPress={startSupersets}
        onClear={() => setSupersets(new Set())}
      />

      {/* ── Sheets ── */}
      <VariationSheet
        template={selectedTemplate}
        userLevel={userLevel}
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onStart={startVariation}
      />
      <ExerciseDetailSheet
        exercise={selectedEx}
        visible={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
      <UltimateGrowthSheet visible={ugOpen} onClose={() => setUgOpen(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 16,
    paddingBottom: 4,
    backgroundColor: Colors.background,
  },
  heading:{ color: '#FFFFFF', fontSize: FontSize.h1, fontFamily: 'Inter_500Medium', marginBottom: 16 },

  // Start tab
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 32 },
  section:       { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 6 },
  sectionSub:    { color: '#555', fontSize: FontSize.caption, marginBottom: 12, fontStyle: 'italic' },

  hScroll:        { marginHorizontal: -Spacing.screenPadding, marginBottom: 24 },
  hScrollContent: { paddingHorizontal: Spacing.screenPadding },

  libraryLink: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,201,167,0.07)',
    borderRadius: 12, borderWidth: 0.5,
    borderColor: 'rgba(0,201,167,0.2)',
    padding: 14, marginTop: 4,
  },
  libraryLinkText: { color: Colors.teal, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },

  // Library tab
  libraryContainer: { flex: 1, paddingHorizontal: Spacing.screenPadding },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1A1A1C', borderRadius: 12,
    borderWidth: 0.5, borderColor: '#252528',
    paddingHorizontal: 12, paddingVertical: 11,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: FontSize.body, padding: 0 },

  chipScroll:  { marginHorizontal: -Spacing.screenPadding, marginBottom: 10 },
  chipContent: { paddingHorizontal: Spacing.screenPadding, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 0.5,
    borderColor: '#252528', backgroundColor: '#1A1A1C',
  },
  chipActive:      { backgroundColor: 'rgba(0,201,167,0.1)', borderColor: 'rgba(0,201,167,0.4)' },
  chipText:        { color: '#555', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  chipTextActive:  { color: Colors.teal },
  chipCount:       { color: '#333', fontSize: 10, backgroundColor: '#252528', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 },
  chipCountActive: { color: Colors.teal, backgroundColor: 'rgba(0,201,167,0.15)' },

  mapToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#141416', borderRadius: 10,
    borderWidth: 0.5, borderColor: '#222',
    paddingHorizontal: 12, paddingVertical: 9,
    marginBottom: 4,
  },
  mapToggleActive:    { borderColor: 'rgba(0,201,167,0.3)', backgroundColor: 'rgba(0,201,167,0.05)' },
  mapToggleText:      { flex: 1, color: '#555', fontSize: FontSize.bodySm, fontFamily: 'Inter_500Medium' },
  mapToggleTextActive:{ color: Colors.teal },
  mapActiveDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.teal },
  mapWrap:            { marginBottom: 8 },

  resultsRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 },
  resultsText: { color: '#444', fontSize: FontSize.caption },
  ssHint:      { color: '#2A2A2E', fontSize: FontSize.caption, fontStyle: 'italic' },

  listContent: { paddingBottom: 32 },
  emptyText:   { color: '#444', fontSize: FontSize.body, textAlign: 'center', marginTop: 32, fontStyle: 'italic' },
});
