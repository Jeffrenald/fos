import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Radius } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';

interface InputProps extends TextInputProps {
  label?: string;
}

export function Input({ label, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={Colors.textDim}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { gap: 6 },
  label: { color: Colors.textSecondary, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth:     0.5,
    borderColor:     Colors.border,
    borderRadius:    Radius.md,
    paddingHorizontal: 16,
    paddingVertical:   14,
    color:           Colors.textPrimary,
    fontSize:        FontSize.body,
    fontFamily:      'Inter_400Regular',
  },
});
