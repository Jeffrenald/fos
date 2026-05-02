import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, G, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import type { WorkoutType } from '@/constants/exercises';

// ─── Types ───────────────────────────────────────────────────────────────────

type Point = { x: number; y: number };

type Pose = {
  head:      Point;
  neck:      Point;
  lShoulder: Point; rShoulder: Point;
  lElbow:    Point; rElbow:    Point;
  lHand:     Point; rHand:     Point;
  hips:      Point;
  lKnee:     Point; rKnee:     Point;
  lFoot:     Point; rFoot:     Point;
};

// ─── Colors ──────────────────────────────────────────────────────────────────

const C = {
  skin:       '#F5C09A',  // warm skin
  skinDark:   '#D4956A',  // back-limb skin (depth)
  shirt:      '#00C9A7',  // brand teal — front torso / arms
  shirtDark:  '#009d83',  // back arm
  shorts:     '#1E3A5F',  // dark navy shorts
  shortsDark: '#142840',  // back leg
  shoe:       '#2A2A2A',  // dark shoes
  hair:       '#1A1A1A',  // hair
  outline:    'none',
};

// ─── Pose library ────────────────────────────────────────────────────────────

const STANDING: Pose = {
  head:      { x: 50, y: 13 },
  neck:      { x: 50, y: 24 },
  lShoulder: { x: 36, y: 32 }, rShoulder: { x: 64, y: 32 },
  lElbow:    { x: 27, y: 54 }, rElbow:    { x: 73, y: 54 },
  lHand:     { x: 23, y: 73 }, rHand:     { x: 77, y: 73 },
  hips:      { x: 50, y: 70 },
  lKnee:     { x: 38, y: 100 }, rKnee:   { x: 62, y: 100 },
  lFoot:     { x: 34, y: 130 }, rFoot:   { x: 66, y: 130 },
};

const SQUAT_DOWN: Pose = {
  head:      { x: 50, y: 36 },
  neck:      { x: 50, y: 47 },
  lShoulder: { x: 37, y: 56 }, rShoulder: { x: 63, y: 56 },
  lElbow:    { x: 30, y: 74 }, rElbow:    { x: 70, y: 74 },
  lHand:     { x: 30, y: 92 }, rHand:     { x: 70, y: 92 },
  hips:      { x: 50, y: 93 },
  lKnee:     { x: 30, y: 118 }, rKnee:   { x: 70, y: 118 },
  lFoot:     { x: 28, y: 143 }, rFoot:   { x: 72, y: 143 },
};

const ARMS_EXTENDED_UP: Pose = {
  head:      { x: 50, y: 28 },
  neck:      { x: 50, y: 39 },
  lShoulder: { x: 36, y: 47 }, rShoulder: { x: 64, y: 47 },
  lElbow:    { x: 24, y: 24 }, rElbow:    { x: 76, y: 24 },
  lHand:     { x: 18, y: 8  }, rHand:     { x: 82, y: 8  },
  hips:      { x: 50, y: 85 },
  lKnee:     { x: 38, y: 114 }, rKnee:   { x: 62, y: 114 },
  lFoot:     { x: 34, y: 143 }, rFoot:   { x: 66, y: 143 },
};

const PULL_TOP: Pose = {
  head:      { x: 50, y: 18 },
  neck:      { x: 50, y: 29 },
  lShoulder: { x: 36, y: 37 }, rShoulder: { x: 64, y: 37 },
  lElbow:    { x: 22, y: 22 }, rElbow:    { x: 78, y: 22 },
  lHand:     { x: 18, y: 8  }, rHand:     { x: 82, y: 8  },
  hips:      { x: 50, y: 75 },
  lKnee:     { x: 40, y: 103 }, rKnee:   { x: 60, y: 103 },
  lFoot:     { x: 40, y: 128 }, rFoot:   { x: 60, y: 128 },
};

const PUSH_EXTENDED: Pose = {
  head:      { x: 50, y: 13 },
  neck:      { x: 50, y: 24 },
  lShoulder: { x: 36, y: 32 }, rShoulder: { x: 64, y: 32 },
  lElbow:    { x: 16, y: 32 }, rElbow:    { x: 84, y: 32 },
  lHand:     { x: 6,  y: 32 }, rHand:     { x: 94, y: 32 },
  hips:      { x: 50, y: 70 },
  lKnee:     { x: 38, y: 100 }, rKnee:   { x: 62, y: 100 },
  lFoot:     { x: 34, y: 130 }, rFoot:   { x: 66, y: 130 },
};

const PUSH_CONTRACTED: Pose = {
  head:      { x: 50, y: 13 },
  neck:      { x: 50, y: 24 },
  lShoulder: { x: 36, y: 32 }, rShoulder: { x: 64, y: 32 },
  lElbow:    { x: 30, y: 50 }, rElbow:    { x: 70, y: 50 },
  lHand:     { x: 36, y: 54 }, rHand:     { x: 64, y: 54 },
  hips:      { x: 50, y: 70 },
  lKnee:     { x: 38, y: 100 }, rKnee:   { x: 62, y: 100 },
  lFoot:     { x: 34, y: 130 }, rFoot:   { x: 66, y: 130 },
};

const PLANK_A: Pose = {
  head:      { x: 16, y: 52 },
  neck:      { x: 26, y: 57 },
  lShoulder: { x: 35, y: 61 }, rShoulder: { x: 35, y: 53 },
  lElbow:    { x: 18, y: 68 }, rElbow:    { x: 18, y: 60 },
  lHand:     { x: 10, y: 74 }, rHand:     { x: 10, y: 66 },
  hips:      { x: 62, y: 62 },
  lKnee:     { x: 77, y: 70 }, rKnee:    { x: 77, y: 60 },
  lFoot:     { x: 90, y: 77 }, rFoot:    { x: 90, y: 66 },
};

const PLANK_B: Pose = {
  ...PLANK_A,
  head:  { x: 16, y: 50 },
  hips:  { x: 62, y: 60 },
  lFoot: { x: 90, y: 75 }, rFoot: { x: 90, y: 64 },
};

// ─── Pose map ─────────────────────────────────────────────────────────────────

const EXERCISE_POSES: Record<WorkoutType, [Pose, Pose]> = {
  push:  [PUSH_CONTRACTED,    PUSH_EXTENDED      ],
  pull:  [ARMS_EXTENDED_UP,   PULL_TOP           ],
  legs:  [STANDING,           SQUAT_DOWN         ],
  core:  [PLANK_A,            PLANK_B            ],
  upper: [PUSH_CONTRACTED,    PUSH_EXTENDED      ],
  full:  [STANDING,           SQUAT_DOWN         ],
};

// ─── Maths ───────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeInOut(t: number) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t) * t; }

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return Object.fromEntries(
    (Object.keys(a) as (keyof Pose)[]).map(k => [k, {
      x: lerp(a[k].x, b[k].x, t),
      y: lerp(a[k].y, b[k].y, t),
    }])
  ) as Pose;
}

// ─── Limb (pill shape between two points) ────────────────────────────────────

function Limb({ p1, p2, w, fill }: { p1: Point; p2: Point; w: number; fill: string }) {
  const dx  = p2.x - p1.x;
  const dy  = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ang = Math.atan2(dy, dx) * (180 / Math.PI);
  const cx  = (p1.x + p2.x) / 2;
  const cy  = (p1.y + p2.y) / 2;

  return (
    <Rect
      x={cx - len / 2}
      y={cy - w / 2}
      width={len}
      height={w}
      rx={w / 2}
      fill={fill}
      transform={`rotate(${ang}, ${cx}, ${cy})`}
    />
  );
}

// ─── Human Figure ─────────────────────────────────────────────────────────────

function HumanFigure({ pose }: { pose: Pose }) {
  return (
    <>
      {/* ── Back layer (left side = further away) ── */}
      <Limb p1={pose.lShoulder} p2={pose.lElbow}    w={6} fill={C.shirtDark} />
      <Limb p1={pose.lElbow}    p2={pose.lHand}     w={5} fill={C.skinDark}  />
      <Limb p1={pose.hips}      p2={pose.lKnee}     w={9} fill={C.shortsDark}/>
      <Limb p1={pose.lKnee}     p2={pose.lFoot}     w={7} fill={C.skinDark}  />
      {/* Back foot */}
      <Ellipse cx={pose.lFoot.x} cy={pose.lFoot.y + 2} rx={7} ry={3} fill={C.shoe} />

      {/* ── Torso ── */}
      <Limb p1={pose.neck} p2={pose.hips} w={20} fill={C.shirt} />

      {/* ── Front layer (right side = closer) ── */}
      <Limb p1={pose.rShoulder} p2={pose.rElbow}    w={6} fill={C.shirt}   />
      <Limb p1={pose.rElbow}    p2={pose.rHand}     w={5} fill={C.skin}    />
      <Limb p1={pose.hips}      p2={pose.rKnee}     w={9} fill={C.shorts}  />
      <Limb p1={pose.rKnee}     p2={pose.rFoot}     w={7} fill={C.skin}    />
      {/* Front foot */}
      <Ellipse cx={pose.rFoot.x} cy={pose.rFoot.y + 2} rx={7} ry={3} fill={C.shoe} />

      {/* ── Joints (add articulation) ── */}
      <Circle cx={pose.lElbow.x} cy={pose.lElbow.y} r={4} fill={C.shirtDark} />
      <Circle cx={pose.lKnee.x}  cy={pose.lKnee.y}  r={5} fill={C.skinDark}  />
      <Circle cx={pose.rElbow.x} cy={pose.rElbow.y} r={4} fill={C.shirt}     />
      <Circle cx={pose.rKnee.x}  cy={pose.rKnee.y}  r={5} fill={C.skin}      />
      <Circle cx={pose.hips.x}   cy={pose.hips.y}   r={7} fill={C.shorts}    />

      {/* ── Shoulder dots ── */}
      <Circle cx={pose.lShoulder.x} cy={pose.lShoulder.y} r={5} fill={C.shirtDark} />
      <Circle cx={pose.rShoulder.x} cy={pose.rShoulder.y} r={5} fill={C.shirt}     />

      {/* ── Hands ── */}
      <Circle cx={pose.lHand.x} cy={pose.lHand.y} r={4} fill={C.skinDark} />
      <Circle cx={pose.rHand.x} cy={pose.rHand.y} r={4} fill={C.skin}     />

      {/* ── Head ── */}
      {/* Hair */}
      <Circle cx={pose.head.x} cy={pose.head.y - 1} r={10} fill={C.hair} />
      {/* Face */}
      <Circle cx={pose.head.x} cy={pose.head.y + 1} r={9}  fill={C.skin} />

      {/* ── Neck ── */}
      <Limb p1={pose.neck} p2={pose.head} w={7} fill={C.skin} />
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface ExerciseAnimationProps {
  type: WorkoutType;
  size?: number;
}

export function ExerciseAnimation({ type, size = 180 }: ExerciseAnimationProps) {
  const [progress, setProgress] = useState(0);
  const direction = useRef(1);
  const poses = EXERCISE_POSES[type] ?? EXERCISE_POSES.push;

  useEffect(() => {
    const STEP = 1 / (2.5 * 60); // 2.5s per direction
    const id = setInterval(() => {
      setProgress(p => {
        const next = p + STEP * direction.current;
        if (next >= 1) { direction.current = -1; return 1; }
        if (next <= 0) { direction.current =  1; return 0; }
        return next;
      });
    }, 16);
    return () => clearInterval(id);
  }, []);

  const pose = lerpPose(poses[0], poses[1], easeInOut(progress));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.glow, { width: size, height: size, borderRadius: size / 2 }]} />
      <Svg width={size} height={size} viewBox="0 0 100 160">
        <HumanFigure pose={pose} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,201,167,0.08)',
  },
});
