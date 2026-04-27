import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '../../constants/colors';
import { FontSize } from '../../constants/fonts';
import { i18n } from '../../lib/i18n';
import { useUserStore } from '../../stores/userStore';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';

function getGreeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? i18n.t('home.greetingMorning') : i18n.t('home.greetingEvening');
}

export default function HomeScreen() {
  const user        = useUserStore(s => s.user);
  const isOnboarded = useUserStore(s => s.isOnboarded);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/(auth)/login'); return; }
      if (!isOnboarded)  { router.replace('/(auth)/onboarding'); return; }
    });
  }, [isOnboarded]);

  const firstName = user?.name?.split(' ')[0] ?? 'Sak pase';

  return (
    <ScreenWrapper scrollable>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>Prêt à antrene jodi a?</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Streak card */}
      <Card style={styles.streakCard}>
        <View style={styles.streakRow}>
          <Text style={styles.streakFire}>🔥</Text>
          <View>
            <Text style={styles.streakCount}>0 <Text style={styles.streakLabel}>{i18n.t('home.streak')}</Text></Text>
            <Text style={styles.streakMotto}>{i18n.t('home.streakMotto')}</Text>
          </View>
          <Tag label="Top —%" variant="teal" style={styles.streakTag} />
        </View>
      </Card>

      {/* Stats 2×2 */}
      <View style={styles.statsGrid}>
        {[
          { label: i18n.t('home.sessionsWeek'), value: '0' },
          { label: i18n.t('home.totalVolume'),  value: '0 kg' },
          { label: i18n.t('home.todayKcal'),    value: '0 kcal' },
          { label: i18n.t('home.weightProgress'), value: '—' },
        ].map((stat) => (
          <Card key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      {/* Today's workout placeholder */}
      <Card style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>{i18n.t('home.todaysWorkout')}</Text>
          <Tag label="— min" variant="teal" />
        </View>
        <Text style={styles.workoutSub}>Complete onboarding to generate your first plan.</Text>
      </Card>

      {/* Week plan placeholder */}
      <Text style={styles.sectionTitle}>{i18n.t('home.weekPlan')}</Text>
      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => (
        <Card key={day} style={styles.dayRow}>
          <Text style={styles.dayLabel}>{day}</Text>
          <Text style={styles.dayValue}>—</Text>
        </Card>
      ))}

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting:      { color: Colors.textPrimary, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  subGreeting:   { color: Colors.textMuted, fontSize: FontSize.caption, marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.teal,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:    { color: Colors.background, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },

  streakCard:    { marginBottom: Spacing.cardGap },
  streakRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakFire:    { fontSize: 28 },
  streakCount:   { color: Colors.textPrimary, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  streakLabel:   { color: Colors.textMuted, fontSize: FontSize.body, fontFamily: 'Inter_400Regular' },
  streakMotto:   { color: Colors.textMuted, fontSize: FontSize.caption, marginTop: 2, fontStyle: 'italic' },
  streakTag:     { marginLeft: 'auto' },

  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.cardGap, marginBottom: Spacing.cardGap },
  statCard:      { flex: 1, minWidth: '45%' },
  statValue:     { color: Colors.textPrimary, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  statLabel:     { color: Colors.textMuted, fontSize: FontSize.caption, marginTop: 4 },

  workoutCard:   { marginBottom: Spacing.cardGap },
  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  workoutTitle:  { color: Colors.textPrimary, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },
  workoutSub:    { color: Colors.textMuted, fontSize: FontSize.bodySm },

  sectionTitle:  { color: Colors.textPrimary, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 10, marginTop: 6 },
  dayRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingVertical: 12 },
  dayLabel:      { color: Colors.textSecondary, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  dayValue:      { color: Colors.textMuted, fontSize: FontSize.body },
});
