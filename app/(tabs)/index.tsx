import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { i18n } from '@/lib/i18n';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { HAITIAN_PROVERBS } from '@/constants/haitian-foods-db';
import { WORKOUT_TEMPLATES } from '@/constants/exercises';

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

  const proverb = HAITIAN_PROVERBS[new Date().getDay() % HAITIAN_PROVERBS.length];
  const firstName = user?.name?.split(' ')[0] ?? 'Sak pase';
  const todayDay  = DAYS[new Date().getDay()];

  function startQuickWorkout(templateKey: string) {
    const sessionId = `${templateKey}-${Date.now()}`;
    router.push(`/workout/${sessionId}?template=${templateKey}`);
  }

  return (
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.templateScroll}>
        {Object.entries(WORKOUT_TEMPLATES).map(([key, tmpl]) => (
          <TouchableOpacity
            key={key}
            style={s.templateCard}
            onPress={() => startQuickWorkout(key)}
            activeOpacity={0.8}
          >
            <Text style={s.templateEmoji}>{tmpl.emoji}</Text>
            <Text style={s.templateName}>{tmpl.name}</Text>
            <Text style={s.templateCount}>{tmpl.exerciseIds.length} exercises</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Week plan ── */}
      <Text style={[s.sectionTitle, { marginTop: 8 }]}>{i18n.t('home.weekPlan')}</Text>
      {DAYS.map((day) => {
        const isToday = day === todayDay;
        return (
          <Card key={day} style={isToday ? [s.dayRow, s.dayRowToday] : s.dayRow}>
            <View style={isToday ? [s.dayBadge, s.dayBadgeToday] : s.dayBadge}>
              <Text style={isToday ? [s.dayBadgeText, s.dayBadgeTextToday] : s.dayBadgeText}>{day}</Text>
            </View>
            <Text style={isToday ? [s.dayValue, { color: Colors.textPrimary }] : s.dayValue}>
              {isToday ? 'Start a workout →' : '—'}
            </Text>
            {isToday && (
              <TouchableOpacity
                style={s.startBtn}
                onPress={() => startQuickWorkout('push')}
                activeOpacity={0.8}
              >
                <Text style={s.startBtnText}>Go</Text>
              </TouchableOpacity>
            )}
          </Card>
        );
      })}
    </ScreenWrapper>
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

  streakCard:       { marginBottom: Spacing.cardGap },
  streakRow:        { flexDirection: 'row', alignItems: 'center', gap: 14 },
  streakFire:       { fontSize: 32 },
  streakCount:      { color: Colors.textPrimary, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  streakLabel:      { color: Colors.textMuted,   fontSize: FontSize.body, fontFamily: 'Inter_400Regular' },
  streakMotto:      { color: Colors.textSecondary, fontSize: FontSize.caption, marginTop: 4, fontStyle: 'italic' },
  streakTranslation: { color: Colors.textDim,     fontSize: FontSize.caption },

  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.cardGap, marginBottom: 20 },
  statCard:     { flex: 1, minWidth: '45%' },
  statValue:    { color: Colors.textPrimary, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  statLabel:    { color: Colors.textMuted,   fontSize: FontSize.caption, marginTop: 4 },

  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 12 },

  templateScroll: { marginBottom: 20, overflow: 'visible' },
  templateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18, borderWidth: 0.5, borderColor: Colors.border,
    padding: 16, marginRight: 12, width: 130, alignItems: 'center', gap: 6,
  },
  templateEmoji: { fontSize: 30 },
  templateName:  { color: Colors.textPrimary, fontSize: FontSize.body, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  templateCount: { color: Colors.textMuted,   fontSize: FontSize.caption },

  dayRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 8, paddingVertical: 12,
  },
  dayRowToday:       { borderColor: Colors.tealBorder, backgroundColor: Colors.tealDim },
  dayBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center', justifyContent: 'center',
  },
  dayBadgeToday:     { backgroundColor: Colors.teal },
  dayBadgeText:      { color: Colors.textMuted,   fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  dayBadgeTextToday: { color: Colors.background },
  dayValue:          { color: Colors.textMuted, fontSize: FontSize.body, flex: 1 },
  startBtn: {
    backgroundColor: Colors.teal, borderRadius: Radius.sm,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  startBtnText: { color: Colors.background, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
});

