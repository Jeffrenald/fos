import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { i18n } from '@/lib/i18n';

// Phase 1 — Week 3: Active workout session screen
export default function WorkoutSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{i18n.t('workout.title')}</Text>
      <Text style={styles.sub}>Session: {sessionId}</Text>
      <Text style={styles.sub}>Workout Session — Week 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  heading:   { color: Colors.textPrimary, fontSize: 24, fontWeight: '500', marginBottom: 8 },
  sub:       { color: Colors.textMuted, fontSize: 14, marginTop: 4 },
});
