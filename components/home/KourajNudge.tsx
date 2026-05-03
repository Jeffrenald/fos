import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { HAITIAN_PROVERBS } from '@/constants/haitian-foods-db';

type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'core' | 'biceps' | 'triceps';

const MUSCLE_LABEL: Record<MuscleGroup, string> = {
  chest:    'chest', back:      'back',   legs:      'legs',
  shoulders:'shoulders', core: 'core',   biceps:    'biceps', triceps: 'triceps',
};

function buildNudge(
  daysSinceLast: number,
  leastTrained: MuscleGroup | null,
  streak: number,
  firstName: string,
): { message: string; cta: string } {
  if (daysSinceLast >= 3) {
    return {
      message: `It's been ${daysSinceLast} days since your last session, ${firstName}. Your muscles are rested and ready — this is the perfect time.`,
      cta: 'Start now',
    };
  }
  if (leastTrained && daysSinceLast === 0) {
    return {
      message: `Great session today! Your ${MUSCLE_LABEL[leastTrained]} hasn't been trained in a while — consider adding it to your next session.`,
      cta: 'See exercises',
    };
  }
  if (streak >= 5) {
    const proverb = HAITIAN_PROVERBS[streak % HAITIAN_PROVERBS.length];
    return {
      message: `${streak} days straight, ${firstName}! "${proverb.ht}" — ${proverb.en}. Keep going.`,
      cta: 'Keep the streak',
    };
  }
  if (leastTrained) {
    return {
      message: `You haven't trained your ${MUSCLE_LABEL[leastTrained]} recently. Adding a focused set today keeps your physique balanced.`,
      cta: 'Find exercises',
    };
  }
  const proverb = HAITIAN_PROVERBS[new Date().getDay() % HAITIAN_PROVERBS.length];
  return {
    message: `"${proverb.ht}" — ${proverb.en}. Ready for today's session, ${firstName}?`,
    cta: 'Let\'s go',
  };
}

export function KourajNudge() {
  const user = useUserStore(s => s.user);
  const [nudge, setNudge] = useState<{ message: string; cta: string } | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      // Last session date
      supabase
        .from('workout_sessions')
        .select('started_at, completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(10),

      // Exercise logs for muscle group frequency
      supabase
        .from('exercise_logs')
        .select('muscle_group, logged_at')
        .order('logged_at', { ascending: false })
        .limit(100),
    ]).then(([sessRes, logRes]) => {
      const sessions = sessRes.data ?? [];
      const logs     = logRes.data ?? [];

      // Days since last session
      const lastDate = sessions[0]?.started_at;
      const daysSinceLast = lastDate
        ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000)
        : 999;

      // Streak
      let streak = 0;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const sessionDays = new Set(sessions.map(s => s.started_at.split('T')[0]));
      for (let i = 0; i < 30; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        if (sessionDays.has(d.toISOString().split('T')[0])) streak++;
        else if (i > 0) break;
      }

      // Least-trained muscle in last 14 days
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 14);
      const recentMuscles = new Map<string, number>();
      logs.forEach(l => {
        if (new Date(l.logged_at) > cutoff) {
          recentMuscles.set(l.muscle_group, (recentMuscles.get(l.muscle_group) ?? 0) + 1);
        }
      });
      const allMuscles: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'core', 'biceps', 'triceps'];
      let leastTrained: MuscleGroup = allMuscles[0];
      let leastCount = recentMuscles.get(allMuscles[0]) ?? 0;
      for (const m of allMuscles) {
        const count = recentMuscles.get(m) ?? 0;
        if (count < leastCount) { leastCount = count; leastTrained = m; }
      }

      const firstName = user?.name?.split(' ')[0] ?? 'chè zanmi';
      setNudge(buildNudge(daysSinceLast, leastTrained, streak, firstName));
    });
  }, [user?.id]);

  if (!nudge) return null;

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarIcon}>⚡</Text>
        </View>
        <Text style={s.from}>Kouraj</Text>
      </View>
      <Text style={s.message}>{nudge.message}</Text>
      <TouchableOpacity
        style={s.cta}
        onPress={() => router.push('/(tabs)/coach')}
        activeOpacity={0.8}
      >
        <Text style={s.ctaText}>{nudge.cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16, borderWidth: 0.5,
    borderColor: 'rgba(0,201,167,0.2)',
    padding: 14, marginBottom: 16,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.teal,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 6, elevation: 3,
  },
  avatarIcon: { fontSize: 14 },
  from:    { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  message: { color: '#CCCCCC', fontSize: FontSize.bodySm, lineHeight: 20, marginBottom: 12 },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,201,167,0.1)',
    borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 0.5, borderColor: 'rgba(0,201,167,0.3)',
  },
  ctaText: { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
});
