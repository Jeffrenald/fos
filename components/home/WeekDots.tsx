import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { DAY_LABELS, todayDayIndex } from '@/lib/planGenerator';
import { usePlanStore } from '@/stores/planStore';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';

function thisWeekStart(): string {
  const d = new Date();
  // shift to Monday
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function WeekDots() {
  const user    = useUserStore(s => s.user);
  const plan    = usePlanStore(s => s.plan);
  const todayIdx = todayDayIndex();
  const [doneDays, setDoneDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('workout_sessions')
      .select('started_at, completed_at')
      .eq('user_id', user.id)
      .gte('started_at', thisWeekStart())
      .not('completed_at', 'is', null)
      .then(({ data }) => {
        if (!data) return;
        const done = new Set<number>();
        data.forEach(s => {
          const d = new Date(s.started_at);
          const jsDay = d.getDay(); // 0=Sun
          const idx   = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon
          done.add(idx);
        });
        setDoneDays(done);
      });
  }, [user?.id]);

  return (
    <View style={s.row}>
      {DAY_LABELS.map((label, i) => {
        const isToday    = i === todayIdx;
        const isDone     = doneDays.has(i);
        const isPast     = i < todayIdx;
        const planDay    = plan?.days.find(d => d.dayIndex === i);
        const isRestDay  = planDay?.isRest ?? false;
        const isFuture   = i > todayIdx;

        return (
          <View key={i} style={s.col}>
            {/* Dot */}
            <View style={[
              s.dot,
              isDone    && s.dotDone,
              isToday   && !isDone && s.dotToday,
              isPast    && !isDone && isRestDay && s.dotRestPast,
              isPast    && !isDone && !isRestDay && s.dotMissed,
              isFuture  && isRestDay && s.dotRestFuture,
              isFuture  && !isRestDay && s.dotFuture,
            ]}>
              {isDone && (
                <View style={s.check} />
              )}
            </View>
            <Text style={[s.label, isToday && s.labelToday]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  col:   { alignItems: 'center', gap: 5 },

  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#2A2A2E',
    borderWidth: 1, borderColor: '#333',
    alignItems: 'center', justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7, shadowRadius: 4, elevation: 3,
  },
  dotToday: {
    backgroundColor: 'rgba(0,201,167,0.15)',
    borderColor: Colors.teal,
    borderWidth: 1.5,
  },
  dotRestPast:   { backgroundColor: '#1A1A1C', borderColor: '#252525' },
  dotMissed:     { backgroundColor: 'rgba(255,122,133,0.2)', borderColor: 'rgba(255,122,133,0.4)' },
  dotRestFuture: { backgroundColor: '#1A1A1C', borderColor: '#222' },
  dotFuture:     { backgroundColor: '#1C1C1E', borderColor: '#2A2A2E' },

  check: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.background },

  label:      { color: '#444', fontSize: 8, fontFamily: 'Inter_500Medium' },
  labelToday: { color: Colors.teal },
});
