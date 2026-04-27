import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { i18n } from '../../lib/i18n';

// Phase 4 — Week 12: Community / Kominote screen
export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{i18n.t('nav.community')}</Text>
      <Text style={styles.sub}>Community Screen — Phase 4 (Week 12)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  heading:   { color: Colors.textPrimary, fontSize: 24, fontWeight: '500', marginBottom: 8 },
  sub:       { color: Colors.textMuted, fontSize: 14 },
});
