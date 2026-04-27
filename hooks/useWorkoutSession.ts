import { useEffect, useRef } from 'react';
import { useWorkoutStore } from '../stores/workoutStore';

export function useRestTimer() {
  const { session, tickRest } = useWorkoutStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (session?.isResting) {
      intervalRef.current = setInterval(tickRest, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [session?.isResting, tickRest]);

  return {
    isResting:  session?.isResting ?? false,
    secondsLeft: session?.restSecondsLeft ?? 0,
  };
}
