import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const LAST_CHECK_KEY = 'fos-plan-adjustment-check';

export interface AdjustmentSuggestion {
  type:    'reduce' | 'increase' | 'maintain';
  message: string;
  newFreq: number | null;
}

export async function checkWeeklyAdjustment(
  userId: string,
  currentFreq: number,
  language: string,
): Promise<AdjustmentSuggestion | null> {
  // Only run once per week
  const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
  if (lastCheck) {
    const daysSince = (Date.now() - parseInt(lastCheck)) / 86400000;
    if (daysSince < 6) return null;
  }

  // Count sessions completed last week
  const weekAgo   = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeekAgo= new Date(); twoWeekAgo.setDate(twoWeekAgo.getDate() - 14);

  const { count } = await supabase
    .from('workout_sessions')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .gte('started_at', twoWeekAgo.toISOString())
    .lte('started_at', weekAgo.toISOString())
    .not('completed_at', 'is', null);

  const completed = count ?? 0;
  const missed    = currentFreq - completed;

  await AsyncStorage.setItem(LAST_CHECK_KEY, String(Date.now()));

  const copy: Record<string, { crush: string; missed: string; good: string }> = {
    en: {
      crush:  `You crushed all ${currentFreq} sessions last week! Want to level up to ${currentFreq + 1} days?`,
      missed: `You completed ${completed}/${currentFreq} sessions last week. Want to ease to ${Math.max(currentFreq - 1, 3)} days so it's more manageable?`,
      good:   `${completed}/${currentFreq} sessions last week — solid consistency, frè m! Keep the plan as is.`,
    },
    fr: {
      crush:  `Bravo! Toutes les ${currentFreq} séances complétées. Passer à ${currentFreq + 1} jours?`,
      missed: `${completed}/${currentFreq} séances la semaine passée. Réduire à ${Math.max(currentFreq - 1, 3)} jours?`,
      good:   `${completed}/${currentFreq} séances — belle régularité! Continuer comme ça.`,
    },
    ht: {
      crush:  `Ou kraze ${currentFreq} sesyon semèn pase! Ou vle monte a ${currentFreq + 1} jou?`,
      missed: `${completed}/${currentFreq} sesyon semèn pase. Vle redui a ${Math.max(currentFreq - 1, 3)} jou?`,
      good:   `${completed}/${currentFreq} sesyon — konsistans solid, frè m! Kenbe plan an.`,
    },
  };

  const t = copy[language] ?? copy.en;

  if (completed >= currentFreq && currentFreq < 6) {
    return { type: 'increase', message: t.crush, newFreq: currentFreq + 1 };
  }
  if (missed >= 3 && currentFreq > 3) {
    return { type: 'reduce', message: t.missed, newFreq: Math.max(currentFreq - 1, 3) };
  }
  return { type: 'maintain', message: t.good, newFreq: null };
}
