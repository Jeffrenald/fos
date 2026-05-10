import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id:         string;
  food_name:  string;
  food_id:    string;
  isHaitian:  boolean;
  calories:   number;
  protein_g:  number;
  carbs_g:    number;
  fat_g:      number;
  meal_type:  MealType;
}

export interface DayLog {
  date:      string;
  entries:   FoodEntry[];
  waterCups: number;
}

interface NutritionStore {
  logs:         Record<string, DayLog>;
  addEntry:     (date: string, meal: MealType, entry: Omit<FoodEntry, 'id'>, userId?: string) => void;
  removeEntry:  (date: string, entryId: string) => void;
  addWater:     (date: string) => void;
  removeWater:  (date: string) => void;
  getDay:       (date: string) => DayLog;
  pruneOldLogs: () => void;
}

function makeDayLog(date: string): DayLog {
  return { date, entries: [], waterCups: 0 };
}

export const useNutritionStore = create<NutritionStore>()(
  persist(
    (set, get) => ({
      logs: {},

      addEntry: (date, meal, entry, userId) => {
        const id   = `${Date.now()}-${Math.random()}`;
        const full = { ...entry, meal_type: meal, id };

        // Update local state immediately (optimistic)
        const logs = { ...get().logs };
        if (!logs[date]) logs[date] = makeDayLog(date);
        logs[date] = { ...logs[date], entries: [...logs[date].entries, full] };
        set({ logs });

        // Sync to Supabase in background
        if (userId) {
          supabase.from('nutrition_logs').insert({
            user_id:    userId,
            logged_date: date,
            meal_type:  meal,
            food_name:  entry.food_name,
            food_id:    entry.food_id,
            is_haitian: entry.isHaitian,
            calories:   entry.calories,
            protein_g:  entry.protein_g,
            carbs_g:    entry.carbs_g,
            fat_g:      entry.fat_g,
          }).then(() => {});
        }
      },

      removeEntry: (date, entryId) => {
        const logs = { ...get().logs };
        if (!logs[date]) return;
        logs[date] = { ...logs[date], entries: logs[date].entries.filter(e => e.id !== entryId) };
        set({ logs });
      },

      addWater: (date) => {
        const logs = { ...get().logs };
        if (!logs[date]) logs[date] = makeDayLog(date);
        logs[date] = { ...logs[date], waterCups: Math.min(8, logs[date].waterCups + 1) };
        set({ logs });
      },

      removeWater: (date) => {
        const logs = { ...get().logs };
        if (!logs[date]) return;
        logs[date] = { ...logs[date], waterCups: Math.max(0, logs[date].waterCups - 1) };
        set({ logs });
      },

      getDay: (date) => get().logs[date] ?? makeDayLog(date),

      pruneOldLogs: () => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        const logs = Object.fromEntries(
          Object.entries(get().logs).filter(([date]) => date >= cutoffStr)
        );
        set({ logs });
      },
    }),
    {
      name:    'fos-nutrition',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
