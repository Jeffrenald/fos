import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { i18n } from '@/lib/i18n';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { VariationSheet } from '@/components/workout/VariationSheet';
import { WorkoutTemplateCard } from '@/components/workout/WorkoutTemplateCard';
import { FrequencySheet } from '@/components/plan/FrequencySheet';
import { DayPreviewSheet } from '@/components/plan/DayPreviewSheet';
import { HAITIAN_PROVERBS } from '@/constants/haitian-foods-db';
import { TEMPLATES, WorkoutTemplate } from '@/constants/exercises';
import { DAY_LABELS, todayDayIndex } from '@/lib/planGenerator';
import { usePlanStore } from '@/stores/planStore';
import type { Level } from '@/constants/exercises';
import type { PlannedDay } from '@/lib/planGenerator';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const greet = hour < 12 ? i18n.t('home.greetingMorning') : i18n.t('home.greetingEvening');
  return `${greet}, ${name} 👋`;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function thisWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Stats hook ───────────────────────────────────────────────────────────────

interface HomeStats {
  sessionsThisWeek: number;
  totalVolume:      number;
  streak:           number;
}

function useHomeStats(userId: string | undefined) {
  const [stats, setStats]         = useState<HomeStats>({ sessionsThisWeek: 0, totalVolume: 0, streak: 0 });
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('started_at, total_volume_kg, completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('started_at', { ascending: false });

      if (!sessions) return;

      const weekStart = thisWeekStart();
      const sessionsWeek = sessions.filter(s => s.started_at >= weekStart).length;
      const volume = sessions
        .filter(s => s.started_at >= weekStart)
        .reduce((sum, s) => sum + (s.total_volume_kg ?? 0), 0);

      // Streak: count consecutive days with sessions
      let streak = 0;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const sessionDays = new Set(sessions.map(s => s.started_at.split('T')[0]));
      for (let i = 0; i < 365; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        if (sessionDays.has(d.toISOString().split('T')[0])) streak++;
        else if (i > 0) break;
      }

      setStats({ sessionsThisWeek: sessionsWeek, totalVolume: Math.round(volume), streak });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const refresh = useCallback(() => { setRefreshing(true); fetch(); }, [fetch]);

  return { stats, loading, refreshing, refresh };
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const user = useUserStore(s => s.user);
  const { stats, refreshing, refresh } = useHomeStats(user?.id);
  const userLevel: Level = (user?.level as Level) ?? 'intermediate';

  const plan         = usePlanStore(s => s.plan);
  const generatePlan = usePlanStore(s => s.generatePlan);

  const [selectedTemplate, setSelected]   = useState<WorkoutTemplate | null>(null);
  const [sheetOpen, setSheetOpen]         = useState(false);
  const [freqOpen, setFreqOpen]           = useState(false);
  const [selectedDay, setSelectedDay]     = useState<PlannedDay | null>(null);
  const [dayPreviewOpen, setDayPreview]   = useState(false);

  const proverb   = HAITIAN_PROVERBS[new Date().getDay() % HAITIAN_PROVERBS.length];
  const firstName = user?.name?.split(' ')[0] ?? 'Sak pase';
  const todayIdx  = todayDayIndex();

  function openSheet(template: WorkoutTemplate) {
    setSelected(template);
    setSheetOpen(true);
  }

  function startVariation(variationId: string, exerciseIds: string[]) {
    const sessionId = `${variationId}-${Date.now()}`;
    router.push(`/workout/${sessionId}?variation=${variationId}&ids=${exerciseIds.join(',')}`);
  }

  function openDayPreview(day: PlannedDay) {
    setSelectedDay(day);
    setDayPreview(true);
  }

  return (
    <>
    <ScreenWrapper
      scrollable
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.teal} />}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>{getGreeting(firstName)}</Text>
          <Text style={s.subGreeting}>
            {user?.goal === 'muscle'       ? 'Building strong, jodi a.'  :
             user?.goal === 'weight_loss'  ? 'Stay consistent, ti pa ti pa.' :
             user?.goal === 'toned'        ? 'Fòs ak estil — let\'s go.'  :
                                             'Every session counts.'}
          </Text>
        </View>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text>
        </View>
      </View>

      {/* ── Streak card ── */}
      <Card style={s.streakCard}>
        <View style={s.streakRow}>
          <Text style={s.streakFire}>🔥</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.streakCount}>
              {stats.streak}{' '}
              <Text style={s.streakLabel}>{i18n.t('home.streak')}</Text>
            </Text>
            <Text style={s.streakMotto}>"{proverb.ht}"</Text>
            <Text style={s.streakTranslation}>{proverb.en}</Text>
          </View>
          {stats.streak > 0 && <Tag label="🔥 Active" variant="teal" />}
        </View>
      </Card>

      {/* ── Stats 2×2 ── */}
      <View style={s.statsGrid}>
        <Card style={s.statCard}>
          <Text style={s.statValue}>{stats.sessionsThisWeek}</Text>
          <Text style={s.statLabel}>{i18n.t('home.sessionsWeek')}</Text>
        </Card>
        <Card style={s.statCard}>
          <Text style={s.statValue}>{stats.totalVolume > 0 ? `${stats.totalVolume}kg` : '—'}</Text>
          <Text style={s.statLabel}>{i18n.t('home.totalVolume')}</Text>
        </Card>
        <Card style={s.statCard}>
          <Text style={s.statValue}>—</Text>
          <Text style={s.statLabel}>{i18n.t('home.todayKcal')}</Text>
        </Card>
        <Card style={s.statCard}>
          <Text style={s.statValue}>—</Text>
          <Text style={s.statLabel}>{i18n.t('home.weightProgress')}</Text>
        </Card>
      </View>

      {/* ── Quick Start Workouts ── */}
      <Text style={s.sectionTitle}>Start a Workout</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.templateScroll}
        contentContainerStyle={s.templateScrollContent}
      >
        {TEMPLATES.map(tmpl => (
          <WorkoutTemplateCard
            key={tmpl.key}
            template={tmpl}
            onPress={() => openSheet(tmpl)}
          />
        ))}
      </ScrollView>

      {/* ── Week plan ── */}
      <View style={s.planHeader}>
        <Text style={s.sectionTitle}>{i18n.t('home.weekPlan')}</Text>
        <TouchableOpacity style={s.planEditBtn} onPress={() => setFreqOpen(true)} activeOpacity={0.7}>
          <Ionicons name={plan ? 'pencil-outline' : 'add'} size={14} color={Colors.teal} />
          <Text style={s.planEditText}>
            {plan ? `${plan.frequency}× / week` : 'Set up plan'}
          </Text>
        </TouchableOpacity>
      </View>

      {plan ? (
        plan.days.map(day => {
          const isToday = day.dayIndex === todayIdx;
          const isPast  = day.dayIndex < todayIdx;
          return (
            <TouchableOpacity key={day.dayIndex} onPress={() => openDayPreview(day)} activeOpacity={0.8}>
              <Card style={[
                s.dayRow,
                isToday && s.dayRowToday,
                isPast  && s.dayRowPast,
              ]}>
                {/* Day badge */}
                <View style={[s.dayBadge, isToday && s.dayBadgeToday, isPast && s.dayBadgePast]}>
                  <Text style={[s.dayBadgeText, isToday && s.dayBadgeTextToday, isPast && s.dayBadgeTextPast]}>
                    {DAY_LABELS[day.dayIndex]}
                  </Text>
                </View>

                {/* Workout or rest */}
                <View style={{ flex: 1 }}>
                  {day.isRest ? (
                    <Text style={[s.dayValue, isPast && s.dayValuePast]}>Rest</Text>
                  ) : (
                    <>
                      <Text style={[s.dayWorkoutName, isPast && s.dayValuePast]}>
                        {day.workout?.emoji} {day.workout?.name}
                      </Text>
                      <Text style={s.dayWorkoutMeta} numberOfLines={1}>
                        {day.workout?.exerciseIds.length} exercises · {day.workout?.estimatedMin}m
                      </Text>
                    </>
                  )}
                </View>

                {/* Status icon */}
                {isToday && !day.isRest && (
                  <View style={s.todayGo}>
                    <Text style={s.todayGoText}>Go</Text>
                  </View>
                )}
                {day.userOverride && (
                  <View style={s.overrideDot} />
                )}
                <Ionicons name="chevron-forward" size={14} color={isPast ? '#333' : '#444'} />
              </Card>
            </TouchableOpacity>
          );
        })
      ) : (
        <TouchableOpacity style={s.setupPrompt} onPress={() => setFreqOpen(true)} activeOpacity={0.8}>
          <View style={s.setupIcon}>
            <Ionicons name="calendar-outline" size={24} color={Colors.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.setupTitle}>Build your weekly plan</Text>
            <Text style={s.setupSub}>Choose 3–7 days · Balanced splits · Smart rest days</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.teal} />
        </TouchableOpacity>
      )}

    </ScreenWrapper>

      <VariationSheet
        template={selectedTemplate}
        userLevel={userLevel}
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onStart={startVariation}
      />

      <FrequencySheet
        visible={freqOpen}
        currentFreq={plan?.frequency ?? null}
        userLevel={userLevel}
        onClose={() => setFreqOpen(false)}
        onGenerate={(f) => generatePlan(f, userLevel)}
      />

      <DayPreviewSheet
        day={selectedDay}
        visible={dayPreviewOpen}
        isPast={!!selectedDay && selectedDay.dayIndex < todayIdx}
        onClose={() => setDayPreview(false)}
      />
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  greeting:     { color: Colors.textPrimary, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  subGreeting:  { color: Colors.textMuted,   fontSize: FontSize.caption, marginTop: 3, fontStyle: 'italic' },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.teal,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:   { color: Colors.background, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },

  streakCard: {
    marginBottom: Spacing.cardGap,
    // warm orange glow around streak card
    shadowColor: '#F0B040',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
    borderColor: 'rgba(240,176,64,0.25)',
  },
  streakRow:        { flexDirection: 'row', alignItems: 'center', gap: 14 },
  streakFire:       { fontSize: 32 },
  streakCount:      { color: '#FFFFFF', fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  streakLabel:      { color: '#888', fontSize: FontSize.body, fontFamily: 'Inter_400Regular' },
  streakMotto:      { color: '#CCCCCC', fontSize: FontSize.caption, marginTop: 4, fontStyle: 'italic' },
  streakTranslation:{ color: '#666', fontSize: FontSize.caption },

  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.cardGap, marginBottom: 20 },
  statCard:     { flex: 1, minWidth: '45%' },
  statValue:    { color: '#FFFFFF', fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  statLabel:    { color: '#777', fontSize: FontSize.caption, marginTop: 4 },

  sectionTitle: { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },

  templateScroll:        { marginHorizontal: -Spacing.screenPadding, marginBottom: 20 },
  templateScrollContent: { paddingHorizontal: Spacing.screenPadding },

  // Plan header
  planHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 8 },
  planEditBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,201,167,0.1)', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5, borderColor: 'rgba(0,201,167,0.3)' },
  planEditText:{ color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },

  // Day rows
  dayRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, paddingVertical: 10 },
  dayRowToday:{ borderColor: 'rgba(0,201,167,0.4)', backgroundColor: 'rgba(0,201,167,0.06)', shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3 },
  dayRowPast: { opacity: 0.45 },

  dayBadge:         { width: 38, height: 38, borderRadius: 19, backgroundColor: '#242428', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#333' },
  dayBadgeToday:    { backgroundColor: Colors.teal, borderColor: Colors.teal, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 4 },
  dayBadgePast:     { backgroundColor: '#1A1A1C', borderColor: '#222' },
  dayBadgeText:     { color: '#AAAAAA', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  dayBadgeTextToday:{ color: Colors.background },
  dayBadgeTextPast: { color: '#444' },

  dayValue:        { color: '#555', fontSize: FontSize.body },
  dayValuePast:    { color: '#333' },
  dayWorkoutName:  { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  dayWorkoutMeta:  { color: '#555', fontSize: 10 },

  todayGo: { backgroundColor: Colors.teal, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginRight: 4 },
  todayGoText: { color: Colors.background, fontSize: 10, fontFamily: 'Inter_500Medium' },
  overrideDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F0B040', marginRight: 2 },

  // Setup prompt
  setupPrompt: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1C1C1E', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(0,201,167,0.25)',
    padding: 16, marginBottom: 8,
    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 3,
  },
  setupIcon:  { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,201,167,0.12)', alignItems: 'center', justifyContent: 'center' },
  setupTitle: { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 3 },
  setupSub:   { color: '#666', fontSize: 10, lineHeight: 14 },
});

