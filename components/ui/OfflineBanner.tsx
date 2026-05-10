import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/lib/network';
import { FontSize } from '@/constants/fonts';

export function OfflineBanner() {
  const isOnline = useNetworkStatus();
  if (isOnline) return null;

  return (
    <View style={s.banner}>
      <Ionicons name="cloud-offline-outline" size={14} color="#F0B040" />
      <Text style={s.text}>You're offline — some features unavailable</Text>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(240,176,64,0.12)',
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(240,176,64,0.3)',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  text: { color: '#F0B040', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', flex: 1 },
});
