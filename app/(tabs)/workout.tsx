import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, FlatList,
  SafeAreaView, LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  interpolate, Extrapolation,
} from 'react-native-reanimated';
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

// ─── Spacing tokens ───────────────────────────────────────────────────────────
// All spacing multiples of 4 — eliminates the 4/5/6/8/10/11/12/14 inconsistency
const S = {
  xs:   4,
  sm:   8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
};

type Tab       = 'start' | 'library';
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

// ─── Tab switcher (Reanimated — 60fps on UI thread) ──────────────────────────

function TabSwitcher({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const position      = useSharedValue(active === 'start' ? 0 : 1);
  const [tabW, setTabW] = useState(0);

  function onLayout(e: LayoutChangeEvent) {
    // Each tab takes half the inner width (minus wrap padding 4px each side)
    setTabW((e.nativeEvent.layout.width - S.xs * 2) / 2);
  }

  function switchTo(t: Tab) {
    onChange(t);
    position.value = withSpring(t === 'start' ? 0 : 1, {
      damping:   22,
      stiffness: 260,
      mass:      0.8,
    });
  }

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{
      translateX: interpolate(position.value, [0, 1], [0, tabW], Extrapolation.CLAMP),
    }],
    width: tabW,
  }));

  return (
    <View style={ts.wrap} onLayout={onLayout}>
      {/* Sliding indicator — runs on UI thread */}
      <Animated.View style={[ts.indicator, indicatorStyle]} />

      {(['start', 'library'] as Tab[]).map(t => {
        const isActive = active === t;
        return (
          <TouchableOpacity
            key={t}
            style={ts.tab}
            onPress={() => switchTo(t)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={t === 'start'
                ? (isActive ? 'flash' : 'flash-outline')
                : (isActive ? 'barbell' : 'barbell-outline')}
              size={15}
              color={isActive ? Colors.teal : '#444'}
            />
            <Text style={[ts.label, isActive && ts.labelActive]}>
              {t === 'start' ? 'Start' : 'Library'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const ts = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: '#111113',
    borderRadius: Radius.md,
    borderWidth: 0.5, borderColor: '#1E1E20',
    padding: S.xs,
    marginBottom: S.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: S.xs, bottom: S.xs, left: S.xs,
    backgroundColor: 'rgba(0,201,167,0.10)',
    borderRadius: Radius.sm,
    borderWidth: 0.5, borderColor: 'rgba(0,201,167,0.28)',
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28, shadowRadius: S.sm,
    elevation: 2,
  },
  tab:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.xs + 2, paddingVertical: S.md - 2 },
  label:      { color: '#444', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  labelActive:{ color: Colors.teal },
});

// ─── UG card ──────────────────────────────────────────────────────────────────

function UGCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={ug.card} onPress={onPress} activeOpacity={0.85}>
      <View style={ug.bar} />
      <View style={ug.body}>
        <Text style={ug.crown}>👑</Text>
        <Text style={ug.name}>Ultimate{'\n'}Growth</Text>
        <Text style={ug.sub}>5 days · Multi-muscle</Text>
        <View style={ug.pill}><Text style={ug.pillText}>Advanced</Text></View>
      </View>
    </TouchableOpacity>
  );
}

const UG_W = 148;
const ug = StyleSheet.create({
  card: {
    width: UG_W, marginRight: S.md,
    backgroundColor: '#1A1A1C', borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(240,176,64,0.35)',
    shadowColor: '#F0B040', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 5,
  },
  bar:   { height: 3, backgroundColor: '#F0B040' },
  body:  { padding: S.md, alignItems: 'center', gap: S.sm - 2 },
  crown: { fontSize: 28, marginTop: S.xs },
  name:  { color: '#F0B040', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  sub:   { color: '#666', fontSize: 10, textAlign: 'center' },
  pill:  { backgroundColor: 'rgba(240,176,64,0.12)', borderRadius: Radius.full, paddingHorizontal: S.md - 2, paddingVertical: 3, borderWidth: 0.5, borderColor: 'rgba(240,176,64,0.3)' },
  pillText: { color: '#F0B040', fontSize: 9, fontFamily: 'Inter_500Medium' },
});

// ─── Not-trained card ─────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  push: Colors.teal, pull: '#5A78FF',
  legs: '#F0B040',  core: '#FF7A85',
  upper: '#6FA8FF', full: '#3FCC93',
};

function NtCard({ exercise, onPress }: { exercise: Exercise; onPress: () => void }) {
  const color = TYPE_COLOR[exercise.type] ?? Colors.teal;
  return (
    <TouchableOpacity style={[nt.card, { borderColor: `${color}28` }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[nt.bar, { backgroundColor: color }]} />
      <View style={nt.body}>
        <Text style={nt.name} numberOfLines={2}>{exercise.name}</Text>
        <Text style={nt.muscle} numberOfLines={1}>
          {exercise.musclesPrimary.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' · ')}
        </Text>
        <Text style={[nt.sets, { color }]}>{exercise.defaultSets} × {exercise.defaultReps}</Text>
      </View>
    </TouchableOpacity>
  );
}

const NT_W = 136;
const nt = StyleSheet.create({
  card: {
    width: NT_W, backgroundColor: '#1C1C1E',
    borderRadius: 14, borderWidth: 0.5, marginRight: S.md, overflow: 'hidden',
  },
  bar:    { height: 3 },
  body:   { padding: S.md, gap: S.xs },
  name:   { color: '#FFFFFF', fontSize: FontSize.bodySm, fontFamily: 'Inter_500Medium', lineHeight: 18 },
  muscle: { color: '#555', fontSize: 10, textTransform: 'capitalize' },
  sets:   { fontSize: 10, fontFamily: 'Inter_500Medium' },
});

// ─── Type chips ───────────────────────────────────────────────────────────────

const TYPE_CHIPS: { label: string; value: TypeFilter; emoji: string }[] = [
  { label: 'All',  value: 'all',  emoji: '⚡' },
  { label: 'Push', value: 'push', emoji: '💪' },
  { label: 'Pull', value: 'pull', emoji: '🔗' },
  { label: 'Legs', value: 'legs', emoji: '🦵' },
  { label: 'Core', value: 'core', emoji: '🔥' },
];

// ─── Exercise row ─────────────────────────────────────────────────────────────

function ExerciseRow({
  exercise, onPress, isSuperset, onToggleSuperset,
}: {
  exercise: Exercise; onPress: () => void;
  isSuperset: boolean; onToggleSuperset: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.72}>
      <Card style={[er.card, isSuperset && er.cardSS]}>
        <View style={er.row}>
          {/* Left: name + muscles */}
          <View style={er.left}>
            <Text style={er.name} numberOfLines={1}>{exercise.name}</Text>
            <Text style={er.muscles} numberOfLines={1}>
              {[...exercise.musclesPrimary, ...exercise.musclesSecondary]
                .map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' · ')}
            </Text>
          </View>

          {/* Right: sets · SS icon · chevron */}
          <View style={er.right}>
            <Text style={er.sets}>{exercise.defaultSets}×{exercise.defaultReps}</Text>
            <TouchableOpacity
              style={[er.ssBtn, isSuperset && er.ssBtnActive]}
              onPress={onToggleSuperset}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="link-outline" size={13} color={isSuperset ? Colors.teal : '#333'} />
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={13} color="#252528" />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const er = StyleSheet.create({
  card:    { marginBottom: S.sm },
  cardSS:  { borderColor: 'rgba(0,201,167,0.32)', backgroundColor: 'rgba(0,201,167,0.04)' },
  row:     { flexDirection: 'row', alignItems: 'center', gap: S.md },
  left:    { flex: 1 },
  name:    { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 3 },
  muscles: { color: '#555', fontSize: 10, lineHeight: 14 },
  right:   { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  sets:    { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', minWidth: 32, textAlign: 'right' },
  ssBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#141416', alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: '#1E1E20',
  },
  ssBtnActive: { backgroundColor: 'rgba(0,201,167,0.10)', borderColor: 'rgba(0,201,167,0.35)' },
});

// ─── Floating superset button ─────────────────────────────────────────────────

function SupersetFAB({ count, onPress, onClear }: { count: number; onPress: () => void; onClear: () => void }) {
  if (count === 0) return null;
  return (
    <View style={fab.wrap} pointerEvents="box-none">
      <TouchableOpacity style={fab.clearBtn} onPress={onClear} activeOpacity={0.8}>
        <Ionicons name="close" size={14} color="#777" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[fab.btn, {
          shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.55, shadowRadius: 14, elevation: 8,
        }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Ionicons name="flash" size={15} color={Colors.background} />
        <Text style={fab.label}>{count} superset{count > 1 ? 's' : ''}</Text>
        <View style={fab.divider} />
        <Text style={fab.start}>Start →</Text>
      </TouchableOpacity>
    </View>
  );
}

const fab = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: S.lg, left: Spacing.screenPadding, right: Spacing.screenPadding,
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
  },
  clearBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: '#2A2A2E',
  },
  btn: {
    flex: 1, backgroundColor: Colors.teal, borderRadius: S.md,
    paddingVertical: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: S.sm,
  },
  label:   { color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  divider: { width: 1, height: 14, backgroundColor: 'rgba(0,0,0,0.2)' },
  start:   { color: 'rgba(0,0,0,0.45)', fontSize: FontSize.caption },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function WorkoutScreen() {
  const user      = useUserStore(s => s.user);
  const userLevel: Level = (user?.level as Level) ?? 'intermediate';
  const recentIds = useRecentExercises(user?.id);

  const [activeTab,      setActiveTab]      = useState<Tab>('start');
  const [typeFilter,     setTypeFilter]     = useState<TypeFilter>('all');
  const [muscleFilter,   setMuscleFilter]   = useState<MuscleFilter>('all');
  const [search,         setSearch]         = useState('');
  const [mapExpanded,    setMapExpanded]    = useState(false);
  const [supersets,      setSupersets]      = useState<Set<string>>(new Set());
  const [selectedTmpl,   setSelectedTmpl]   = useState<WorkoutTemplate | null>(null);
  const [sheetOpen,      setSheetOpen]      = useState(false);
  const [selectedEx,     setSelectedEx]     = useState<Exercise | null>(null);
  const [detailOpen,     setDetailOpen]     = useState(false);
  const [ugOpen,         setUgOpen]         = useState(false);

  const notTrained = EXERCISES.filter(e => !recentIds.has(e.id)).slice(0, 8);

  const filtered = EXERCISES.filter(ex => {
    const matchType   = typeFilter === 'all' || ex.type === typeFilter;
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
    if (!supersets.size) return;
    const ids = Array.from(supersets).join(',');
    router.push(`/workout/superset-${Date.now()}?variation=superset&ids=${ids}`);
  }

  function openSheet(t: WorkoutTemplate) { setSelectedTmpl(t); setSheetOpen(true); }
  function startVariation(vId: string, exIds: string[]) {
    router.push(`/workout/${vId}-${Date.now()}?variation=${vId}&ids=${exIds.join(',')}`);
  }

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

      {/* ════ START TAB ════ */}
      {activeTab === 'start' && (
        <ScrollView
          contentContainerStyle={s.startContent}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {/* Quick start */}
          <Text style={s.section}>Quick Start</Text>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={s.hScroll}
            contentContainerStyle={s.hScrollContent}
          >
            <UGCard onPress={() => setUgOpen(true)} />
            {TEMPLATES.map(t => (
              <WorkoutTemplateCard key={t.key} template={t} onPress={() => openSheet(t)} />
            ))}
          </ScrollView>

          {/* Not trained recently */}
          {notTrained.length > 0 && user?.id && (
            <>
              <Text style={s.section}>You haven't trained these lately</Text>
              <Text style={s.caption}>Tap any to see technique and your personal best.</Text>
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                style={s.hScroll}
                contentContainerStyle={s.hScrollContent}
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

          {/* Library link */}
          <TouchableOpacity
            style={s.libraryLink}
            onPress={() => handleTabSwitch('library')}
            activeOpacity={0.8}
          >
            <Ionicons name="barbell-outline" size={16} color={Colors.teal} />
            <Text style={s.libraryLinkText}>Browse all {EXERCISES.length} exercises</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.teal} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ════ LIBRARY TAB ════ */}
      {activeTab === 'library' && (
        <View style={s.libraryWrap}>

          {/* Search */}
          <View style={s.searchWrap}>
            <Ionicons name="search-outline" size={16} color="#555" />
            <TextInput
              style={s.searchInput}
              placeholder={`Search ${EXERCISES.length} exercises…`}
              placeholderTextColor="#3A3A3E"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color="#555" />
              </TouchableOpacity>
            )}
          </View>

          {/* Type chips */}
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={s.chipScroll}
            contentContainerStyle={s.chipContent}
          >
            {TYPE_CHIPS.map(c => {
              const count  = c.value === 'all' ? EXERCISES.length : EXERCISES.filter(e => e.type === c.value).length;
              const active = typeFilter === c.value;
              return (
                <TouchableOpacity
                  key={c.value}
                  style={[s.chip, active && s.chipActive]}
                  onPress={() => setTypeFilter(c.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.chipEmoji]}>{c.emoji}</Text>
                  <Text style={[s.chipLabel, active && s.chipLabelActive]}>{c.label}</Text>
                  <View style={[s.chipCount, active && s.chipCountActive]}>
                    <Text style={[s.chipCountText, active && s.chipCountTextActive]}>{count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Muscle map toggle */}
          <TouchableOpacity
            style={[s.mapToggle, mapExpanded && s.mapToggleOpen]}
            onPress={() => setMapExpanded(v => !v)}
            activeOpacity={0.8}
          >
            <Ionicons name="body-outline" size={14} color={mapExpanded ? Colors.teal : '#555'} />
            <Text style={[s.mapToggleLabel, mapExpanded && s.mapToggleLabelOpen]}>
              Filter by muscle group
            </Text>
            {muscleFilter !== 'all' && <View style={s.activeIndicator} />}
            <Ionicons
              name={mapExpanded ? 'chevron-up' : 'chevron-down'}
              size={13}
              color={mapExpanded ? Colors.teal : '#333'}
            />
          </TouchableOpacity>

          {mapExpanded && (
            <View style={s.mapContainer}>
              <MuscleMap
                selected={muscleFilter}
                onChange={f => {
                  setMuscleFilter(f);
                  if (f !== 'all') setTypeFilter('all');
                }}
              />
            </View>
          )}

          {/* Results meta */}
          <View style={s.metaRow}>
            <Text style={s.metaCount}>
              {filtered.length} exercise{filtered.length !== 1 ? 's' : ''}
              {search ? ` for "${search}"` : ''}
            </Text>
            {supersets.size === 0 && (
              <Text style={s.metaHint}>Tap 🔗 to superset</Text>
            )}
          </View>

          {/* List */}
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
            contentContainerStyle={[
              s.listContent,
              supersets.size > 0 && { paddingBottom: 96 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
              <Text style={s.empty}>No exercises match your filters.</Text>
            }
          />
        </View>
      )}

      {/* Floating FAB */}
      <SupersetFAB
        count={supersets.size}
        onPress={startSupersets}
        onClear={() => setSupersets(new Set())}
      />

      {/* Sheets */}
      <VariationSheet
        template={selectedTmpl}
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
    paddingTop: S.lg,
    backgroundColor: Colors.background,
  },
  heading: {
    color: '#FFFFFF', fontSize: FontSize.h1,
    fontFamily: 'Inter_500Medium', marginBottom: S.lg,
  },

  // ── Start tab ──
  startContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: S.xxl + S.lg,
  },
  section: {
    color: '#FFFFFF', fontSize: FontSize.bodyLg,
    fontFamily: 'Inter_500Medium', marginBottom: S.sm,
  },
  caption: {
    color: '#555', fontSize: FontSize.caption,
    marginBottom: S.md, fontStyle: 'italic',
  },
  hScroll:        { marginHorizontal: -Spacing.screenPadding, marginBottom: S.xxl },
  hScrollContent: { paddingHorizontal: Spacing.screenPadding },

  libraryLink: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    backgroundColor: 'rgba(0,201,167,0.06)',
    borderRadius: S.md, borderWidth: 0.5,
    borderColor: 'rgba(0,201,167,0.18)',
    paddingHorizontal: S.lg, paddingVertical: S.md + 2,
  },
  libraryLinkText: {
    color: Colors.teal, fontSize: FontSize.body,
    fontFamily: 'Inter_500Medium', flex: 1,
  },

  // ── Library tab ──
  libraryWrap: {
    flex: 1, paddingHorizontal: Spacing.screenPadding,
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    backgroundColor: '#141416',
    borderRadius: S.md, borderWidth: 0.5, borderColor: '#1E1E20',
    paddingHorizontal: S.md, paddingVertical: S.md - 1,
    marginBottom: S.md,
  },
  searchInput: {
    flex: 1, color: '#FFFFFF',
    fontSize: FontSize.body, padding: 0,
  },

  chipScroll:  { marginHorizontal: -Spacing.screenPadding, marginBottom: S.md },
  chipContent: { paddingHorizontal: Spacing.screenPadding },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: S.xs + 2,
    paddingHorizontal: S.md - 2, paddingVertical: S.sm - 1,
    borderRadius: Radius.full, borderWidth: 0.5,
    borderColor: '#1E1E20', backgroundColor: '#111113',
    marginRight: S.sm,
  },
  chipActive: {
    backgroundColor: 'rgba(0,201,167,0.08)',
    borderColor: 'rgba(0,201,167,0.35)',
  },
  chipEmoji:     { fontSize: 13 },
  chipLabel:     { color: '#444', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  chipLabelActive:{ color: Colors.teal },
  chipCount:     { backgroundColor: '#1E1E20', borderRadius: S.xs, paddingHorizontal: S.xs + 1, paddingVertical: 1 },
  chipCountActive:{ backgroundColor: 'rgba(0,201,167,0.15)' },
  chipCountText: { color: '#3A3A3E', fontSize: 9, fontFamily: 'Inter_500Medium' },
  chipCountTextActive: { color: Colors.teal },

  mapToggle: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    backgroundColor: '#111113',
    borderRadius: S.sm + 2, borderWidth: 0.5, borderColor: '#1A1A1A',
    paddingHorizontal: S.md, paddingVertical: S.sm + 1,
    marginBottom: S.xs,
  },
  mapToggleOpen:      { borderColor: 'rgba(0,201,167,0.25)', backgroundColor: 'rgba(0,201,167,0.04)' },
  mapToggleLabel:     { flex: 1, color: '#555', fontSize: FontSize.bodySm, fontFamily: 'Inter_500Medium' },
  mapToggleLabelOpen: { color: Colors.teal },
  activeIndicator:    { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.teal },
  mapContainer:       { marginBottom: S.sm },

  metaRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: S.sm, marginBottom: S.xs },
  metaCount:  { color: '#3A3A3E', fontSize: FontSize.caption },
  metaHint:   { color: '#252528', fontSize: FontSize.caption, fontStyle: 'italic' },

  listContent: { paddingBottom: S.xxl },
  empty:       { color: '#333', fontSize: FontSize.body, textAlign: 'center', marginTop: S.xxl + S.sm, fontStyle: 'italic' },
});
