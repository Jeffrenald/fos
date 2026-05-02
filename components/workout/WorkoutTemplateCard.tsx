import { useRef } from 'react';
import { Animated, Pressable, View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import type { WorkoutTemplate } from '@/constants/exercises';

const LEVEL_COLORS = {
  beginner:     '#3FCC93',
  intermediate: '#00C9A7',
  advanced:     '#FF7A85',
};

// Accent color per workout type — subtle tinted top border
const TYPE_ACCENT: Record<string, string> = {
  push:  '#00C9A7',
  pull:  '#5A78FF',
  legs:  '#F0B040',
  core:  '#FF7A85',
  upper: '#6FA8FF',
  full:  '#3FCC93',
};

interface Props {
  template:  WorkoutTemplate;
  onPress:   () => void;
  /** Width of the card — defaults to 160 */
  width?:    number;
}

export function WorkoutTemplateCard({ template, onPress, width = 160 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 50 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 25, bounciness: 8 }).start();
  }

  // Derive display info from variations
  const times     = template.variations.map(v => v.estimatedMin);
  const minTime   = Math.min(...times);
  const maxTime   = Math.max(...times);
  const focus     = template.variations[1]?.focus ?? template.variations[0]?.focus ?? '';
  const accent    = TYPE_ACCENT[template.type] ?? Colors.teal;

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[s.card, { width, transform: [{ scale }] }]}>

        {/* Colored accent bar at top */}
        <View style={[s.accentBar, { backgroundColor: accent }]} />

        {/* Emoji */}
        <Text style={s.emoji}>{template.emoji}</Text>

        {/* Name */}
        <Text style={s.name} numberOfLines={1}>{template.name}</Text>

        {/* Muscle focus */}
        <Text style={s.focus} numberOfLines={2}>{focus}</Text>

        {/* Level pills */}
        <View style={s.levelRow}>
          {template.variations.map(v => (
            <View key={v.id} style={[s.levelPill, { backgroundColor: LEVEL_COLORS[v.level] + '22' }]}>
              <View style={[s.levelDot, { backgroundColor: LEVEL_COLORS[v.level] }]} />
              <Text style={[s.levelText, { color: LEVEL_COLORS[v.level] }]}>
                {v.level.slice(0, 3)}
              </Text>
            </View>
          ))}
        </View>

        {/* Time range */}
        <Text style={s.time}>{minTime}–{maxTime} min</Text>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginRight: 12,
    overflow: 'hidden',
    paddingBottom: 14,
  },
  accentBar: {
    height: 3,
    width: '100%',
    marginBottom: 14,
  },
  emoji:    { fontSize: 34, textAlign: 'center', marginBottom: 8 },
  name: {
    color: Colors.textPrimary,
    fontSize: FontSize.body,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  focus: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 12,
    lineHeight: 14,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  levelDot:  { width: 5, height: 5, borderRadius: 3 },
  levelText: { fontSize: 9, fontFamily: 'Inter_500Medium' },
  time: {
    color: Colors.textDim,
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
});
