import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Ellipse, Rect, Path, Circle, G } from 'react-native-svg';
import { Colors, Radius } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';

export type MuscleFilter = 'all' | 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';

// Maps muscle filter → exercise types for filtering
export const MUSCLE_TO_TYPE: Record<MuscleFilter, string[]> = {
  all:       ['push', 'pull', 'legs', 'core', 'upper', 'full'],
  chest:     ['push'],
  back:      ['pull'],
  shoulders: ['push'],
  arms:      ['push', 'pull'],
  legs:      ['legs'],
  core:      ['core'],
};

// Maps muscle filter → exercise muscle group names
export const MUSCLE_TO_GROUP: Record<MuscleFilter, string[]> = {
  all:       [],
  chest:     ['chest'],
  back:      ['back'],
  shoulders: ['shoulders'],
  arms:      ['biceps', 'triceps'],
  legs:      ['legs', 'glutes', 'calves'],
  core:      ['core'],
};

const TEAL  = Colors.teal;
const DIM   = '#2A2A2E';
const GLOW  = 'rgba(0,201,167,0.35)';

interface RegionProps {
  active:   boolean;
  onPress:  () => void;
}

// Each muscle region is a tappable SVG group
function Region({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <G onPress={onPress}>
      {children}
    </G>
  );
}

interface MuscleMapProps {
  selected: MuscleFilter;
  onChange: (m: MuscleFilter) => void;
}

export function MuscleMap({ selected, onChange }: MuscleMapProps) {
  const [side, setSide] = useState<'front' | 'back'>('front');

  function tap(m: MuscleFilter) {
    onChange(selected === m ? 'all' : m);
  }

  function c(m: MuscleFilter): string {
    return selected === m ? TEAL : (selected === 'all' ? '#3A3A3E' : '#252528');
  }

  return (
    <View style={s.wrap}>
      {/* Front / Back toggle */}
      <View style={s.sideToggle}>
        {(['front', 'back'] as const).map(sv => (
          <TouchableOpacity
            key={sv}
            style={[s.sideBtn, side === sv && s.sideBtnActive]}
            onPress={() => setSide(sv)}
            activeOpacity={0.8}
          >
            <Text style={[s.sideBtnText, side === sv && s.sideBtnTextActive]}>
              {sv === 'front' ? 'Front' : 'Back'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Body SVG */}
      <View style={s.svgWrap}>
        <Svg width={140} height={220} viewBox="0 0 100 160">

          {/* Head */}
          <Circle cx={50} cy={11} r={9} fill="#2A2A2E" stroke="#333" strokeWidth={0.5} />

          {/* Neck */}
          <Rect x={46} y={19} width={8} height={7} fill="#2A2A2E" />

          {side === 'front' ? (
            <>
              {/* Chest */}
              <Region onPress={() => tap('chest')}>
                <Path
                  d="M 34 26 L 66 26 L 68 50 L 32 50 Z"
                  fill={c('chest')}
                  stroke={selected === 'chest' ? GLOW : '#333'}
                  strokeWidth={selected === 'chest' ? 1.5 : 0.5}
                />
              </Region>

              {/* Left shoulder */}
              <Region onPress={() => tap('shoulders')}>
                <Ellipse cx={26} cy={30} rx={8} ry={7} fill={c('shoulders')} stroke={selected === 'shoulders' ? GLOW : '#333'} strokeWidth={selected === 'shoulders' ? 1.5 : 0.5} />
              </Region>
              {/* Right shoulder */}
              <Region onPress={() => tap('shoulders')}>
                <Ellipse cx={74} cy={30} rx={8} ry={7} fill={c('shoulders')} stroke={selected === 'shoulders' ? GLOW : '#333'} strokeWidth={selected === 'shoulders' ? 1.5 : 0.5} />
              </Region>

              {/* Left arm (bicep) */}
              <Region onPress={() => tap('arms')}>
                <Path d="M 18 37 L 22 37 L 22 62 L 16 62 Z" fill={c('arms')} stroke={selected === 'arms' ? GLOW : '#333'} strokeWidth={selected === 'arms' ? 1.5 : 0.5} />
              </Region>
              {/* Right arm (bicep) */}
              <Region onPress={() => tap('arms')}>
                <Path d="M 78 37 L 82 37 L 84 62 L 78 62 Z" fill={c('arms')} stroke={selected === 'arms' ? GLOW : '#333'} strokeWidth={selected === 'arms' ? 1.5 : 0.5} />
              </Region>

              {/* Left forearm */}
              <Region onPress={() => tap('arms')}>
                <Path d="M 15 62 L 21 62 L 20 82 L 14 82 Z" fill={c('arms')} stroke={selected === 'arms' ? GLOW : '#333'} strokeWidth={selected === 'arms' ? 1.5 : 0.5} />
              </Region>
              {/* Right forearm */}
              <Region onPress={() => tap('arms')}>
                <Path d="M 79 62 L 85 62 L 86 82 L 80 82 Z" fill={c('arms')} stroke={selected === 'arms' ? GLOW : '#333'} strokeWidth={selected === 'arms' ? 1.5 : 0.5} />
              </Region>

              {/* Core/Abs */}
              <Region onPress={() => tap('core')}>
                <Path d="M 33 50 L 67 50 L 65 76 L 35 76 Z" fill={c('core')} stroke={selected === 'core' ? GLOW : '#333'} strokeWidth={selected === 'core' ? 1.5 : 0.5} />
              </Region>

              {/* Hips */}
              <Rect x={32} y={76} width={36} height={8} fill="#222226" rx={2} />

              {/* Left thigh */}
              <Region onPress={() => tap('legs')}>
                <Path d="M 33 84 L 49 84 L 47 120 L 31 120 Z" fill={c('legs')} stroke={selected === 'legs' ? GLOW : '#333'} strokeWidth={selected === 'legs' ? 1.5 : 0.5} />
              </Region>
              {/* Right thigh */}
              <Region onPress={() => tap('legs')}>
                <Path d="M 51 84 L 67 84 L 69 120 L 53 120 Z" fill={c('legs')} stroke={selected === 'legs' ? GLOW : '#333'} strokeWidth={selected === 'legs' ? 1.5 : 0.5} />
              </Region>

              {/* Left calf */}
              <Region onPress={() => tap('legs')}>
                <Path d="M 32 120 L 46 120 L 44 148 L 30 148 Z" fill={c('legs')} stroke={selected === 'legs' ? GLOW : '#333'} strokeWidth={selected === 'legs' ? 1.5 : 0.5} />
              </Region>
              {/* Right calf */}
              <Region onPress={() => tap('legs')}>
                <Path d="M 54 120 L 68 120 L 70 148 L 56 148 Z" fill={c('legs')} stroke={selected === 'legs' ? GLOW : '#333'} strokeWidth={selected === 'legs' ? 1.5 : 0.5} />
              </Region>
            </>
          ) : (
            <>
              {/* Back view */}
              {/* Traps / Upper back */}
              <Region onPress={() => tap('back')}>
                <Path d="M 34 26 L 66 26 L 68 50 L 32 50 Z" fill={c('back')} stroke={selected === 'back' ? GLOW : '#333'} strokeWidth={selected === 'back' ? 1.5 : 0.5} />
              </Region>

              {/* Left shoulder (rear delt) */}
              <Region onPress={() => tap('shoulders')}>
                <Ellipse cx={26} cy={30} rx={8} ry={7} fill={c('shoulders')} stroke={selected === 'shoulders' ? GLOW : '#333'} strokeWidth={selected === 'shoulders' ? 1.5 : 0.5} />
              </Region>
              <Region onPress={() => tap('shoulders')}>
                <Ellipse cx={74} cy={30} rx={8} ry={7} fill={c('shoulders')} stroke={selected === 'shoulders' ? GLOW : '#333'} strokeWidth={selected === 'shoulders' ? 1.5 : 0.5} />
              </Region>

              {/* Left arm (tricep back) */}
              <Region onPress={() => tap('arms')}>
                <Path d="M 18 37 L 22 37 L 22 62 L 16 62 Z" fill={c('arms')} stroke={selected === 'arms' ? GLOW : '#333'} strokeWidth={selected === 'arms' ? 1.5 : 0.5} />
              </Region>
              <Region onPress={() => tap('arms')}>
                <Path d="M 78 37 L 82 37 L 84 62 L 78 62 Z" fill={c('arms')} stroke={selected === 'arms' ? GLOW : '#333'} strokeWidth={selected === 'arms' ? 1.5 : 0.5} />
              </Region>

              {/* Lower back / lats */}
              <Region onPress={() => tap('back')}>
                <Path d="M 33 50 L 67 50 L 65 76 L 35 76 Z" fill={c('back')} stroke={selected === 'back' ? GLOW : '#333'} strokeWidth={selected === 'back' ? 1.5 : 0.5} />
              </Region>

              {/* Glutes */}
              <Region onPress={() => tap('legs')}>
                <Rect x={32} y={76} width={36} height={12} fill={c('legs')} stroke={selected === 'legs' ? GLOW : '#333'} strokeWidth={selected === 'legs' ? 1.5 : 0.5} rx={4} />
              </Region>

              {/* Left hamstring */}
              <Region onPress={() => tap('legs')}>
                <Path d="M 33 88 L 49 88 L 47 120 L 31 120 Z" fill={c('legs')} stroke={selected === 'legs' ? GLOW : '#333'} strokeWidth={selected === 'legs' ? 1.5 : 0.5} />
              </Region>
              <Region onPress={() => tap('legs')}>
                <Path d="M 51 88 L 67 88 L 69 120 L 53 120 Z" fill={c('legs')} stroke={selected === 'legs' ? GLOW : '#333'} strokeWidth={selected === 'legs' ? 1.5 : 0.5} />
              </Region>

              {/* Calves */}
              <Region onPress={() => tap('legs')}>
                <Path d="M 32 120 L 46 120 L 44 148 L 30 148 Z" fill={c('legs')} stroke={selected === 'legs' ? GLOW : '#333'} strokeWidth={selected === 'legs' ? 1.5 : 0.5} />
              </Region>
              <Region onPress={() => tap('legs')}>
                <Path d="M 54 120 L 68 120 L 70 148 L 56 148 Z" fill={c('legs')} stroke={selected === 'legs' ? GLOW : '#333'} strokeWidth={selected === 'legs' ? 1.5 : 0.5} />
              </Region>
            </>
          )}
        </Svg>
      </View>

      {/* Filter label */}
      <Text style={s.selectedLabel}>
        {selected === 'all' ? 'Tap a muscle to filter' : `Showing: ${selected}`}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:      { alignItems: 'center', marginBottom: 4 },
  sideToggle:{ flexDirection: 'row', gap: 6, marginBottom: 10 },
  sideBtn:   { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: '#242428', borderWidth: 0.5, borderColor: '#333' },
  sideBtnActive: { backgroundColor: 'rgba(0,201,167,0.12)', borderColor: 'rgba(0,201,167,0.4)' },
  sideBtnText:   { color: '#666', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  sideBtnTextActive: { color: Colors.teal },
  svgWrap:   { marginBottom: 8 },
  selectedLabel: { color: '#555', fontSize: 10, fontStyle: 'italic' },
});
