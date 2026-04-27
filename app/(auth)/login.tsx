import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

// Phase 1 — Week 1: Supabase auth login screen
export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login — Coming in Week 1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  text:      { color: Colors.textPrimary, fontSize: 16 },
});
