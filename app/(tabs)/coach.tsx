import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { i18n } from '@/lib/i18n';

// Phase 2 — Week 5: Kouraj AI Chat screen
export default function CoachScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{i18n.t('coach.title')}</Text>
      <Text style={styles.sub}>Kouraj AI Coach — Phase 2 (Week 5)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  heading:   { color: Colors.teal, fontSize: 24, fontWeight: '500', marginBottom: 8 },
  sub:       { color: Colors.textMuted, fontSize: 14 },
});
