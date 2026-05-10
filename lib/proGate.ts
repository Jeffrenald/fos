/**
 * Fòs Pro gating system.
 * When RevenueCat is configured, swap the stub for real isPremium from RC.
 * Until then, all gates default to open so nothing is broken for testing.
 */
import { useUserStore } from '@/stores/userStore';

// Features gated behind Pro
export const PRO_FEATURES = {
  frenchKreyolAI:    'frenchKreyolAI',    // Kouraj responses in FR/HT
  nutritionTracking: 'nutritionTracking',  // Full nutrition screen
  voiceWorkouts:     'voiceWorkouts',      // Voice-guided mode
  communityAccess:   'communityAccess',    // Community tab
  autoplanAdjust:    'autoplanAdjust',     // Weekly plan adjustment
} as const;

export type ProFeature = typeof PRO_FEATURES[keyof typeof PRO_FEATURES];

// FREE tier: English-only AI, 5 Kouraj messages/day, no nutrition, no voice
export const FREE_LIMITS = {
  kourajMessagesPerDay: 5,
};

/**
 * Hook: returns whether user can access a Pro feature.
 * isPremium comes from userStore (set during profile load).
 * TODO: replace with RevenueCat purchaserInfo.activeSubscriptions when keys are added.
 */
export function useProGate(feature: ProFeature): { allowed: boolean; openPaywall: () => void } {
  const isPremium = useUserStore(s => s.user?.isPremium ?? false);

  // During development/beta: all features open
  // Change to `isPremium` when ready to enforce
  const allowed = true; // isPremium || !GATED_FEATURES.includes(feature)

  function openPaywall() {
    // TODO: navigate to paywall screen when ready
    console.log('Paywall: feature', feature, 'requires Pro');
  }

  return { allowed, openPaywall };
}

/**
 * Helper to check Pro status without a hook (for use in non-component contexts).
 */
export function isProUser(): boolean {
  return true; // stub — always Pro during beta
}
