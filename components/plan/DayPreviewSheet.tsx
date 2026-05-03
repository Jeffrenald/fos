import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Pressable, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { EXERCISES } from '@/constants/exercises';
import { DAY_FULL } from '@/lib/planGenerator';
import type { PlannedDay } from '@/lib/planGenerator';
import { usePlanStore } from '@/stores/planStore';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const E = {
  sheet: '#1C1C1E',
  card:  '#242428',
  line:  '#333338',
};

const REST_QUOTES = [
  'Recovery is where the gains are made.',
  'Rest days are training days — for your nervous system.',
  'Ti pa ti pa, ou rive lwen. Rest is part of the journey.',
  'Your muscles grow while you sleep, not while you lift.',
  'Even champions take rest days. You\'ve earned this.',
];

interface DayPreviewSheetProps {
  day:     PlannedDay | null;
  visible: boolean;
  isPast:  boolean;
  onClose: () => void;
}

export function DayPreviewSheet({ day, visible, isPast, onClose }: DayPreviewSheetProps) {
  const overrideDay = usePlanStore(s => s.overrideDay);

  if (!day) return null;

  const isRest    = day.isRest;
  const workout   = day.workout;
  const dayName   = DAY_FULL[day.dayIndex];
  const restQuote = REST_QUOTES[day.dayIndex % REST_QUOTES.length];

  function startWorkout() {
    if (!workout) return;
    onClose();
    const sessionId = `${workout.variationId}-${Date.now()}`;
    router.push(`/workout/${sessionId}?variation=${workout.variationId}&ids=${workout.exerciseIds.join(',')}`);
  }

  function handleOverride() {
    if (!day) return;
    overrideDay(day.dayIndex, !isRest);
    onClose();
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        <View style={s.container}>
          <View style={s.handle} />

          {/* Header */}
          <View style={[s.header, !isRest && {
            borderBottomColor: 'rgba(0,201,167,0.2)',
          }]}>
            {/* Day + status */}
            <View style={{ flex: 1 }}>
              <Text style={s.dayName}>{dayName}</Text>
              {isRest ? (
                <Text style={s.restLabel}>Rest Day</Text>
              ) : (
                <View style={s.workoutMeta}>
                  <Text style={s.workoutEmoji}>{workout?.emoji}</Text>
                  <View>
                    <Text style={s.workoutTitle}>{workout?.name}</Text>
                    <Text style={s.workoutFocus}>{workout?.focus}</Text>
                  </View>
                </View>
              )}
            </View>
            {/* Past tag + close */}
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              {isPast && (
                <View style={s.pastBadge}>
                  <Text style={s.pastBadgeText}>Past</Text>
                </View>
              )}
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Ionicons name="close" size={18} color="#777" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

            {isRest ? (
              /* ── Rest day content ── */
              <View>
                <View style={s.restCard}>
                  <Text style={s.restEmoji}>💤</Text>
                  <Text style={s.restQuote}>"{restQuote}"</Text>
                </View>

                <View style={s.restTips}>
                  {['Stay hydrated — aim for 2–3L of water', 'Light walking or stretching is fine', 'Get 7–9 hours of sleep for best recovery'].map((tip, i) => (
                    <View key={i} style={s.tipRow}>
                      <View style={s.tipDot} />
                      <Text style={s.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              /* ── Workout preview ── */
              <View>
                {/* Stats row */}
                <View style={s.statsRow}>
                  <View style={s.statCell}>
                    <Text style={s.statValue}>{workout?.exerciseIds.length}</Text>
                    <Text style={s.statLabel}>exercises</Text>
                  </View>
                  <View style={s.statDiv} />
                  <View style={s.statCell}>
                    <Text style={s.statValue}>{workout?.estimatedMin}</Text>
                    <Text style={s.statLabel}>minutes</Text>
                  </View>
                  <View style={s.statDiv} />
                  <View style={s.statCell}>
                    <Text style={s.statValue}>{day.userOverride ? 'Custom' : 'Planned'}</Text>
                    <Text style={s.statLabel}>type</Text>
                  </View>
                </View>

                {/* Exercise list */}
                <Text style={s.sectionTitle}>Exercises</Text>
                {workout?.exerciseIds.map((id, index) => {
                  const ex = EXERCISES.find(e => e.id === id);
                  if (!ex) return null;
                  return (
                    <View key={id} style={s.exRow}>
                      <View style={s.exIndex}>
                        <Text style={s.exIndexText}>{index + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.exName}>{ex.name}</Text>
                        <Text style={s.exMuscles} numberOfLines={1}>
                          {ex.musclesPrimary.join(' · ')}
                        </Text>
                      </View>
                      <Text style={s.exSets}>{ex.defaultSets}×{ex.defaultReps}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={s.footer}>
            {/* Override button */}
            <TouchableOpacity style={s.overrideBtn} onPress={handleOverride} activeOpacity={0.8}>
              <Ionicons name={isRest ? 'barbell-outline' : 'bed-outline'} size={15} color="#888" />
              <Text style={s.overrideBtnText}>
                {isRest ? 'Train instead' : 'Switch to rest day'}
              </Text>
            </TouchableOpacity>

            {/* Start workout */}
            {!isRest && (
              <TouchableOpacity
                style={[s.startBtn, isPast && s.startBtnPast, !isPast && {
                  shadowColor: Colors.teal,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                  elevation: 6,
                }]}
                onPress={startWorkout}
                activeOpacity={0.85}
              >
                <Ionicons name="play" size={16} color={isPast ? '#888' : Colors.background} />
                <Text style={[s.startBtnText, isPast && s.startBtnTextPast]}>
                  {isPast ? 'Start anyway' : 'Start workout'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  container: {
    height: SCREEN_HEIGHT * 0.78,
    backgroundColor: E.sheet,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: E.line,
  },
  handle: {
    width: 36, height: 4, backgroundColor: '#444',
    borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: E.line, gap: 12,
  },
  dayName:     { color: '#FFFFFF', fontSize: FontSize.h2, fontFamily: 'Inter_500Medium', marginBottom: 6 },
  restLabel:   { color: '#555', fontSize: FontSize.body },
  workoutMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  workoutEmoji:{ fontSize: 24 },
  workoutTitle:{ color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  workoutFocus:{ color: '#666', fontSize: FontSize.caption, marginTop: 2 },
  pastBadge: {
    backgroundColor: '#2A2A2E', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  pastBadgeText:{ color: '#666', fontSize: 10 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center',
  },

  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.screenPadding, paddingBottom: 12 },

  // Rest day
  restCard: {
    backgroundColor: E.card, borderRadius: 16,
    borderWidth: 0.5, borderColor: E.line,
    padding: 20, alignItems: 'center', marginBottom: 16,
  },
  restEmoji: { fontSize: 40, marginBottom: 12 },
  restQuote: { color: '#CCCCCC', fontSize: FontSize.body, textAlign: 'center', lineHeight: 22, fontStyle: 'italic' },
  restTips:  { gap: 10 },
  tipRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.teal },
  tipText:   { color: '#AAAAAA', fontSize: FontSize.bodySm, flex: 1 },

  // Workout stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: E.card, borderRadius: 14,
    borderWidth: 0.5, borderColor: E.line,
    padding: 14, marginBottom: 20,
  },
  statCell:  { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.teal, fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  statLabel: { color: '#666', fontSize: 10, marginTop: 4 },
  statDiv:   { width: 1, height: 36, backgroundColor: E.line },

  sectionTitle: {
    color: '#FFFFFF', fontSize: FontSize.body,
    fontFamily: 'Inter_500Medium', marginBottom: 10,
  },

  exRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: E.card, borderRadius: 12,
    borderWidth: 0.5, borderColor: E.line,
    padding: 12, marginBottom: 8,
  },
  exIndex: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,201,167,0.1)',
    borderWidth: 0.5, borderColor: 'rgba(0,201,167,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  exIndexText: { color: Colors.teal, fontSize: 10, fontFamily: 'Inter_500Medium' },
  exName:      { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  exMuscles:   { color: '#666', fontSize: 10, textTransform: 'capitalize' },
  exSets:      { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },

  // Footer
  footer: {
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: E.line,
    flexDirection: 'row', gap: 10, alignItems: 'center',
  },
  overrideBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: E.card, borderRadius: 12,
    borderWidth: 0.5, borderColor: E.line,
    paddingVertical: 13, paddingHorizontal: 14,
  },
  overrideBtnText: { color: '#777', fontSize: FontSize.bodySm, fontFamily: 'Inter_500Medium' },

  startBtn: {
    flex: 1, backgroundColor: Colors.teal,
    borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  startBtnPast:     { backgroundColor: '#2A2A2E' },
  startBtnText:     { color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  startBtnTextPast: { color: '#666' },
});
