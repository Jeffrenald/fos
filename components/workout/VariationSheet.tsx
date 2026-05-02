import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Pressable, ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { WorkoutTemplate, WorkoutVariation, Level } from '@/constants/exercises';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  variation, onStart, recommended,
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
        <View style={card.recBadge}>
          <Text style={card.recText}>⭐ Recommended for you</Text>
        </View>
      )}

      <View style={card.topRow}>
        <LevelBadge level={variation.level} />
        <Text style={card.time}>⏱ {variation.estimatedMin} min</Text>
      </View>

      <Text style={card.label}>{variation.label}</Text>
      <Text style={card.description}>{variation.description}</Text>

      <Text style={card.focus}>💪 {variation.focus}</Text>

      <View style={card.exRow}>
        {variation.exerciseIds.slice(0, 4).map(id => (
          <View key={id} style={card.exPill}>
            <Text style={card.exPillText}>
              {id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </View>
        ))}
        {variation.exerciseIds.length > 4 && (
          <View style={card.exPill}>
            <Text style={card.exPillText}>+{variation.exerciseIds.length - 4} more</Text>
          </View>
        )}
      </View>

      <View style={[card.startBtn, recommended && card.startBtnPrimary]}>
        <Text style={[card.startText, recommended && card.startTextPrimary]}>
          Start {variation.label}
        </Text>
        <Ionicons name="arrow-forward" size={16} color={recommended ? Colors.background : Colors.teal} />
      </View>
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: 16, marginBottom: 12,
  },
  wrapRecommended: { borderColor: Colors.teal, backgroundColor: 'rgba(0,201,167,0.05)' },

  recBadge: {
    backgroundColor: Colors.teal, borderRadius: Radius.full,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, marginBottom: 10,
  },
  recText:   { color: Colors.background, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },

  topRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  time:      { color: Colors.textMuted, fontSize: FontSize.caption },

  label:       { color: Colors.textPrimary, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  description: { color: Colors.textMuted,   fontSize: FontSize.bodySm, marginBottom: 8 },
  focus:       { color: Colors.textDim,     fontSize: FontSize.caption, marginBottom: 12 },

  exRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  exPill:    { backgroundColor: Colors.surfaceRaised, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  exPillText:{ color: Colors.textMuted, fontSize: 10 },

  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.teal, borderRadius: 12, paddingVertical: 12,
  },
  startBtnPrimary: { backgroundColor: Colors.teal },
  startText:       { color: Colors.teal,       fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  startTextPrimary:{ color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});

// ─── Sheet ────────────────────────────────────────────────────────────────────

interface VariationSheetProps {
  template:  WorkoutTemplate | null;
  userLevel: Level;
  visible:   boolean;
  onClose:   () => void;
  onStart:   (variationId: string, exerciseIds: string[]) => void;
}

export function VariationSheet({ template, userLevel, visible, onClose, onStart }: VariationSheetProps) {
  if (!template) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"       // built-in slide — bulletproof on Android
      onRequestClose={onClose}
    >
      <View style={sheet.overlay}>

        {/* absoluteFillObject: fills screen without consuming flex space */}
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        {/* Container: fixed height so ScrollView has room to expand */}
        <View style={sheet.container}>
          <View style={sheet.handle} />

          {/* Header */}
          <View style={sheet.header}>
            <View style={sheet.headerLeft}>
              <Text style={sheet.emoji}>{template.emoji}</Text>
              <View>
                <Text style={sheet.title}>{template.name}</Text>
                <Text style={sheet.subtitle}>Choose your level to start</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={sheet.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Scrollable variation cards */}
          <ScrollView
            style={sheet.scroll}
            contentContainerStyle={sheet.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
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
        </View>
      </View>
    </Modal>
  );
}

const sheet = StyleSheet.create({
  // Full-screen wrapper with dark overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  // Fixed height: doesn't depend on flex — ScrollView always has room
  container: {
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: Colors.background,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 16,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji:      { fontSize: 28 },
  title:      { color: Colors.textPrimary, fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  subtitle:   { color: Colors.textMuted,   fontSize: FontSize.caption },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },

  // flex:1 fills the remaining container height after the header
  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.screenPadding, paddingBottom: 32 },
});
