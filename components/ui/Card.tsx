import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?:   StyleProp<ViewStyle>;
  raised?:  boolean;
}

export function Card({ children, style, raised }: CardProps) {
  return (
    <View style={[styles.card, raised && styles.raised, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius:    18,
    borderWidth:     0.5,
    borderColor:     Colors.border,
    padding:         Spacing.cardPadding,
  },
  raised: {
    backgroundColor: Colors.surfaceRaised,
  },
});
