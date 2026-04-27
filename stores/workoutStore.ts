import { create } from 'zustand';

export interface ExerciseSet {
  setNumber: number;
  weight_kg: number | null;
  reps:      number | null;
  completed: boolean;
}

export interface ActiveExercise {
  name:            string;
  musclesPrimary:  string[];
  musclesSecondary: string[];
  sets:            ExerciseSet[];
  restSeconds:     number;
  notes:           string;
}

export interface WorkoutSession {
  sessionId:       string;
  planId:          string | null;
  dayName:         string;
  startedAt:       Date;
  exercises:       ActiveExercise[];
  currentIndex:    number;
  isResting:       boolean;
  restSecondsLeft: number;
}

interface WorkoutStore {
  session:          WorkoutSession | null;
  startSession:     (session: Omit<WorkoutSession, 'startedAt' | 'isResting' | 'restSecondsLeft' | 'currentIndex'>) => void;
  completeSet:      (exerciseIndex: number, setIndex: number, weight_kg: number, reps: number) => void;
  nextExercise:     () => void;
  startRest:        (seconds: number) => void;
  tickRest:         () => void;
  endSession:       () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  session: null,

  startSession: (data) => set({
    session: {
      ...data,
      startedAt:       new Date(),
      currentIndex:    0,
      isResting:       false,
      restSecondsLeft: 0,
    },
  }),

  completeSet: (exerciseIndex, setIndex, weight_kg, reps) => {
    const session = get().session;
    if (!session) return;
    const exercises = [...session.exercises];
    exercises[exerciseIndex].sets[setIndex] = {
      ...exercises[exerciseIndex].sets[setIndex],
      weight_kg,
      reps,
      completed: true,
    };
    set({ session: { ...session, exercises } });
  },

  nextExercise: () => {
    const session = get().session;
    if (!session) return;
    set({ session: { ...session, currentIndex: session.currentIndex + 1, isResting: false } });
  },

  startRest: (seconds) => {
    const session = get().session;
    if (!session) return;
    set({ session: { ...session, isResting: true, restSecondsLeft: seconds } });
  },

  tickRest: () => {
    const session = get().session;
    if (!session) return;
    const left = session.restSecondsLeft - 1;
    set({ session: { ...session, restSecondsLeft: left, isResting: left > 0 } });
  },

  endSession: () => set({ session: null }),
}));
