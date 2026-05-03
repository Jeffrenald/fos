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

const TYPE_ACCENT: Record<string, string> = {
  push:  '#00C9A7',
  pull:  '#5A78FF',
  legs:  '#F0B040',
  core:  '#FF7A85',
  upper: '#6FA8FF',
  full:  '#3FCC93',
};

interface Props {
  template: WorkoutTemplate;
  onPress:  () => void;
  width?:   number;
}

export function WorkoutTemplateCard({ template, onPress, width = 160 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 50 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 25, bounciness: 8 }).start();
  }

  const times   = template.variations.map(v => v.estimatedMin);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const focus   = template.variations[1]?.focus ?? template.variations[0]?.focus ?? '';
  const accent  = TYPE_ACCENT[template.type] ?? Colors.teal;

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      {/* Outer glow ring — accent color bleeds around the card */}
      <Animated.View style={[
        s.glowRing,
        {
          width,
          borderColor: `${accent}35`,
          shadowColor: accent,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.55,
          shadowRadius: 14,
          elevation: 6,
          transform: [{ scale }],
        },
      ]}>
        <View style={s.card}>

          {/* Accent bar — thicker, glows downward */}
          <View style={[s.accentBar, { backgroundColor: accent }]}>
            {/* Glow bleed below the bar */}
            <View style={[s.accentGlow, { backgroundColor: accent }]} />
          </View>

          <Text style={s.emoji}>{template.emoji}</Text>
          <Text style={s.name} numberOfLines={1}>{template.name}</Text>
          <Text style={s.focus} numberOfLines={2}>{focus}</Text>

          {/* Level pills */}
          <View style={s.levelRow}>
            {template.variations.map(v => (
              <View key={v.id} style={[s.levelPill, {
                backgroundColor: LEVEL_COLORS[v.level] + '20',
                borderColor:     LEVEL_COLORS[v.level] + '55',
                // iOS pill glow
                shadowColor: LEVEL_COLORS[v.level],
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
              }]}>
                <View style={[s.levelDot, { backgroundColor: LEVEL_COLORS[v.level] }]} />
                <Text style={[s.levelText, { color: LEVEL_COLORS[v.level] }]}>
                  {v.level.slice(0, 3)}
                </Text>
              </View>
            ))}
          </View>

          <Text style={s.time}>{minTime}–{maxTime} min</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  glowRing: {
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: '#1E1E22',
    borderRadius: 19,
    overflow: 'hidden',
    paddingBottom: 14,
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  // Soft glow below the accent bar — fades into card
  accentGlow: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    height: 8,
    opacity: 0.25,
  },

  emoji: { fontSize: 34, textAlign: 'center', marginTop: 14, marginBottom: 8 },
  name: {
    color: '#FFFFFF',
    fontSize: FontSize.body,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  focus: {
    color: '#888',
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
    borderWidth: 0.5,
  },
  levelDot:  { width: 5, height: 5, borderRadius: 3 },
  levelText: { fontSize: 9, fontFamily: 'Inter_500Medium' },
  time: {
    color: '#555',
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
});
