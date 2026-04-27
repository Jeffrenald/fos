import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Radius } from '../../constants/colors';
import { FontSize } from '../../constants/fonts';

type Variant = 'primary' | 'ghost' | 'danger';

interface ButtonProps {
  label:     string;
  onPress:   () => void;
  variant?:  Variant;
  loading?:  boolean;
  disabled?: boolean;
  style?:    ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? Colors.background : Colors.teal} />
        : <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles] as TextStyle]}>
            {label}
          </Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius:  14,
    paddingVertical: 16,
    alignItems:    'center',
    justifyContent: 'center',
    width:         '100%',
  },
  primary: { backgroundColor: Colors.teal },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  danger: { backgroundColor: Colors.danger },
  disabled: { opacity: 0.5 },

  label:        { fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },
  primaryLabel: { color: Colors.background },
  ghostLabel:   { color: Colors.teal },
  dangerLabel:  { color: Colors.textPrimary },
});
