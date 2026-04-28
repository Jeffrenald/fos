import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import type { WorkoutType } from '@/constants/exercises';

// ─── Types ───────────────────────────────────────────────────────────────────

type Point = { x: number; y: number };

type Pose = {
  head:       Point;
  neck:       Point;
  lShoulder:  Point; rShoulder: Point;
  lElbow:     Point; rElbow:    Point;
  lHand:      Point; rHand:     Point;
  hips:       Point;
  lKnee:      Point; rKnee:     Point;
  lFoot:      Point; rFoot:     Point;
};

// ─── Pose library ────────────────────────────────────────────────────────────

const STANDING: Pose = {
  head:      { x: 50, y: 14 },
  neck:      { x: 50, y: 26 },
  lShoulder: { x: 36, y: 34 }, rShoulder: { x: 64, y: 34 },
  lElbow:    { x: 28, y: 56 }, rElbow:    { x: 72, y: 56 },
  lHand:     { x: 24, y: 76 }, rHand:     { x: 76, y: 76 },
  hips:      { x: 50, y: 72 },
  lKnee:     { x: 38, y: 102 }, rKnee:   { x: 62, y: 102 },
  lFoot:     { x: 33, y: 132 }, rFoot:   { x: 67, y: 132 },
};

const SQUAT_DOWN: Pose = {
  head:      { x: 50, y: 40 },
  neck:      { x: 50, y: 52 },
  lShoulder: { x: 37, y: 60 }, rShoulder: { x: 63, y: 60 },
  lElbow:    { x: 30, y: 78 }, rElbow:    { x: 70, y: 78 },
  lHand:     { x: 30, y: 96 }, rHand:     { x: 70, y: 96 },
  hips:      { x: 50, y: 96 },
  lKnee:     { x: 32, y: 120 }, rKnee:   { x: 68, y: 120 },
  lFoot:     { x: 30, y: 145 }, rFoot:   { x: 70, y: 145 },
};

const ARMS_UP: Pose = {
  head:      { x: 50, y: 30 },
  neck:      { x: 50, y: 42 },
  lShoulder: { x: 36, y: 50 }, rShoulder: { x: 64, y: 50 },
  lElbow:    { x: 26, y: 28 }, rElbow:    { x: 74, y: 28 },
  lHand:     { x: 20, y: 10 }, rHand:     { x: 80, y: 10 },
  hips:      { x: 50, y: 88 },
  lKnee:     { x: 38, y: 116 }, rKnee:   { x: 62, y: 116 },
  lFoot:     { x: 33, y: 145 }, rFoot:   { x: 67, y: 145 },
};

const PULL_CONTRACTED: Pose = {
  head:      { x: 50, y: 20 },
  neck:      { x: 50, y: 32 },
  lShoulder: { x: 36, y: 40 }, rShoulder: { x: 64, y: 40 },
  lElbow:    { x: 22, y: 28 }, rElbow:    { x: 78, y: 28 },
  lHand:     { x: 20, y: 10 }, rHand:     { x: 80, y: 10 },
  hips:      { x: 50, y: 78 },
  lKnee:     { x: 38, y: 108 }, rKnee:   { x: 62, y: 108 },
  lFoot:     { x: 38, y: 130 }, rFoot:   { x: 62, y: 130 },
};

const PUSH_EXTENDED: Pose = {
  head:      { x: 50, y: 14 },
  neck:      { x: 50, y: 26 },
  lShoulder: { x: 36, y: 34 }, rShoulder: { x: 64, y: 34 },
  lElbow:    { x: 18, y: 34 }, rElbow:    { x: 82, y: 34 },
  lHand:     { x: 8,  y: 34 }, rHand:     { x: 92, y: 34 },
  hips:      { x: 50, y: 72 },
  lKnee:     { x: 38, y: 102 }, rKnee:   { x: 62, y: 102 },
  lFoot:     { x: 33, y: 132 }, rFoot:   { x: 67, y: 132 },
};

const PUSH_CONTRACTED: Pose = {
  head:      { x: 50, y: 14 },
  neck:      { x: 50, y: 26 },
  lShoulder: { x: 36, y: 34 }, rShoulder: { x: 64, y: 34 },
  lElbow:    { x: 30, y: 52 }, rElbow:    { x: 70, y: 52 },
  lHand:     { x: 36, y: 54 }, rHand:     { x: 64, y: 54 },
  hips:      { x: 50, y: 72 },
  lKnee:     { x: 38, y: 102 }, rKnee:   { x: 62, y: 102 },
  lFoot:     { x: 33, y: 132 }, rFoot:   { x: 67, y: 132 },
};

const PLANK: Pose = {
  head:      { x: 20, y: 55 },
  neck:      { x: 30, y: 60 },
  lShoulder: { x: 38, y: 64 }, rShoulder: { x: 38, y: 56 },
  lElbow:    { x: 22, y: 72 }, rElbow:    { x: 22, y: 64 },
  lHand:     { x: 14, y: 78 }, rHand:     { x: 14, y: 70 },
  hips:      { x: 62, y: 64 },
  lKnee:     { x: 76, y: 72 }, rKnee:    { x: 76, y: 62 },
  lFoot:     { x: 88, y: 80 }, rFoot:    { x: 88, y: 68 },
};

const PLANK_SLIGHT: Pose = {
  ...PLANK,
  head:  { x: 20, y: 52 },
  hips:  { x: 62, y: 62 },
};

// ─── Pose per exercise type ───────────────────────────────────────────────────

const EXERCISE_POSES: Record<WorkoutType, [Pose, Pose]> = {
  push:  [PUSH_CONTRACTED,  PUSH_EXTENDED],
  pull:  [ARMS_UP,          PULL_CONTRACTED],
  legs:  [STANDING,         SQUAT_DOWN],
  core:  [PLANK,            PLANK_SLIGHT],
  upper: [PUSH_CONTRACTED,  PUSH_EXTENDED],
  full:  [STANDING,         SQUAT_DOWN],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const keys = Object.keys(a) as (keyof Pose)[];
  return Object.fromEntries(
    keys.map(k => [k, {
      x: lerp(a[k].x, b[k].x, t),
      y: lerp(a[k].y, b[k].y, t),
    }])
  ) as Pose;
}

// Smooth ease-in-out
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ─── Stick Figure ─────────────────────────────────────────────────────────────

function StickFigure({ pose }: { pose: Pose }) {
  const S  = Colors.teal;
  const SW = '3';
  const lc = 'round';

  return (
    <>
      {/* Head */}
      <Circle cx={pose.head.x} cy={pose.head.y} r={9} fill="none" stroke={S} strokeWidth="2.5" />

      {/* Torso */}
      <Line x1={pose.neck.x} y1={pose.neck.y} x2={pose.hips.x} y2={pose.hips.y}
        stroke={S} strokeWidth={SW} strokeLinecap={lc} />

      {/* Left arm */}
      <Line x1={pose.lShoulder.x} y1={pose.lShoulder.y} x2={pose.lElbow.x} y2={pose.lElbow.y}
        stroke={S} strokeWidth={SW} strokeLinecap={lc} />
      <Line x1={pose.lElbow.x} y1={pose.lElbow.y} x2={pose.lHand.x} y2={pose.lHand.y}
        stroke={S} strokeWidth={SW} strokeLinecap={lc} />

      {/* Right arm */}
      <Line x1={pose.rShoulder.x} y1={pose.rShoulder.y} x2={pose.rElbow.x} y2={pose.rElbow.y}
        stroke={S} strokeWidth={SW} strokeLinecap={lc} />
      <Line x1={pose.rElbow.x} y1={pose.rElbow.y} x2={pose.rHand.x} y2={pose.rHand.y}
        stroke={S} strokeWidth={SW} strokeLinecap={lc} />

      {/* Shoulder line */}
      <Line x1={pose.lShoulder.x} y1={pose.lShoulder.y} x2={pose.rShoulder.x} y2={pose.rShoulder.y}
        stroke={S} strokeWidth={SW} strokeLinecap={lc} />

      {/* Left leg */}
      <Line x1={pose.hips.x} y1={pose.hips.y} x2={pose.lKnee.x} y2={pose.lKnee.y}
        stroke={S} strokeWidth={SW} strokeLinecap={lc} />
      <Line x1={pose.lKnee.x} y1={pose.lKnee.y} x2={pose.lFoot.x} y2={pose.lFoot.y}
        stroke={S} strokeWidth={SW} strokeLinecap={lc} />

      {/* Right leg */}
      <Line x1={pose.hips.x} y1={pose.hips.y} x2={pose.rKnee.x} y2={pose.rKnee.y}
        stroke={S} strokeWidth={SW} strokeLinecap={lc} />
      <Line x1={pose.rKnee.x} y1={pose.rKnee.y} x2={pose.rFoot.x} y2={pose.rFoot.y}
        stroke={S} strokeWidth={SW} strokeLinecap={lc} />
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface ExerciseAnimationProps {
  type: WorkoutType;
  size?: number;
}

export function ExerciseAnimation({ type, size = 160 }: ExerciseAnimationProps) {
  const [progress, setProgress] = useState(0);
  const direction = useRef(1);
  const poses = EXERCISE_POSES[type] ?? EXERCISE_POSES.push;

  // 60fps animation loop, 2s per direction
  useEffect(() => {
    const STEP = 1 / (2 * 60); // completes in 2 seconds at 60fps
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
      {/* Background glow */}
      <View style={[styles.glow, { width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4 }]} />
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 160"
        style={styles.svg}
      >
        <StickFigure pose={pose} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: Colors.tealDim,
  },
  svg: {
    position: 'absolute',
  },
});
