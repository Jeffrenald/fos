import { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { WorkoutTemplate, WorkoutVariation, Level } from '@/constants/exercises';

// ─── Level badge ─────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<Level, { bg: string; text: string; dot: string }> = {
  beginner:     { bg: 'rgba(63,204,147,0.15)', text: '#3FCC93', dot: '#3FCC93' },
  intermediate: { bg: 'rgba(0,201,167,0.15)',  text: '#00C9A7', dot: '#00C9A7' },
  advanced:     { bg: 'rgba(255,122,133,0.15)',text: '#FF7A85', dot: '#FF7A85' },
};

function LevelBadge({ level }: { level: Level }) {
  const c = LEVEL_COLORS[level];
  return (
    <View style={[badge.wrap, { backgroundColor: c.bg }]}>
      <View style={[badge.dot, { backgroundColor: c.dot }]} />
      <Text style={[badge.text, { color: c.text }]}>{level}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  dot:  { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', textTransform: 'capitalize' },
});

// ─── Variation card ───────────────────────────────────────────────────────────

function VariationCard({
  variation,
  onStart,
  recommended,
}: {
  variation: WorkoutVariation;
  onStart: () => void;
  recommended: boolean;
}) {
  return (
    <TouchableOpacity
      style={[card.wrap, recommended && card.wrapRecommended]}
      onPress={onStart}
      activeOpacity={0.85}
    >
      {recommended && (
        <View style={card.recommendedBadge}>
          <Text style={card.recommendedText}>Recommended for you</Text>
        </View>
      )}

      <View style={card.topRow}>
        <LevelBadge level={variation.level} />
        <Text style={card.time}>
          <Ionicons name="time-outline" size={12} color={Colors.textMuted} /> {variation.estimatedMin} min
        </Text>
      </View>

      <Text style={card.label}>{variation.label}</Text>
      <Text style={card.description}>{variation.description}</Text>

      <View style={card.focusRow}>
        <Ionicons name="body-outline" size={13} color={Colors.textDim} />
        <Text style={card.focus}>{variation.focus}</Text>
      </View>

      <View style={card.exRow}>
        {variation.exerciseIds.slice(0, 4).map((id, i) => (
          <View key={id} style={card.exPill}>
            <Text style={card.exPillText} numberOfLines={1}>
              {id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </View>
        ))}
        {variation.exerciseIds.length > 4 && (
          <View style={card.exPill}>
            <Text style={card.exPillText}>+{variation.exerciseIds.length - 4}</Text>
          </View>
        )}
      </View>

      <View style={[card.startBtn, recommended && card.startBtnPrimary]}>
        <Text style={[card.startText, recommended && card.startTextPrimary]}>
          Start {variation.label}
        </Text>
        <Ionicons
          name="arrow-forward"
          size={16}
          color={recommended ? Colors.background : Colors.teal}
        />
      </View>
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  wrapRecommended: {
    borderColor: Colors.teal,
    backgroundColor: 'rgba(0,201,167,0.05)',
  },
  recommendedBadge: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  recommendedText: { color: Colors.background, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },

  topRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  time:        { color: Colors.textMuted, fontSize: FontSize.caption },

  label:       { color: Colors.textPrimary, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  description: { color: Colors.textMuted,   fontSize: FontSize.bodySm, marginBottom: 10 },

  focusRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  focus:       { color: Colors.textDim, fontSize: FontSize.caption },

  exRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  exPill: {
    backgroundColor: Colors.surfaceRaised,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  exPillText:  { color: Colors.textMuted, fontSize: 10, fontFamily: 'Inter_400Regular' },

  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.teal,
    borderRadius: 12, paddingVertical: 12,
  },
  startBtnPrimary: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  startText:      { color: Colors.teal,       fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  startTextPrimary:{ color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});

// ─── Sheet ────────────────────────────────────────────────────────────────────

interface VariationSheetProps {
  template:    WorkoutTemplate | null;
  userLevel:   Level;
  visible:     boolean;
  onClose:     () => void;
  onStart:     (variationId: string, exerciseIds: string[]) => void;
}

export function VariationSheet({ template, userLevel, visible, onClose, onStart }: VariationSheetProps) {
  const translateY = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue:         visible ? 0 : 600,
      useNativeDriver: true,
      tension:         65,
      friction:        11,
    }).start();
  }, [visible]);

  if (!template) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={sheet.backdrop} onPress={onClose} />

      {/* Sheet */}
      <Animated.View style={[sheet.container, { transform: [{ translateY }] }]}>
        {/* Handle */}
        <View style={sheet.handle} />

        {/* Header */}
        <View style={sheet.header}>
          <View style={sheet.headerLeft}>
            <Text style={sheet.emoji}>{template.emoji}</Text>
            <View>
              <Text style={sheet.title}>{template.name}</Text>
              <Text style={sheet.subtitle}>Choose your level</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={sheet.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Variations */}
        <ScrollView
          style={sheet.scroll}
          contentContainerStyle={sheet.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {template.variations.map(v => (
            <VariationCard
              key={v.id}
              variation={v}
              recommended={v.level === userLevel}
              onStart={() => { onClose(); onStart(v.id, v.exerciseIds); }}
            />
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const sheet = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderTopWidth: 0.5,
    borderColor: Colors.border,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji:      { fontSize: 28 },
  title:      { color: Colors.textPrimary, fontSize: FontSize.h3,   fontFamily: 'Inter_500Medium' },
  subtitle:   { color: Colors.textMuted,   fontSize: FontSize.caption },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.screenPadding, paddingBottom: 40 },
});
