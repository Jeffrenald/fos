export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core' | 'glutes' | 'calves';
export type WorkoutType = 'push' | 'pull' | 'legs' | 'upper' | 'core' | 'full';
export type Equipment   = 'gym' | 'home' | 'dumbbells' | 'none';

export interface Exercise {
  id:               string;
  name:             string;
  type:             WorkoutType;
  musclesPrimary:   MuscleGroup[];
  musclesSecondary: MuscleGroup[];
  defaultSets:      number;
  defaultReps:      string;
  defaultRest:      number;
  equipment:        Equipment[];
  instructions_en:  string;
  advantages:       string[];
  avoid:            string[];
}

export const EXERCISES: Exercise[] = [
  // ── PUSH ───────────────────────────────────────────────────────────────────
  {
    id: 'bench-press', name: 'Bench Press', type: 'push',
    musclesPrimary: ['chest'], musclesSecondary: ['triceps', 'shoulders'],
    defaultSets: 4, defaultReps: '8', defaultRest: 90, equipment: ['gym'],
    instructions_en: 'Lie flat on bench. Lower bar to chest with control (3s down), press up explosively.',
    advantages: ['Best overall chest mass builder', 'Builds raw pushing power and upper body strength', 'Recruits triceps and front delts as strong secondary movers'],
    avoid: ['Bouncing bar off chest — kills tension and risks injury', 'Flaring elbows past 90° — stresses the shoulder joint', 'Lifting hips off the bench to help the lift'],
  },
  {
    id: 'incline-db-press', name: 'Incline DB Press', type: 'push',
    musclesPrimary: ['chest'], musclesSecondary: ['shoulders', 'triceps'],
    defaultSets: 3, defaultReps: '10', defaultRest: 75, equipment: ['gym', 'dumbbells'],
    instructions_en: 'Set bench to 30-45°. Press dumbbells up and slightly inward at top.',
    advantages: ['Targets upper chest for a fuller, rounder look', 'Dumbbells allow natural wrist rotation reducing joint stress', 'Greater range of motion than barbell version'],
    avoid: ['Setting bench above 45° — shifts work to shoulders', 'Letting elbows drop too far below the bench', 'Pressing straight up instead of converging inward at top'],
  },
  {
    id: 'cable-fly', name: 'Cable Fly', type: 'push',
    musclesPrimary: ['chest'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60, equipment: ['gym'],
    instructions_en: 'Keep slight bend in elbows. Bring cables together in hugging motion, squeeze chest.',
    advantages: ['Constant tension through the full arc of motion', 'Deep chest stretch at the bottom of each rep', 'Isolates chest without significant tricep involvement'],
    avoid: ['Using too much weight — it becomes a press and loses isolation', 'Fully straightening the arms — stresses the elbow joint', 'Leaning too far forward and losing the chest focus'],
  },
  {
    id: 'shoulder-press', name: 'Shoulder Press', type: 'push',
    musclesPrimary: ['shoulders'], musclesSecondary: ['triceps'],
    defaultSets: 4, defaultReps: '10', defaultRest: 75, equipment: ['gym', 'dumbbells'],
    instructions_en: 'Press dumbbells overhead from ear level. Don\'t lock elbows at top.',
    advantages: ['Builds shoulder width and overall roundness', 'Requires core stability under load', 'Carries over to all pressing movements'],
    avoid: ['Pressing behind the neck — high shoulder injury risk', 'Shrugging your shoulders as you press up', 'Excessive lower back arch — brace your core'],
  },
  {
    id: 'lateral-raises', name: 'Lateral Raises', type: 'push',
    musclesPrimary: ['shoulders'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '15', defaultRest: 45, equipment: ['gym', 'dumbbells'],
    instructions_en: 'Raise arms to shoulder height with slight forward tilt. Lead with elbows.',
    advantages: ['Best exercise for side delt width', 'Difficult to overtrain — handles high rep ranges well', 'Improves shoulder stability in all pressing lifts'],
    avoid: ['Swinging your body to get the weight up', 'Raising above shoulder height — diminishing returns', 'Bending the wrist — lead with the elbow, not the hand'],
  },
  {
    id: 'tricep-pushdown', name: 'Tricep Pushdown', type: 'push',
    musclesPrimary: ['triceps'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60, equipment: ['gym'],
    instructions_en: 'Keep elbows pinned at sides. Push rope or bar down, fully extend at bottom.',
    advantages: ['Direct tricep isolation with minimal setup', 'Very low injury risk — beginner friendly', 'Easy to progress with incremental weight changes'],
    avoid: ['Flaring elbows out to your sides during the movement', 'Leaning forward excessively to use body weight', 'Partial reps — full extension at the bottom is essential'],
  },
  {
    id: 'dips', name: 'Dips', type: 'push',
    musclesPrimary: ['triceps', 'chest'], musclesSecondary: ['shoulders'],
    defaultSets: 3, defaultReps: '10', defaultRest: 75, equipment: ['gym', 'home'],
    instructions_en: 'Lean forward slightly for chest, upright for triceps. Lower until 90°.',
    advantages: ['Compound push movement hitting chest and triceps together', 'Builds real-world pushing strength', 'Scalable with assisted machine or added weight belt'],
    avoid: ['Shrugging your shoulders at the top position', 'Not going deep enough — aim for 90° elbow angle minimum', 'Flaring elbows too wide when targeting triceps'],
  },
  {
    id: 'push-up', name: 'Push-Up', type: 'push',
    musclesPrimary: ['chest'], musclesSecondary: ['triceps', 'shoulders'],
    defaultSets: 3, defaultReps: '15', defaultRest: 60, equipment: ['home', 'none'],
    instructions_en: 'Keep body straight. Lower chest to floor, push back up. Don\'t flare elbows.',
    advantages: ['Zero equipment needed — train anywhere', 'Builds chest, shoulders, and triceps simultaneously', 'Improves core stability under a horizontal load'],
    avoid: ['Letting hips sag (banana back) or pike upward', 'Flaring elbows wide — keep them at 45° from body', 'Partial reps — chest should nearly touch the floor'],
  },

  // ── PULL ───────────────────────────────────────────────────────────────────
  {
    id: 'pull-up', name: 'Pull-Up', type: 'pull',
    musclesPrimary: ['back'], musclesSecondary: ['biceps'],
    defaultSets: 4, defaultReps: '8', defaultRest: 90, equipment: ['gym', 'home'],
    instructions_en: 'Dead hang start. Pull chest to bar, drive elbows down and back. Full extension.',
    advantages: ['The single best exercise for back width and lat development', 'Builds grip strength and relative body strength', 'Functional pulling pattern used in real life'],
    avoid: ['Kipping or using momentum — reduces actual muscle work', 'Not reaching full arm extension at the bottom', 'Pulling with biceps instead of initiating with your lats'],
  },
  {
    id: 'barbell-row', name: 'Barbell Row', type: 'pull',
    musclesPrimary: ['back'], musclesSecondary: ['biceps', 'shoulders'],
    defaultSets: 4, defaultReps: '8', defaultRest: 90, equipment: ['gym'],
    instructions_en: 'Hinge at hips 45°. Pull bar to lower chest, squeeze shoulder blades together.',
    advantages: ['Best overall back thickness builder', 'Improves posture and spinal health under load', 'Hits entire back including lower traps and rhomboids'],
    avoid: ['Rounding the lower back — keep a neutral spine', 'Jerking the weight up with momentum and body swing', 'Pulling to the stomach instead of the lower chest'],
  },
  {
    id: 'cable-row', name: 'Cable Row', type: 'pull',
    musclesPrimary: ['back'], musclesSecondary: ['biceps'],
    defaultSets: 3, defaultReps: '12', defaultRest: 60, equipment: ['gym'],
    instructions_en: 'Sit tall. Pull handle to navel, lead with elbows. Pause and squeeze at end.',
    advantages: ['Constant cable tension through the full range of motion', 'Easy to control form and isolate the mid-back', 'Excellent for building the mind-muscle connection in the lats'],
    avoid: ['Rounding the back at the end of the pulling phase', 'Using body momentum to row the weight', 'Not fully extending arms at the start — you lose the stretch'],
  },
  {
    id: 'face-pull', name: 'Face Pull', type: 'pull',
    musclesPrimary: ['shoulders', 'back'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '15', defaultRest: 45, equipment: ['gym'],
    instructions_en: 'Rope at face height. Pull to forehead, elbows high and flared. External rotate.',
    advantages: ['Directly fixes rounded shoulders and forward head posture', 'Targets rear delts which most programs neglect', 'Prevents long-term shoulder injury from heavy pressing'],
    avoid: ['Setting the cable too low — changes the muscle emphasis', 'Not externally rotating at the end of the pull', 'Using heavy weight — this is a corrective exercise, keep it light'],
  },
  {
    id: 'bicep-curl', name: 'Bicep Curl', type: 'pull',
    musclesPrimary: ['biceps'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60, equipment: ['gym', 'dumbbells'],
    instructions_en: 'Pin elbows at sides. Curl weight up, squeeze at top. Slow on the way down.',
    advantages: ['Direct bicep peak contraction and isolation', 'Simple movement pattern easy to learn and progress', 'Eccentric (lowering) phase builds significant size'],
    avoid: ['Swinging elbows forward to cheat the curl up', 'Dropping the weight fast on the way down — control it', 'Partial range of motion — full supination at top is key'],
  },
  {
    id: 'hammer-curl', name: 'Hammer Curl', type: 'pull',
    musclesPrimary: ['biceps'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60, equipment: ['gym', 'dumbbells'],
    instructions_en: 'Neutral grip (thumbs up). Curl with forearms, don\'t swing. Hits brachialis.',
    advantages: ['Builds the brachialis which pushes the bicep up and adds thickness', 'Easier on the wrists than supinated curls', 'Strengthens the forearm and improves grip endurance'],
    avoid: ['Swinging your body weight to complete reps', 'Allowing elbows to drift forward during the movement', 'Gripping too wide — keep a neutral thumbs-up grip'],
  },
  {
    id: 'lat-pulldown', name: 'Lat Pulldown', type: 'pull',
    musclesPrimary: ['back'], musclesSecondary: ['biceps'],
    defaultSets: 3, defaultReps: '12', defaultRest: 75, equipment: ['gym'],
    instructions_en: 'Wide grip. Pull bar to upper chest, lead with elbows. Slight back lean OK.',
    advantages: ['Ideal pull-up substitute for those building toward bodyweight rows', 'Easy to adjust weight for beginners and advanced trainees', 'Great for lat isolation and width development'],
    avoid: ['Pulling behind the neck — serious cervical spine stress risk', 'Leaning back excessively — it becomes a row, not a pulldown', 'Not squeezing the lats at the bottom of each rep'],
  },

  // ── LEGS ───────────────────────────────────────────────────────────────────
  {
    id: 'squat', name: 'Squat', type: 'legs',
    musclesPrimary: ['legs', 'glutes'], musclesSecondary: ['core'],
    defaultSets: 4, defaultReps: '8', defaultRest: 120, equipment: ['gym'],
    instructions_en: 'Bar on upper traps. Feet shoulder-width, toes out. Break parallel. Drive up through heels.',
    advantages: ['King of leg exercises — maximum full-body muscle activation', 'Releases anabolic hormones that benefit overall growth', 'Builds functional strength directly used in daily life'],
    avoid: ['Knees caving inward (valgus collapse) — destroys the knee joint', 'Heels rising off the floor — points to ankle mobility issue', 'Rounding the lower back at the bottom of the squat'],
  },
  {
    id: 'romanian-deadlift', name: 'Romanian Deadlift', type: 'legs',
    musclesPrimary: ['legs', 'glutes'], musclesSecondary: ['back'],
    defaultSets: 4, defaultReps: '10', defaultRest: 90, equipment: ['gym', 'dumbbells'],
    instructions_en: 'Hinge at hips, soft knee bend. Bar stays close to legs. Feel hamstring stretch. Drive hips forward.',
    advantages: ['The best hamstring and glute developer in existence', 'Teaches the hip hinge pattern critical for all pulling lifts', 'Strengthens the lower back with less spinal compression than deadlift'],
    avoid: ['Rounding the lower back — neutral spine throughout', 'Bending the knees too much — it becomes a conventional deadlift', 'Letting the bar drift away from your legs during the descent'],
  },
  {
    id: 'leg-press', name: 'Leg Press', type: 'legs',
    musclesPrimary: ['legs', 'glutes'], musclesSecondary: [],
    defaultSets: 4, defaultReps: '12', defaultRest: 90, equipment: ['gym'],
    instructions_en: 'Feet shoulder-width on platform. Lower until 90°, don\'t let lower back round.',
    advantages: ['High-volume leg training without spinal loading', 'Easy to progressively overload and track strength gains', 'Great for quad isolation with foot position adjustments'],
    avoid: ['Locking out your knees fully at the top — joint stress', 'Letting your lower back round off the pad at the bottom', 'Feet too high on platform — shifts to glutes over quads'],
  },
  {
    id: 'lunges', name: 'Lunges', type: 'legs',
    musclesPrimary: ['legs', 'glutes'], musclesSecondary: ['core'],
    defaultSets: 3, defaultReps: '12 each', defaultRest: 60, equipment: ['gym', 'dumbbells', 'home', 'none'],
    instructions_en: 'Step forward, lower back knee to floor. Keep front shin vertical. Push back up.',
    advantages: ['Trains each leg independently — corrects muscle imbalances', 'Challenges balance and coordination simultaneously', 'Highly effective for glute and quad development'],
    avoid: ['Front knee driving past your toes on the step', 'Leaning the torso forward — keep it upright', 'Pushing off with the front foot — drive from the rear leg'],
  },
  {
    id: 'leg-curl', name: 'Leg Curl', type: 'legs',
    musclesPrimary: ['legs'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60, equipment: ['gym'],
    instructions_en: 'Curl heel to glutes. Pause at top, lower slowly (3s). Avoid hip lifting.',
    advantages: ['Complete hamstring isolation — impossible to cheat', 'Reduces injury risk in athletes who squat and sprint', 'Easy to learn and control for all levels'],
    avoid: ['Raising your hips off the pad to complete the rep', 'Moving too fast — you lose the eccentric muscle tension', 'Not fully extending the legs at the start of each rep'],
  },
  {
    id: 'calf-raise', name: 'Calf Raise', type: 'legs',
    musclesPrimary: ['calves'], musclesSecondary: [],
    defaultSets: 4, defaultReps: '15', defaultRest: 45, equipment: ['gym', 'home', 'none'],
    instructions_en: 'Full range — bottom stretch, top squeeze. Slow and controlled both ways.',
    advantages: ['Essential for complete lower leg development', 'Improves ankle stability and reduces shin splint risk', 'Can be trained with no equipment — calf raise off a step'],
    avoid: ['Bouncing at the bottom — you eliminate the deep calf stretch', 'Partial range of motion — calves respond to full stretch', 'Rushing through reps — use a 2-second up, 2-second down tempo'],
  },
  {
    id: 'goblet-squat', name: 'Goblet Squat', type: 'legs',
    musclesPrimary: ['legs', 'glutes'], musclesSecondary: ['core'],
    defaultSets: 3, defaultReps: '12', defaultRest: 75, equipment: ['gym', 'dumbbells'],
    instructions_en: 'Hold dumbbell at chest. Squat deep, elbows inside knees at bottom.',
    advantages: ['Perfect squat pattern teacher for beginners', 'Weight at chest counterbalances and naturally aids depth', 'Forces an upright torso for ideal quad activation'],
    avoid: ['Letting elbows touch knees — your stance is too wide', 'Chest dropping at the bottom of the squat', 'Heel rise — this signals an ankle mobility limitation'],
  },

  // ── CORE ───────────────────────────────────────────────────────────────────
  {
    id: 'plank', name: 'Plank', type: 'core',
    musclesPrimary: ['core'], musclesSecondary: ['shoulders'],
    defaultSets: 3, defaultReps: '45s', defaultRest: 45, equipment: ['gym', 'home', 'none'],
    instructions_en: 'Elbows under shoulders. Squeeze abs and glutes. Flat back, don\'t let hips sag.',
    advantages: ['Builds deep core stability that protects the spine', 'Very low injury risk — safe for all fitness levels', 'Improves posture and bracing in every other lift'],
    avoid: ['Holding your breath — breathe steadily throughout', 'Hips too high (pike) or too low (hip sag)', 'Dropping your head down — keep a neutral neck position'],
  },
  {
    id: 'dead-bug', name: 'Dead Bug', type: 'core',
    musclesPrimary: ['core'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '10 each', defaultRest: 45, equipment: ['gym', 'home', 'none'],
    instructions_en: 'Flat lower back to floor. Extend opposite arm and leg slowly. Breathe out as you extend.',
    advantages: ['Safest core exercise available — zero lower back stress', 'Teaches anti-rotation and spinal bracing under movement', 'Excellent for rehabilitation and injury prevention'],
    avoid: ['Letting your lower back arch away from the floor', 'Moving your arms and legs too fast — control is everything', 'Holding your breath — exhale as you extend the limbs'],
  },
  {
    id: 'russian-twist', name: 'Russian Twist', type: 'core',
    musclesPrimary: ['core'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '20', defaultRest: 45, equipment: ['gym', 'home', 'none'],
    instructions_en: 'Lean back 45°, feet up. Rotate torso side to side. Hold weight for more challenge.',
    advantages: ['Best oblique isolation for a defined, functional waist', 'Improves rotational power in athletic movements', 'Easily scaled with bodyweight or a plate/medicine ball'],
    avoid: ['Rounding your spine — a flat back is non-negotiable', 'Only rotating your arms — the movement must come from the torso', 'Keeping feet flat on the floor — raise them for full engagement'],
  },
  {
    id: 'hanging-knee-raise', name: 'Hanging Knee Raise', type: 'core',
    musclesPrimary: ['core'], musclesSecondary: [],
    defaultSets: 3, defaultReps: '12', defaultRest: 60, equipment: ['gym', 'home'],
    instructions_en: 'Dead hang. Pull knees to chest using abs, not hip flexors. Control the descent.',
    advantages: ['Intense lower ab activation from a hanging position', 'Builds grip and forearm strength simultaneously', 'Progresses naturally to straight-leg raises'],
    avoid: ['Swinging the body to use momentum', 'Pulling with hip flexors instead of initiating from the abs', 'Dropping the legs without controlling the descent'],
  },
  {
    id: 'ab-wheel', name: 'Ab Wheel Rollout', type: 'core',
    musclesPrimary: ['core'], musclesSecondary: ['shoulders', 'back'],
    defaultSets: 3, defaultReps: '10', defaultRest: 60, equipment: ['gym'],
    instructions_en: 'Knees on floor. Roll out until body is parallel, use abs to pull back. Don\'t let hips sag.',
    advantages: ['Most challenging and effective core strength builder', 'Builds the entire anterior chain simultaneously', 'Progresses from kneeling to full toe rollouts as you advance'],
    avoid: ['Letting hips sag at full extension — immediate lower back injury risk', 'Rolling out beyond your current core control ability', 'Pulling with your arms on the way back instead of your core'],
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
