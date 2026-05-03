import { TEMPLATES, WorkoutVariation } from '@/constants/exercises';
import type { Level } from '@/constants/exercises';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlannedDay {
  dayIndex:    number;   // 0 = Monday … 6 = Sunday
  isRest:      boolean;
  workout?: {
    templateKey:  string;
    variationId:  string;
    name:         string;
    emoji:        string;
    exerciseIds:  string[];
    estimatedMin: number;
    focus:        string;
  };
  userOverride: boolean; // true if user manually changed this day
}

export interface WeekPlan {
  frequency: number;   // 3-7
  level:     Level;
  days:      PlannedDay[];
  createdAt: string;
}

// ─── Day labels ───────────────────────────────────────────────────────────────

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_FULL   = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ─── Balanced rotations by frequency ─────────────────────────────────────────
// Each entry is [dayIndex, templateKey] — rest days are the gaps

const ROTATIONS: Record<number, [number, string][]> = {
  3: [
    [0, 'push'],   // Mon — Push
    [2, 'pull'],   // Wed — Pull
    [4, 'legs'],   // Fri — Legs
  ],
  4: [
    [0, 'push'],   // Mon — Push
    [1, 'legs'],   // Tue — Legs
    [3, 'pull'],   // Thu — Pull
    [4, 'upper'],  // Fri — Upper
  ],
  5: [
    [0, 'push'],   // Mon — Push
    [1, 'pull'],   // Tue — Pull
    [2, 'legs'],   // Wed — Legs
    [3, 'upper'],  // Thu — Upper
    [4, 'core'],   // Fri — Core
  ],
  6: [
    [0, 'push'],   // Mon — Push
    [1, 'pull'],   // Tue — Pull
    [2, 'legs'],   // Wed — Legs
    [3, 'upper'],  // Thu — Upper
    [4, 'core'],   // Fri — Core
    [5, 'full'],   // Sat — Full Body
  ],
  7: [
    [0, 'push'],   // Mon — Push
    [1, 'pull'],   // Tue — Pull
    [2, 'legs'],   // Wed — Legs
    [3, 'upper'],  // Thu — Upper
    [4, 'core'],   // Fri — Core
    [5, 'full'],   // Sat — Full Body
    [6, 'core'],   // Sun — Active Recovery
  ],
};

// ─── Recommendation copy ──────────────────────────────────────────────────────

export const FREQUENCY_META: Record<number, { label: string; rec: string; warning?: string }> = {
  3: { label: '3× per week', rec: 'Mon · Wed · Fri — perfect recovery between sessions' },
  4: { label: '4× per week', rec: 'Mon · Tue · Thu · Fri — 2 on, 1 off, 2 on' },
  5: { label: '5× per week', rec: 'Mon–Fri — weekend fully free for recovery' },
  6: { label: '6× per week', rec: 'Mon–Sat with Sunday off', warning: 'Leave at least 1 rest day for muscle repair' },
  7: { label: '7× per week', rec: 'Training every day', warning: 'High risk of overtraining — include light days' },
};

// ─── Generator ────────────────────────────────────────────────────────────────

export function generateWeekPlan(frequency: number, level: Level): WeekPlan {
  const rotation = ROTATIONS[frequency] ?? ROTATIONS[3];
  const workoutDays = new Set(rotation.map(([d]) => d));

  const days: PlannedDay[] = Array.from({ length: 7 }, (_, i) => {
    const slot = rotation.find(([d]) => d === i);

    if (!slot || !workoutDays.has(i)) {
      return { dayIndex: i, isRest: true, userOverride: false };
    }

    const [, templateKey] = slot;
    const template = TEMPLATES.find(t => t.key === templateKey);
    if (!template) return { dayIndex: i, isRest: true, userOverride: false };

    const variation: WorkoutVariation =
      template.variations.find(v => v.level === level) ??
      template.variations[1] ??
      template.variations[0];

    return {
      dayIndex: i,
      isRest:   false,
      userOverride: false,
      workout: {
        templateKey,
        variationId:  variation.id,
        name:         template.name,
        emoji:        template.emoji,
        exerciseIds:  variation.exerciseIds,
        estimatedMin: variation.estimatedMin,
        focus:        variation.focus,
      },
    };
  });

  return { frequency, level, days, createdAt: new Date().toISOString() };
}

// ─── Today's day index (0=Mon … 6=Sun) ───────────────────────────────────────

export function todayDayIndex(): number {
  const d = new Date().getDay(); // 0=Sun JS
  return d === 0 ? 6 : d - 1;   // shift to Mon=0
}
