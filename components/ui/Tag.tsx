import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../constants/colors';
import { FontSize } from '../../constants/fonts';

type TagVariant = 'teal' | 'haitian' | 'muted';

interface TagProps {
  label:    string;
  variant?: TagVariant;
  style?:   ViewStyle;
}

export function Tag({ label, variant = 'teal', style }: TagProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles] as any]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      Radius.full,
    alignSelf:         'flex-start',
  },
  teal:     { backgroundColor: Colors.tealDim },
  haitian:  { backgroundColor: 'rgba(206,17,38,0.14)' },
  muted:    { backgroundColor: Colors.surfaceRaised },

  text:         { fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  tealText:     { color: Colors.teal },
  haitianText:  { color: Colors.danger },
  mutedText:    { color: Colors.textMuted },
});
