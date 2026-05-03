import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { usePlanStore } from '@/stores/planStore';
import { todayDayIndex } from '@/lib/planGenerator';

export function TodayFocusCard() {
  const plan    = usePlanStore(s => s.plan);
  const todayIdx = todayDayIndex();
  const today   = plan?.days.find(d => d.dayIndex === todayIdx);

  if (!plan || !today) return null;

  const isRest  = today.isRest;
  const workout = today.workout;

  function start() {
    if (!workout) return;
    const id = `${workout.variationId}-${Date.now()}`;
    router.push(`/workout/${id}?variation=${workout.variationId}&ids=${workout.exerciseIds.join(',')}`);
  }

  if (isRest) {
    return (
      <View style={[s.card, s.restCard]}>
        <Text style={s.restEmoji}>🌙</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.restTitle}>Rest Day</Text>
          <Text style={s.restSub}>Recovery is part of the process.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.card}>
      {/* Left accent bar */}
      <View style={s.accentBar} />

      <View style={{ flex: 1 }}>
        <Text style={s.label}>TODAY'S WORKOUT</Text>
        <Text style={s.name}>{workout?.emoji}  {workout?.name}</Text>
        <Text style={s.focus} numberOfLines={1}>{workout?.focus}</Text>

        <View style={s.metaRow}>
          <View style={s.metaChip}>
            <Ionicons name="barbell-outline" size={12} color={Colors.teal} />
            <Text style={s.metaText}>{workout?.exerciseIds.length} exercises</Text>
          </View>
          <View style={s.metaChip}>
            <Ionicons name="time-outline" size={12} color={Colors.teal} />
            <Text style={s.metaText}>{workout?.estimatedMin} min</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={s.startBtn} onPress={start} activeOpacity={0.85}>
        <Ionicons name="play" size={18} color={Colors.background} />
        <Text style={s.startText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 18, borderWidth: 1,
    borderColor: 'rgba(0,201,167,0.35)',
    padding: 16, marginBottom: 16,
    gap: 14,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  restCard: { borderColor: '#2A2A2E', shadowColor: 'transparent', elevation: 0 },
  accentBar: {
    width: 3, height: '100%', minHeight: 60,
    backgroundColor: Colors.teal, borderRadius: 2,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6,
  },
  label:   { color: Colors.teal, fontSize: 9, fontFamily: 'Inter_500Medium', letterSpacing: 1, marginBottom: 4 },
  name:    { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 3 },
  focus:   { color: '#777', fontSize: 10, marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaChip:{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,201,167,0.1)', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  metaText:{ color: Colors.teal, fontSize: 10, fontFamily: 'Inter_500Medium' },
  restEmoji:{ fontSize: 28 },
  restTitle:{ color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  restSub:  { color: '#555', fontSize: FontSize.caption, marginTop: 2 },
  startBtn: {
    backgroundColor: Colors.teal, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    alignItems: 'center', gap: 4,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55, shadowRadius: 10, elevation: 5,
  },
  startText: { color: Colors.background, fontSize: 10, fontFamily: 'Inter_500Medium' },
});
