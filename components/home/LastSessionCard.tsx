import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';

interface Session {
  duration_seconds: number | null;
  total_volume_kg:  number | null;
  started_at:       string;
}

function formatDuration(secs: number): string {
  return `${Math.round(secs / 60)} min`;
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export function LastSessionCard() {
  const user = useUserStore(s => s.user);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('workout_sessions')
      .select('duration_seconds, total_volume_kg, started_at')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setSession(data[0] as Session);
      });
  }, [user?.id]);

  if (!session) return null;

  const hasDuration = typeof session.duration_seconds === 'number' && session.duration_seconds > 0;
  const hasVolume   = typeof session.total_volume_kg  === 'number' && session.total_volume_kg  > 0;

  return (
    <View style={s.card}>
      <View style={s.iconWrap}>
        <Ionicons name="refresh-outline" size={16} color={Colors.teal} />
      </View>
      <View style={s.middle}>
        <Text style={s.label}>LAST SESSION</Text>
        <Text style={s.when}>{timeAgo(session.started_at)}</Text>
      </View>
      <View style={s.stats}>
        {hasDuration && (
          <View style={s.stat}>
            <Text style={s.statValue}>{formatDuration(session.duration_seconds!)}</Text>
            <Text style={s.statLabel}>duration</Text>
          </View>
        )}
        {hasDuration && hasVolume && <View style={s.divider} />}
        {hasVolume && (
          <View style={s.stat}>
            <Text style={s.statValue}>{session.total_volume_kg}kg</Text>
            <Text style={s.statLabel}>volume</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1C',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  iconWrap: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,201,167,0.1)',
    borderWidth: 0.5, borderColor: 'rgba(0,201,167,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  middle:    { flex: 1 },
  label:     { color: Colors.teal, fontSize: 8, fontFamily: 'Inter_500Medium', letterSpacing: 0.8 },
  when:      { color: '#AAAAAA', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', marginTop: 1 },
  stats:     { flexDirection: 'row', alignItems: 'center' },
  stat:      { alignItems: 'flex-end', marginLeft: 10 },
  statValue: { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  statLabel: { color: '#555', fontSize: 9, marginTop: 1 },
  divider:   { width: 1, height: 24, backgroundColor: '#2A2A2E', marginLeft: 10 },
});
