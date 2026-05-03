import { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Pressable, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { DAY_LABELS, FREQUENCY_META, generateWeekPlan } from '@/lib/planGenerator';
import type { Level } from '@/constants/exercises';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const E = {
  sheet: '#1C1C1E',
  card:  '#242428',
  line:  '#333338',
};

interface FrequencySheetProps {
  visible:     boolean;
  currentFreq: number | null;
  userLevel:   Level;
  onClose:     () => void;
  onGenerate:  (frequency: number) => void;
}

export function FrequencySheet({
  visible, currentFreq, userLevel, onClose, onGenerate,
}: FrequencySheetProps) {
  const [selected, setSelected] = useState(currentFreq ?? 4);

  const meta    = FREQUENCY_META[selected];
  const preview = generateWeekPlan(selected, userLevel);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        <View style={s.container}>
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.title}>Set up your plan</Text>
              <Text style={s.subtitle}>How many times a week do you want to train?</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={18} color="#777" />
            </TouchableOpacity>
          </View>

          <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Frequency selector */}
            <View style={s.freqRow}>
              {[3, 4, 5, 6, 7].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[s.freqBtn, selected === f && s.freqBtnActive, selected === f && {
                    shadowColor: Colors.teal,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 4,
                  }]}
                  onPress={() => setSelected(f)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.freqNum, selected === f && s.freqNumActive]}>{f}</Text>
                  <Text style={[s.freqX, selected === f && s.freqXActive]}>×</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recommendation text */}
            <View style={s.recCard}>
              <Ionicons
                name={meta.warning ? 'warning-outline' : 'checkmark-circle-outline'}
                size={16}
                color={meta.warning ? '#F0B040' : Colors.teal}
              />
              <Text style={[s.recText, meta.warning && { color: '#F0B040' }]}>
                {meta.rec}
              </Text>
            </View>
            {meta.warning && (
              <Text style={s.warningText}>⚠️ {meta.warning}</Text>
            )}

            {/* Day preview */}
            <Text style={s.previewLabel}>Recommended schedule</Text>
            <View style={s.dayGrid}>
              {preview.days.map(day => (
                <View
                  key={day.dayIndex}
                  style={[s.dayChip, day.isRest ? s.dayChipRest : s.dayChipWork, !day.isRest && {
                    shadowColor: Colors.teal,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                    elevation: 3,
                  }]}
                >
                  <Text style={[s.dayChipLabel, !day.isRest && s.dayChipLabelWork]}>
                    {DAY_LABELS[day.dayIndex]}
                  </Text>
                  {!day.isRest && day.workout && (
                    <Text style={s.dayChipEmoji}>{day.workout.emoji}</Text>
                  )}
                  {day.isRest && (
                    <Text style={s.dayChipRest2}>Rest</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Workout breakdown */}
            <Text style={s.previewLabel}>What you'll train</Text>
            {preview.days.filter(d => !d.isRest && d.workout).map(day => (
              <View key={day.dayIndex} style={s.workoutRow}>
                <Text style={s.workoutDay}>{DAY_LABELS[day.dayIndex]}</Text>
                <View style={s.workoutInfo}>
                  <Text style={s.workoutName}>{day.workout!.emoji} {day.workout!.name}</Text>
                  <Text style={s.workoutFocus}>{day.workout!.focus}</Text>
                </View>
                <Text style={s.workoutTime}>{day.workout!.estimatedMin}m</Text>
              </View>
            ))}

            <Text style={s.overrideNote}>
              You can override individual days after generating the plan.
            </Text>
          </ScrollView>

          {/* CTA */}
          <View style={s.footer}>
            <TouchableOpacity
              style={[s.cta, {
                shadowColor: Colors.teal,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 6,
              }]}
              onPress={() => { onGenerate(selected); onClose(); }}
              activeOpacity={0.85}
            >
              <Text style={s.ctaText}>Generate {selected}× Plan</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  container: {
    height: SCREEN_HEIGHT * 0.88,
    backgroundColor: E.sheet,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: E.line,
  },
  handle: {
    width: 36, height: 4, backgroundColor: '#444',
    borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: E.line,
  },
  title:    { color: '#FFFFFF', fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  subtitle: { color: '#777', fontSize: FontSize.caption, marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center',
  },

  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.screenPadding, paddingBottom: 20 },

  // Frequency buttons
  freqRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  freqBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 14, borderWidth: 1,
    backgroundColor: E.card, borderColor: E.line,
  },
  freqBtnActive: { backgroundColor: 'rgba(0,201,167,0.12)', borderColor: 'rgba(0,201,167,0.5)' },
  freqNum:       { color: '#FFFFFF', fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  freqNumActive: { color: Colors.teal },
  freqX:         { color: '#555', fontSize: 10, marginTop: 2 },
  freqXActive:   { color: Colors.teal },

  // Recommendation
  recCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: E.card, borderRadius: 12,
    borderWidth: 0.5, borderColor: E.line,
    padding: 12, marginBottom: 8,
  },
  recText:     { color: '#CCCCCC', fontSize: FontSize.bodySm, flex: 1, lineHeight: 18 },
  warningText: { color: '#F0B040', fontSize: FontSize.caption, marginBottom: 16, paddingLeft: 4 },

  // Day grid
  previewLabel: {
    color: '#FFFFFF', fontSize: FontSize.body,
    fontFamily: 'Inter_500Medium', marginBottom: 10, marginTop: 16,
  },
  dayGrid:    { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dayChip: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, gap: 4,
  },
  dayChipRest: { backgroundColor: '#1A1A1C', borderColor: '#2A2A2E' },
  dayChipWork: { backgroundColor: 'rgba(0,201,167,0.1)', borderColor: 'rgba(0,201,167,0.35)' },
  dayChipLabel:      { color: '#555', fontSize: 9, fontFamily: 'Inter_500Medium' },
  dayChipLabelWork:  { color: Colors.teal },
  dayChipEmoji:      { fontSize: 14 },
  dayChipRest2:      { color: '#333', fontSize: 8 },

  // Workout list
  workoutRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: E.card, borderRadius: 12,
    borderWidth: 0.5, borderColor: E.line,
    padding: 12, marginBottom: 8, gap: 12,
  },
  workoutDay:   { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', width: 28 },
  workoutInfo:  { flex: 1 },
  workoutName:  { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  workoutFocus: { color: '#666', fontSize: 10 },
  workoutTime:  { color: '#555', fontSize: FontSize.caption },

  overrideNote: {
    color: '#444', fontSize: FontSize.caption,
    textAlign: 'center', fontStyle: 'italic', marginTop: 8, lineHeight: 18,
  },

  // CTA
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: E.line,
  },
  cta: {
    backgroundColor: Colors.teal, borderRadius: 14,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  ctaText: { color: Colors.background, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },
});
