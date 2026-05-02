import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Pressable, ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { WorkoutTemplate, WorkoutVariation, Level } from '@/constants/exercises';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// ─── Elevation palette ────────────────────────────────────────────────────────
const E = {
  sheet:   '#1C1C1E',
  card:    '#252528',
  cardRec: '#0d2b26',   // recommended card: dark teal tint — clearly stands out
  line:    '#333338',
  lineRec: 'rgba(0,201,167,0.3)',
};

// ─── Level colors ─────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<Level, { bg: string; text: string; dot: string }> = {
  beginner:     { bg: 'rgba(63,204,147,0.15)',  text: '#3FCC93', dot: '#3FCC93' },
  intermediate: { bg: 'rgba(0,201,167,0.15)',   text: '#00C9A7', dot: '#00C9A7' },
  advanced:     { bg: 'rgba(255,122,133,0.15)', text: '#FF7A85', dot: '#FF7A85' },
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
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  dot:  { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', textTransform: 'capitalize' },
});

// ─── Variation card ───────────────────────────────────────────────────────────

function VariationCard({
  variation, onStart, recommended,
}: {
  variation: WorkoutVariation;
  onStart:   () => void;
  recommended: boolean;
}) {
  return (
    <TouchableOpacity
      style={[card.wrap, recommended ? card.wrapRec : card.wrapDefault]}
      onPress={onStart}
      activeOpacity={0.85}
    >
      {/* Recommended banner */}
      {recommended && (
        <View style={card.recBanner}>
          <Ionicons name="star" size={11} color={Colors.teal} />
          <Text style={card.recBannerText}>Recommended for your level</Text>
        </View>
      )}

      {/* Top row */}
      <View style={card.topRow}>
        <LevelBadge level={variation.level} />
        <View style={card.timeWrap}>
          <Ionicons name="time-outline" size={13} color="#888" />
          <Text style={card.time}>{variation.estimatedMin} min</Text>
        </View>
      </View>

      {/* Name + desc */}
      <Text style={[card.label, recommended && card.labelRec]}>{variation.label}</Text>
      <Text style={card.description}>{variation.description}</Text>

      {/* Focus */}
      <View style={card.focusRow}>
        <Ionicons name="body-outline" size={13} color="#666" />
        <Text style={card.focus}>{variation.focus}</Text>
      </View>

      {/* Exercise pills */}
      <View style={card.exRow}>
        {variation.exerciseIds.slice(0, 4).map(id => (
          <View key={id} style={[card.exPill, recommended && card.exPillRec]}>
            <Text style={[card.exPillText, recommended && card.exPillTextRec]}>
              {id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </View>
        ))}
        {variation.exerciseIds.length > 4 && (
          <View style={[card.exPill, recommended && card.exPillRec]}>
            <Text style={[card.exPillText, recommended && card.exPillTextRec]}>
              +{variation.exerciseIds.length - 4} more
            </Text>
          </View>
        )}
      </View>

      {/* CTA */}
      <View style={[card.cta, recommended ? card.ctaRec : card.ctaDefault]}>
        <Text style={[card.ctaText, recommended ? card.ctaTextRec : card.ctaTextDefault]}>
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
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  wrapDefault: {
    backgroundColor: E.card,
    borderColor: E.line,
  },
  wrapRec: {
    backgroundColor: E.cardRec,
    borderColor: E.lineRec,
  },

  recBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,201,167,0.12)',
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0,201,167,0.25)',
  },
  recBannerText: { color: Colors.teal, fontSize: 11, fontFamily: 'Inter_500Medium' },

  topRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  timeWrap:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  time:    { color: '#888', fontSize: FontSize.caption },

  label:    { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  labelRec: { color: '#FFFFFF' },
  description: { color: '#AAAAAA', fontSize: FontSize.bodySm, marginBottom: 10, lineHeight: 18 },

  focusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  focus:    { color: '#666', fontSize: FontSize.caption },

  exRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  exPill:       { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  exPillRec:    { backgroundColor: 'rgba(0,201,167,0.1)' },
  exPillText:   { color: '#777', fontSize: 10 },
  exPillTextRec:{ color: Colors.teal, fontSize: 10 },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 12, paddingVertical: 13,
  },
  ctaDefault: { borderWidth: 1, borderColor: 'rgba(0,201,167,0.4)', backgroundColor: 'rgba(0,201,167,0.06)' },
  ctaRec:     { backgroundColor: Colors.teal },
  ctaText:    { fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  ctaTextDefault: { color: Colors.teal },
  ctaTextRec:     { color: Colors.background },
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
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={sheet.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

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
              <Ionicons name="close" size={18} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Cards */}
          <ScrollView
            style={sheet.scroll}
            contentContainerStyle={sheet.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: E.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: E.line,
  },
  handle: {
    width: 36, height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: E.line,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji:    { fontSize: 28 },
  title:    { color: '#FFFFFF', fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  subtitle: { color: '#888',   fontSize: FontSize.caption, marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#2A2A2E',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.screenPadding, paddingBottom: 32 },
});
