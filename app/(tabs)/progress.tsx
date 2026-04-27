import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { i18n } from '@/lib/i18n';

// Phase 1 — Week 4: Progress / Progrè screen
export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{i18n.t('nav.progress')}</Text>
      <Text style={styles.sub}>Progress Screen — Week 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  heading:   { color: Colors.textPrimary, fontSize: 24, fontWeight: '500', marginBottom: 8 },
  sub:       { color: Colors.textMuted, fontSize: 14 },
});
