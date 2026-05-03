import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Pressable, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { ULTIMATE_GROWTH_DAYS, EXERCISES } from '@/constants/exercises';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const E = { sheet: '#1A1A1C', card: '#222226', line: '#2E2E34', gold: '#F0B040' };

interface UltimateGrowthSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function UltimateGrowthSheet({ visible, onClose }: UltimateGrowthSheetProps) {
  function startDay(dayIndex: number) {
    const day = ULTIMATE_GROWTH_DAYS[dayIndex];
    onClose();
    const sessionId = `ug-day${day.day}-${Date.now()}`;
    router.push(`/workout/${sessionId}?variation=ug-day${day.day}&ids=${day.exerciseIds.join(',')}`);
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        <View style={s.container}>
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <View style={s.titleRow}>
              <View style={s.crownWrap}>
                <Text style={s.crown}>👑</Text>
              </View>
              <View>
                <Text style={s.title}>Ultimate Growth</Text>
                <Text style={s.subtitle}>Multi-muscle · Max hypertrophy · 5-day rotation</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={18} color="#777" />
            </TouchableOpacity>
          </View>

          {/* Science note */}
          <View style={s.scienceCard}>
            <Ionicons name="flask-outline" size={15} color={E.gold} />
            <Text style={s.scienceText}>
              Each day you train 2–3 muscle groups that naturally work together — so you hit
              more total volume per muscle each week without burning out.
            </Text>
          </View>

          <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            {ULTIMATE_GROWTH_DAYS.map((day, i) => (
              <View key={day.day} style={s.dayCard}>
                {/* Day header */}
                <View style={s.dayHeader}>
                  <View style={s.dayNumWrap}>
                    <Text style={s.dayNum}>{day.day}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.dayEmoji}>{day.emoji}</Text>
                    <Text style={s.dayName}>{day.name}</Text>
                    <Text style={s.dayMeta}>{day.exerciseIds.length} exercises · {day.estimatedMin} min</Text>
                  </View>
                  <TouchableOpacity
                    style={s.startBtn}
                    onPress={() => startDay(i)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="play" size={14} color={Colors.background} />
                    <Text style={s.startBtnText}>Start</Text>
                  </TouchableOpacity>
                </View>

                {/* Logic note */}
                <View style={s.logicRow}>
                  <Ionicons name="bulb-outline" size={12} color="#555" />
                  <Text style={s.logicText}>{day.logic}</Text>
                </View>

                {/* Exercise pills */}
                <View style={s.exPills}>
                  {day.exerciseIds.map(id => {
                    const ex = EXERCISES.find(e => e.id === id);
                    return ex ? (
                      <View key={id} style={s.pill}>
                        <Text style={s.pillText}>{ex.name}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            ))}

            <Text style={s.rotationNote}>
              Repeat the 5-day rotation continuously. Rest whenever needed between cycles.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  container: {
    height: SCREEN_HEIGHT * 0.88,
    backgroundColor: E.sheet,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: E.gold + '44',
    // gold glow on opening
    shadowColor: E.gold,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    width: 36, height: 4,
    backgroundColor: E.gold + '44',
    borderRadius: 2, alignSelf: 'center',
    marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: E.line,
  },
  titleRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  crownWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: E.gold + '18',
    borderWidth: 1, borderColor: E.gold + '44',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: E.gold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 4,
  },
  crown:    { fontSize: 22 },
  title:    { color: E.gold, fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  subtitle: { color: '#777', fontSize: FontSize.caption, marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center',
  },

  scienceCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: E.gold + '0C',
    borderWidth: 0.5, borderColor: E.gold + '33',
    borderRadius: 12, margin: Spacing.screenPadding,
    marginTop: 12, marginBottom: 0, padding: 12,
  },
  scienceText: { color: '#AAAAAA', fontSize: FontSize.caption, flex: 1, lineHeight: 18 },

  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.screenPadding, paddingBottom: 32 },

  dayCard: {
    backgroundColor: E.card, borderRadius: 16,
    borderWidth: 0.5, borderColor: E.line,
    padding: 14, marginBottom: 10,
  },
  dayHeader:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  dayNumWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: E.gold + '18',
    borderWidth: 0.5, borderColor: E.gold + '44',
    alignItems: 'center', justifyContent: 'center',
  },
  dayNum:  { color: E.gold, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  dayEmoji:{ fontSize: 16, marginBottom: 2 },
  dayName: { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  dayMeta: { color: '#555', fontSize: 10 },
  startBtn: {
    backgroundColor: E.gold,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    shadowColor: E.gold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 4,
  },
  startBtnText: { color: '#000', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },

  logicRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 10 },
  logicText: { color: '#555', fontSize: 10, flex: 1, lineHeight: 16 },

  exPills:   { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  pill:      { backgroundColor: '#2A2A2E', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 0.5, borderColor: '#333' },
  pillText:  { color: '#888', fontSize: 9 },

  rotationNote: {
    color: '#444', fontSize: FontSize.caption,
    textAlign: 'center', fontStyle: 'italic', marginTop: 8, lineHeight: 18,
  },
});
