import { View, ScrollView, StyleSheet, ViewStyle, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/Colors';

interface ScreenWrapperProps {
  children:        React.ReactNode;
  scrollable?:     boolean;
  style?:          ViewStyle;
  noPadding?:      boolean;
  refreshControl?: React.ReactElement<React.ComponentProps<typeof RefreshControl>>;
}

export function ScreenWrapper({ children, scrollable, style, noPadding, refreshControl }: ScreenWrapperProps) {
  const insets  = useSafeAreaInsets();
  const padding = noPadding ? 0 : Spacing.screenPadding;

  if (scrollable) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingHorizontal: padding },
          style,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingHorizontal: padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
});
