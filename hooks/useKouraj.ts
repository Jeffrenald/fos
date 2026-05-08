import { useState, useCallback, useEffect, useRef } from 'react';
import { askKouraj, KourajMessage } from '@/lib/anthropic';
import { useUserStore } from '@/stores/userStore';
import { useNutritionStore } from '@/stores/nutritionStore';
import { supabase } from '@/lib/supabase';

interface SessionSummary {
  started_at: string;
  duration_seconds: number | null;
  total_volume_kg: number | null;
}

const MAX_HISTORY = 12; // keep last 12 messages to avoid huge API payloads

function buildGreeting(name: string, streak: number, lang: string): string {
  const hour  = new Date().getHours();
  const first = name?.split(' ')[0] ?? 'chè zanmi';

  const isMorning = hour < 17;

  const copy: Record<string, { morning: string; evening: string; streakHigh: string; streakLow: string; fresh: string }> = {
    en: {
      morning:    `Good morning, ${first}! ☀️`,
      evening:    `Good evening, ${first}! 🌙`,
      streakHigh: `${streak} days straight — you're on fire, ${first}! Ti pa ti pa, ou rive lwen 🔥`,
      streakLow:  `You're on a ${streak}-day streak, ${first}. Ready to keep it going today?`,
      fresh:      `Hey ${first}! I'm Kouraj, your personal fitness coach. What can I help you with today? 💪`,
    },
    fr: {
      morning:    `Bonjou ${first} ! ☀️`,
      evening:    `Bonswa ${first} ! 🌙`,
      streakHigh: `${streak} jours d'affilée — ou se yon bèt, ${first}! Continue comme ça 🔥`,
      streakLow:  `${streak} jours consécutifs, ${first}. Prêt à continuer aujourd'hui ?`,
      fresh:      `Bonjou ${first} ! Mwen se Kouraj, kòch fitness pèsonèl ou a. Kijan mwen ka ede ou jodi a ? 💪`,
    },
    ht: {
      morning:    `Bonjou ${first}! ☀️`,
      evening:    `Bonswa ${first}! 🌙`,
      streakHigh: `${streak} jou konsekitif — ou se yon bèt, chè ${first}! Ti pa ti pa, ou rive lwen 🔥`,
      streakLow:  `Ou sou yon ${streak}-jou streak, ${first}. Pare pou kontinye jodi a?`,
      fresh:      `Sak pase ${first}! Mwen se Kouraj — kòch pèsonèl ou. Kisa mwen ka fè pou ou jodi a? 💪`,
    },
  };

  const t = copy[lang] ?? copy.en;
  const greet = isMorning ? t.morning : t.evening;

  if (streak >= 7) return `${greet} ${t.streakHigh}`;
  if (streak > 0)  return `${greet} ${t.streakLow}`;
  return t.fresh;
}

export function useKouraj() {
  const user          = useUserStore(s => s.user);
  const getNutrition  = useNutritionStore(s => s.getDay);

  const [messages,   setMessages]   = useState<KourajMessage[]>([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [streak,     setStreak]     = useState(0);
  const [recentSess, setRecentSess] = useState<SessionSummary[]>([]);
  const initialised = useRef(false);

  useEffect(() => {
    if (!user?.id || initialised.current) return;
    initialised.current = true;

    supabase
      .from('workout_sessions')
      .select('started_at, duration_seconds, total_volume_kg, completed_at')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (!data) {
          setMessages([{ role: 'assistant', content: buildGreeting(user.name, 0, user.language) }]);
          return;
        }
        setRecentSess(data.slice(0, 3) as SessionSummary[]);

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const days  = new Set(data.map(s => s.started_at.split('T')[0]));
        let s = 0;
        for (let i = 0; i < 365; i++) {
          const d = new Date(today); d.setDate(d.getDate() - i);
          if (days.has(d.toISOString().split('T')[0])) s++;
          else if (i > 0) break;
        }
        setStreak(s);
        setMessages([{ role: 'assistant', content: buildGreeting(user.name, s, user.language) }]);
      })
;
  }, [user?.id]);

  const send = useCallback(async (text: string) => {
    if (!user || isLoading) return;

    // Get today's nutrition for context
    const today    = new Date().toISOString().split('T')[0];
    const todayLog = getNutrition(today);
    const todayNutrition = todayLog.entries.length > 0
      ? {
          kcal:    todayLog.entries.reduce((s, e) => s + e.calories, 0),
          protein: todayLog.entries.reduce((s, e) => s + e.protein_g, 0),
          foods:   todayLog.entries.map(e => e.food_name),
        }
      : null;

    const userMsg: KourajMessage = { role: 'user', content: text };
    // Trim history to last MAX_HISTORY messages to control API payload size
    const trimmed = messages.slice(-MAX_HISTORY);
    const history = [...trimmed, userMsg];
    setMessages(prev => [...prev.slice(-MAX_HISTORY), userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const reply = await askKouraj(history, {
        name:           user.name,
        language:       user.language,
        goal:           user.goal ?? 'active',
        recentSessions: recentSess,
        todayNutrition,
        currentStreak:  streak,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError(e.message ?? 'Could not reach Kouraj. Check your connection.');
      setMessages(prev => prev.slice(0, -1)); // remove the user message so they can retry
    } finally {
      setIsLoading(false);
    }
  }, [messages, user, isLoading, recentSess, streak, getNutrition]);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    initialised.current = false;
  }, []);

  return { messages, isLoading, error, send, reset, streak };
}
