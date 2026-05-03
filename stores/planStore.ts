import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateWeekPlan, WeekPlan, PlannedDay } from '@/lib/planGenerator';
import type { Level } from '@/constants/exercises';
import { TEMPLATES } from '@/constants/exercises';

interface PlanStore {
  plan:              WeekPlan | null;
  setPlan:           (plan: WeekPlan) => void;
  generatePlan:      (frequency: number, level: Level) => void;
  overrideDay:       (dayIndex: number, makeRest: boolean) => void;
  addExerciseToDay:  (dayIndex: number, exerciseId: string) => void;
  removeExerciseFromDay: (dayIndex: number, exerciseId: string) => void;
  clearPlan:         () => void;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      plan: null,

      setPlan: (plan) => set({ plan }),

      generatePlan: (frequency, level) => {
        const existing = get().plan;
        const newPlan  = generateWeekPlan(frequency, level);

        // Preserve days the user manually overrode
        if (existing) {
          newPlan.days = newPlan.days.map(day => {
            const prev = existing.days.find(d => d.dayIndex === day.dayIndex);
            if (prev?.userOverride) return prev;
            return day;
          });
        }

        set({ plan: newPlan });
      },

      overrideDay: (dayIndex, makeRest) => {
        const plan = get().plan;
        if (!plan) return;

        const days = plan.days.map(d => {
          if (d.dayIndex !== dayIndex) return d;

          if (makeRest) {
            return { dayIndex, isRest: true, userOverride: true };
          }

          // Restore workout from original plan (find the template that normally goes here)
          const restored = generateWeekPlan(plan.frequency, plan.level).days
            .find(g => g.dayIndex === dayIndex);

          // If the original was also rest, find the nearest workout template
          const fallback = restored?.isRest
            ? buildFallbackWorkout(dayIndex, plan.level)
            : restored;

          return { ...(fallback ?? d), userOverride: true };
        });

        set({ plan: { ...plan, days } });
      },

      addExerciseToDay: (dayIndex, exerciseId) => {
        const plan = get().plan;
        if (!plan) return;
        const days = plan.days.map(d => {
          if (d.dayIndex !== dayIndex || d.isRest || !d.workout) return d;
          if (d.workout.exerciseIds.includes(exerciseId)) return d;
          return {
            ...d,
            userOverride: true,
            workout: { ...d.workout, exerciseIds: [...d.workout.exerciseIds, exerciseId] },
          };
        });
        set({ plan: { ...plan, days } });
      },

      removeExerciseFromDay: (dayIndex, exerciseId) => {
        const plan = get().plan;
        if (!plan) return;
        const days = plan.days.map(d => {
          if (d.dayIndex !== dayIndex || d.isRest || !d.workout) return d;
          return {
            ...d,
            userOverride: true,
            workout: { ...d.workout, exerciseIds: d.workout.exerciseIds.filter(id => id !== exerciseId) },
          };
        });
        set({ plan: { ...plan, days } });
      },

      clearPlan: () => set({ plan: null }),
    }),
    {
      name:    'fos-plan',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// When a rest day is overridden to workout, assign a reasonable template
function buildFallbackWorkout(dayIndex: number, level: Level): PlannedDay {
  // Cycle through templates by day index
  const order   = ['push', 'pull', 'legs', 'upper', 'core', 'full'];
  const key     = order[dayIndex % order.length];
  const template= TEMPLATES.find(t => t.key === key) ?? TEMPLATES[0];
  const variation = template.variations.find(v => v.level === level) ?? template.variations[1];

  return {
    dayIndex,
    isRest: false,
    userOverride: true,
    workout: {
      templateKey:  template.key,
      variationId:  variation.id,
      name:         template.name,
      emoji:        template.emoji,
      exerciseIds:  variation.exerciseIds,
      estimatedMin: variation.estimatedMin,
      focus:        variation.focus,
    },
  };
}
