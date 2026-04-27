import { useMemo } from 'react';
import { useNutritionStore, FoodEntry } from '@/stores/nutritionStore';

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function useNutritionLog(date?: Date) {
  const dateStr = toDateString(date ?? new Date());
  const { getDay, addEntry, removeEntry, addWater, removeWater } = useNutritionStore();
  const day = getDay(dateStr);

  const totals = useMemo(() => {
    return day.entries.reduce(
      (acc, e: FoodEntry) => ({
        calories:  acc.calories  + e.calories,
        protein_g: acc.protein_g + e.protein_g,
        carbs_g:   acc.carbs_g   + e.carbs_g,
        fat_g:     acc.fat_g     + e.fat_g,
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
    );
  }, [day.entries]);

  return {
    day,
    totals,
    dateStr,
    addEntry:    (meal: Parameters<typeof addEntry>[1], entry: Parameters<typeof addEntry>[2]) => addEntry(dateStr, meal, entry),
    removeEntry: (id: string) => removeEntry(dateStr, id),
    addWater:    () => addWater(dateStr),
    removeWater: () => removeWater(dateStr),
  };
}
