import { create } from 'zustand';

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
  logs:      Record<string, DayLog>;
  addEntry:  (date: string, meal: MealType, entry: Omit<FoodEntry, 'id'>) => void;
  removeEntry: (date: string, entryId: string) => void;
  addWater:  (date: string) => void;
  removeWater: (date: string) => void;
  getDay:    (date: string) => DayLog;
}

function makeDayLog(date: string): DayLog {
  return { date, entries: [], waterCups: 0 };
}

export const useNutritionStore = create<NutritionStore>((set, get) => ({
  logs: {},

  addEntry: (date, meal, entry) => {
    const logs = { ...get().logs };
    if (!logs[date]) logs[date] = makeDayLog(date);
    logs[date] = {
      ...logs[date],
      entries: [
        ...logs[date].entries,
        { ...entry, meal_type: meal, id: `${Date.now()}-${Math.random()}` },
      ],
    };
    set({ logs });
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
}));
