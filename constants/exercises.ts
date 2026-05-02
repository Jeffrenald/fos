export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core' | 'glutes' | 'calves';
export type WorkoutType = 'push' | 'pull' | 'legs' | 'upper' | 'core' | 'full';
export type Equipment   = 'gym' | 'home' | 'dumbbells' | 'none';

export interface Exercise {
  id:              string;
  name:            string;
  type:            WorkoutType;
  musclesPrimary:  MuscleGroup[];
  musclesSecondary: MuscleGroup[];
  defaultSets:     number;
  defaultReps:     string;
  defaultRest:     number;
  equipment:       Equipment[];
  instructions_en: string;
}

export const EXERCISES: Exercise[] = [
  // ── PUSH ───────────────────────────────────────────────────────────────────
  {
    id: 'bench-press', name: 'Bench Press', type: 'push',
    musclesPrimary: ['chest'], musclesSecondary: ['triceps', 'shoulders'],
    defaultSets: 4, defaultReps: '8', defaultRest: 90,
    equipment: ['gym'],
    instructions_en: 'Lie flat on bench. Lower bar to chest with control (3s down), press up explosively.',
  },
  {
    id: 'incline-db-press', name: 'Incline DB Press', type: 'push',
    musclesPrimary: ['chest'], musclesSecondary: ['shoulders', 'triceps'],
    defaultSets: 3, defaultReps: '10', defaultRest: 75,
    equipment: ['gym', 'dumbbells'],
    instructions_en: 'Set bench to 30-45°. Press dumbbells up and slightly inward at top.',
  },
  {
    id: 'cable-fly', name: 'Cable Fly', type: 'push',
    musclesPrimary: ['chest'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60,
    equipment: ['gym'],
    instructions_en: 'Keep slight bend in elbows. Bring cables together in hugging motion, squeeze chest.',
  },
  {
    id: 'shoulder-press', name: 'Shoulder Press', type: 'push',
    musclesPrimary: ['shoulders'], musclesSecondary: ['triceps'],
    defaultSets: 4, defaultReps: '10', defaultRest: 75,
    equipment: ['gym', 'dumbbells'],
    instructions_en: 'Press dumbbells overhead from ear level. Don\'t lock elbows at top.',
  },
  {
    id: 'lateral-raises', name: 'Lateral Raises', type: 'push',
    musclesPrimary: ['shoulders'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '15', defaultRest: 45,
    equipment: ['gym', 'dumbbells'],
    instructions_en: 'Raise arms to shoulder height with slight forward tilt. Lead with elbows.',
  },
  {
    id: 'tricep-pushdown', name: 'Tricep Pushdown', type: 'push',
    musclesPrimary: ['triceps'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60,
    equipment: ['gym'],
    instructions_en: 'Keep elbows pinned at sides. Push rope or bar down, fully extend at bottom.',
  },
  {
    id: 'dips', name: 'Dips', type: 'push',
    musclesPrimary: ['triceps', 'chest'], musclesSecondary: ['shoulders'],
    defaultSets: 3, defaultReps: '10', defaultRest: 75,
    equipment: ['gym', 'home'],
    instructions_en: 'Lean forward slightly for chest, upright for triceps. Lower until 90°.',
  },
  {
    id: 'push-up', name: 'Push-Up', type: 'push',
    musclesPrimary: ['chest'], musclesSecondary: ['triceps', 'shoulders'],
    defaultSets: 3, defaultReps: '15', defaultRest: 60,
    equipment: ['home', 'none'],
    instructions_en: 'Keep body straight. Lower chest to floor, push back up. Don\'t flare elbows.',
  },

  // ── PULL ───────────────────────────────────────────────────────────────────
  {
    id: 'pull-up', name: 'Pull-Up', type: 'pull',
    musclesPrimary: ['back'], musclesSecondary: ['biceps'],
    defaultSets: 4, defaultReps: '8', defaultRest: 90,
    equipment: ['gym', 'home'],
    instructions_en: 'Dead hang start. Pull chest to bar, drive elbows down and back. Full extension.',
  },
  {
    id: 'barbell-row', name: 'Barbell Row', type: 'pull',
    musclesPrimary: ['back'], musclesSecondary: ['biceps', 'shoulders'],
    defaultSets: 4, defaultReps: '8', defaultRest: 90,
    equipment: ['gym'],
    instructions_en: 'Hinge at hips 45°. Pull bar to lower chest, squeeze shoulder blades together.',
  },
  {
    id: 'cable-row', name: 'Cable Row', type: 'pull',
    musclesPrimary: ['back'], musclesSecondary: ['biceps'],
    defaultSets: 3, defaultReps: '12', defaultRest: 60,
    equipment: ['gym'],
    instructions_en: 'Sit tall. Pull handle to navel, lead with elbows. Pause and squeeze at end.',
  },
  {
    id: 'face-pull', name: 'Face Pull', type: 'pull',
    musclesPrimary: ['shoulders', 'back'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '15', defaultRest: 45,
    equipment: ['gym'],
    instructions_en: 'Rope at face height. Pull to forehead, elbows high and flared. External rotate.',
  },
  {
    id: 'bicep-curl', name: 'Bicep Curl', type: 'pull',
    musclesPrimary: ['biceps'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60,
    equipment: ['gym', 'dumbbells'],
    instructions_en: 'Pin elbows at sides. Curl weight up, squeeze at top. Slow on the way down.',
  },
  {
    id: 'hammer-curl', name: 'Hammer Curl', type: 'pull',
    musclesPrimary: ['biceps'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60,
    equipment: ['gym', 'dumbbells'],
    instructions_en: 'Neutral grip (thumbs up). Curl with forearms, don\'t swing. Hits brachialis.',
  },
  {
    id: 'lat-pulldown', name: 'Lat Pulldown', type: 'pull',
    musclesPrimary: ['back'], musclesSecondary: ['biceps'],
    defaultSets: 3, defaultReps: '12', defaultRest: 75,
    equipment: ['gym'],
    instructions_en: 'Wide grip. Pull bar to upper chest, lead with elbows. Slight back lean OK.',
  },

  // ── LEGS ───────────────────────────────────────────────────────────────────
  {
    id: 'squat', name: 'Squat', type: 'legs',
    musclesPrimary: ['legs', 'glutes'], musclesSecondary: ['core'],
    defaultSets: 4, defaultReps: '8', defaultRest: 120,
    equipment: ['gym'],
    instructions_en: 'Bar on upper traps. Feet shoulder-width, toes out. Break parallel. Drive up through heels.',
  },
  {
    id: 'romanian-deadlift', name: 'Romanian Deadlift', type: 'legs',
    musclesPrimary: ['legs', 'glutes'], musclesSecondary: ['back'],
    defaultSets: 4, defaultReps: '10', defaultRest: 90,
    equipment: ['gym', 'dumbbells'],
    instructions_en: 'Hinge at hips, soft knee bend. Bar stays close to legs. Feel hamstring stretch. Drive hips forward.',
  },
  {
    id: 'leg-press', name: 'Leg Press', type: 'legs',
    musclesPrimary: ['legs', 'glutes'], musclesSecondary: [],
    defaultSets: 4, defaultReps: '12', defaultRest: 90,
    equipment: ['gym'],
    instructions_en: 'Feet shoulder-width on platform. Lower until 90°, don\'t let lower back round.',
  },
  {
    id: 'lunges', name: 'Lunges', type: 'legs',
    musclesPrimary: ['legs', 'glutes'], musclesSecondary: ['core'],
    defaultSets: 3, defaultReps: '12 each', defaultRest: 60,
    equipment: ['gym', 'dumbbells', 'home', 'none'],
    instructions_en: 'Step forward, lower back knee to floor. Keep front shin vertical. Push back up.',
  },
  {
    id: 'leg-curl', name: 'Leg Curl', type: 'legs',
    musclesPrimary: ['legs'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60,
    equipment: ['gym'],
    instructions_en: 'Curl heel to glutes. Pause at top, lower slowly (3s). Avoid hip lifting.',
  },
  {
    id: 'calf-raise', name: 'Calf Raise', type: 'legs',
    musclesPrimary: ['calves'], musclesSecondary: [],
    defaultSets: 4, defaultReps: '15', defaultRest: 45,
    equipment: ['gym', 'home', 'none'],
    instructions_en: 'Full range — bottom stretch, top squeeze. Slow and controlled both ways.',
  },
  {
    id: 'goblet-squat', name: 'Goblet Squat', type: 'legs',
    musclesPrimary: ['legs', 'glutes'], musclesSecondary: ['core'],
    defaultSets: 3, defaultReps: '12', defaultRest: 75,
    equipment: ['gym', 'dumbbells'],
    instructions_en: 'Hold dumbbell at chest. Squat deep, elbows inside knees at bottom.',
  },

  // ── CORE ───────────────────────────────────────────────────────────────────
  {
    id: 'plank', name: 'Plank', type: 'core',
    musclesPrimary: ['core'], musclesSecondary: ['shoulders'],
    defaultSets: 3, defaultReps: '45s', defaultRest: 45,
    equipment: ['gym', 'home', 'none'],
    instructions_en: 'Elbows under shoulders. Squeeze abs and glutes. Flat back, don\'t let hips sag.',
  },
  {
    id: 'dead-bug', name: 'Dead Bug', type: 'core',
    musclesPrimary: ['core'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '10 each', defaultRest: 45,
    equipment: ['gym', 'home', 'none'],
    instructions_en: 'Flat lower back to floor. Extend opposite arm and leg slowly. Breathe out as you extend.',
  },
  {
    id: 'russian-twist', name: 'Russian Twist', type: 'core',
    musclesPrimary: ['core'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '20', defaultRest: 45,
    equipment: ['gym', 'home', 'none'],
    instructions_en: 'Lean back 45°, feet up. Rotate torso side to side. Hold weight for more challenge.',
  },
  {
    id: 'hanging-knee-raise', name: 'Hanging Knee Raise', type: 'core',
    musclesPrimary: ['core'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60,
    equipment: ['gym', 'home'],
    instructions_en: 'Dead hang. Pull knees to chest using abs, not hip flexors. Control the descent.',
  },
  {
    id: 'ab-wheel', name: 'Ab Wheel Rollout', type: 'core',
    musclesPrimary: ['core'], musclesSecondary: ['shoulders', 'back'],
    defaultSets: 3, defaultReps: '10', defaultRest: 60,
    equipment: ['gym'],
    instructions_en: 'Knees on floor. Roll out until body is parallel, use abs to pull back. Don\'t let hips sag.',
  },
];

// Quick-access maps
export const EXERCISES_BY_TYPE: Record<WorkoutType, Exercise[]> = {
  push: EXERCISES.filter(e => e.type === 'push'),
  pull: EXERCISES.filter(e => e.type === 'pull'),
  legs: EXERCISES.filter(e => e.type === 'legs'),
  core: EXERCISES.filter(e => e.type === 'core'),
  upper: EXERCISES.filter(e => ['push', 'pull'].includes(e.type)),
  full:  EXERCISES,
};

export const WORKOUT_TEMPLATES: Record<string, { name: string; type: WorkoutType; emoji: string; exerciseIds: string[] }> = {
  push: {
    name: 'Push Day',    type: 'push', emoji: '💪',
    exerciseIds: ['bench-press', 'incline-db-press', 'cable-fly', 'shoulder-press', 'lateral-raises', 'tricep-pushdown'],
  },
  pull: {
    name: 'Pull Day',    type: 'pull', emoji: '🔗',
    exerciseIds: ['pull-up', 'barbell-row', 'cable-row', 'face-pull', 'bicep-curl', 'hammer-curl'],
  },
  legs: {
    name: 'Leg Day',     type: 'legs', emoji: '🦵',
    exerciseIds: ['squat', 'romanian-deadlift', 'leg-press', 'lunges', 'leg-curl', 'calf-raise'],
  },
  upper: {
    name: 'Upper Body',  type: 'upper', emoji: '🏋️',
    exerciseIds: ['bench-press', 'barbell-row', 'shoulder-press', 'pull-up', 'bicep-curl', 'tricep-pushdown'],
  },
  core: {
    name: 'Core',        type: 'core', emoji: '🔥',
    exerciseIds: ['plank', 'dead-bug', 'russian-twist', 'hanging-knee-raise', 'ab-wheel'],
  },
  full: {
    name: 'Full Body',   type: 'full', emoji: '⚡',
    exerciseIds: ['squat', 'bench-press', 'barbell-row', 'shoulder-press', 'lunges', 'plank'],
  },
};

// ─── Workout Variations ───────────────────────────────────────────────────────

export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface WorkoutVariation {
  id:          string;
  level:       Level;
  label:       string;
  description: string;
  exerciseIds: string[];
  estimatedMin: number;
  focus:       string;
}

export interface WorkoutTemplate {
  key:        string;
  name:       string;
  emoji:      string;
  type:       WorkoutType;
  variations: WorkoutVariation[];
}

export const TEMPLATES: WorkoutTemplate[] = [
  {
    key: 'push', name: 'Push Day', emoji: '💪', type: 'push',
    variations: [
      {
        id: 'push-beginner', level: 'beginner', label: 'Beginner',
        description: 'Bodyweight & dumbbells, lighter load',
        focus: 'Chest · Shoulders · Triceps',
        estimatedMin: 30,
        exerciseIds: ['push-up', 'shoulder-press', 'lateral-raises', 'tricep-pushdown'],
      },
      {
        id: 'push-intermediate', level: 'intermediate', label: 'Intermediate',
        description: 'Full gym, standard volume',
        focus: 'Chest · Shoulders · Triceps',
        estimatedMin: 45,
        exerciseIds: ['bench-press', 'incline-db-press', 'shoulder-press', 'lateral-raises', 'tricep-pushdown'],
      },
      {
        id: 'push-advanced', level: 'advanced', label: 'Advanced',
        description: 'High volume, heavy compound lifts',
        focus: 'Chest · Shoulders · Triceps',
        estimatedMin: 60,
        exerciseIds: ['bench-press', 'incline-db-press', 'cable-fly', 'shoulder-press', 'lateral-raises', 'tricep-pushdown', 'dips'],
      },
    ],
  },
  {
    key: 'pull', name: 'Pull Day', emoji: '🔗', type: 'pull',
    variations: [
      {
        id: 'pull-beginner', level: 'beginner', label: 'Beginner',
        description: 'Machine-assisted, isolation focus',
        focus: 'Back · Biceps',
        estimatedMin: 30,
        exerciseIds: ['lat-pulldown', 'cable-row', 'bicep-curl', 'hammer-curl'],
      },
      {
        id: 'pull-intermediate', level: 'intermediate', label: 'Intermediate',
        description: 'Mix of compound and isolation',
        focus: 'Back · Biceps · Rear Delts',
        estimatedMin: 45,
        exerciseIds: ['pull-up', 'barbell-row', 'cable-row', 'face-pull', 'bicep-curl'],
      },
      {
        id: 'pull-advanced', level: 'advanced', label: 'Advanced',
        description: 'High volume, full back development',
        focus: 'Back · Biceps · Rear Delts',
        estimatedMin: 60,
        exerciseIds: ['pull-up', 'barbell-row', 'cable-row', 'lat-pulldown', 'face-pull', 'bicep-curl', 'hammer-curl'],
      },
    ],
  },
  {
    key: 'legs', name: 'Leg Day', emoji: '🦵', type: 'legs',
    variations: [
      {
        id: 'legs-beginner', level: 'beginner', label: 'Beginner',
        description: 'Bodyweight & goblet squat',
        focus: 'Quads · Glutes · Calves',
        estimatedMin: 30,
        exerciseIds: ['goblet-squat', 'lunges', 'calf-raise'],
      },
      {
        id: 'legs-intermediate', level: 'intermediate', label: 'Intermediate',
        description: 'Barbell squat, moderate volume',
        focus: 'Quads · Hamstrings · Glutes',
        estimatedMin: 50,
        exerciseIds: ['squat', 'romanian-deadlift', 'leg-press', 'lunges', 'calf-raise'],
      },
      {
        id: 'legs-advanced', level: 'advanced', label: 'Advanced',
        description: 'Full leg destruction, high volume',
        focus: 'Quads · Hamstrings · Glutes · Calves',
        estimatedMin: 65,
        exerciseIds: ['squat', 'romanian-deadlift', 'leg-press', 'lunges', 'leg-curl', 'calf-raise'],
      },
    ],
  },
  {
    key: 'upper', name: 'Upper Body', emoji: '🏋️', type: 'upper',
    variations: [
      {
        id: 'upper-beginner', level: 'beginner', label: 'Beginner',
        description: 'Push + pull basics',
        focus: 'Chest · Back · Shoulders · Arms',
        estimatedMin: 35,
        exerciseIds: ['push-up', 'lat-pulldown', 'shoulder-press', 'bicep-curl'],
      },
      {
        id: 'upper-intermediate', level: 'intermediate', label: 'Intermediate',
        description: 'Balanced push/pull split',
        focus: 'Chest · Back · Shoulders · Arms',
        estimatedMin: 50,
        exerciseIds: ['bench-press', 'barbell-row', 'shoulder-press', 'bicep-curl', 'tricep-pushdown'],
      },
      {
        id: 'upper-advanced', level: 'advanced', label: 'Advanced',
        description: 'Full upper body volume',
        focus: 'Chest · Back · Shoulders · Arms',
        estimatedMin: 65,
        exerciseIds: ['bench-press', 'barbell-row', 'incline-db-press', 'pull-up', 'shoulder-press', 'bicep-curl', 'tricep-pushdown'],
      },
    ],
  },
  {
    key: 'core', name: 'Core', emoji: '🔥', type: 'core',
    variations: [
      {
        id: 'core-beginner', level: 'beginner', label: 'Beginner',
        description: 'Foundation movements',
        focus: 'Abs · Obliques',
        estimatedMin: 20,
        exerciseIds: ['plank', 'dead-bug', 'russian-twist'],
      },
      {
        id: 'core-intermediate', level: 'intermediate', label: 'Intermediate',
        description: 'Add hanging movements',
        focus: 'Abs · Obliques · Hip Flexors',
        estimatedMin: 28,
        exerciseIds: ['plank', 'dead-bug', 'russian-twist', 'hanging-knee-raise'],
      },
      {
        id: 'core-advanced', level: 'advanced', label: 'Advanced',
        description: 'Maximum core challenge',
        focus: 'Full Core',
        estimatedMin: 35,
        exerciseIds: ['plank', 'dead-bug', 'russian-twist', 'hanging-knee-raise', 'ab-wheel'],
      },
    ],
  },
  {
    key: 'full', name: 'Full Body', emoji: '⚡', type: 'full',
    variations: [
      {
        id: 'full-beginner', level: 'beginner', label: 'Beginner',
        description: 'Simple full body circuit',
        focus: 'Full Body',
        estimatedMin: 35,
        exerciseIds: ['goblet-squat', 'push-up', 'lat-pulldown', 'lunges', 'plank'],
      },
      {
        id: 'full-intermediate', level: 'intermediate', label: 'Intermediate',
        description: 'Compound-heavy full body',
        focus: 'Full Body',
        estimatedMin: 55,
        exerciseIds: ['squat', 'bench-press', 'barbell-row', 'shoulder-press', 'lunges', 'plank'],
      },
      {
        id: 'full-advanced', level: 'advanced', label: 'Advanced',
        description: 'High intensity, max volume',
        focus: 'Full Body',
        estimatedMin: 70,
        exerciseIds: ['squat', 'bench-press', 'barbell-row', 'romanian-deadlift', 'shoulder-press', 'pull-up', 'plank'],
      },
    ],
  },
];
