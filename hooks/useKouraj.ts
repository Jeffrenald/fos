import { useState, useCallback, useEffect, useRef } from 'react';
import { askKouraj, KourajMessage } from '@/lib/anthropic';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/lib/supabase';

interface SessionSummary {
  started_at: string;
  duration_seconds: number | null;
  total_volume_kg: number | null;
}

function buildGreeting(name: string, streak: number, lang: string): string {
  const hour = new Date().getHours();
  const first = name.split(' ')[0];

  const greetings: Record<string, { morning: string; evening: string }> = {
    en: { morning: `Bonjou ${first}! ☀️`, evening: `Bonswa ${first}! 🌙` },
    fr: { morning: `Bonjou ${first}! ☀️`, evening: `Bonswa ${first}! 🌙` },
    ht: { morning: `Bonjou ${first}! ☀️`, evening: `Bonswa ${first}! 🌙` },
  };

  const g = greetings[lang] ?? greetings.en;
  const timeGreet = hour < 17 ? g.morning : g.evening;

  if (streak >= 7) {
    return `${timeGreet} ${streak} jou konsekitif — ou se yon bèt, chè! Ti pa ti pa, ou rive lwen 🔥`;
  }
  if (streak > 0) {
    return `${timeGreet} Ou sou yon ${streak}-jou streak. Ready to keep it going today?`;
  }
  return `${timeGreet} Kijan ou rele? I'm Kouraj — your personal fitness coach. What can I help you with today? 💪`;
}

export function useKouraj() {
  const user    = useUserStore(s => s.user);
  const [messages,   setMessages]   = useState<KourajMessage[]>([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [streak,     setStreak]     = useState(0);
  const [recentSess, setRecentSess] = useState<SessionSummary[]>([]);
  const initialised = useRef(false);

  // Load context from Supabase once
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
        if (!data) return;
        setRecentSess(data.slice(0, 3) as SessionSummary[]);

        // Compute streak
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const days  = new Set(data.map(s => s.started_at.split('T')[0]));
        let s = 0;
        for (let i = 0; i < 365; i++) {
          const d = new Date(today); d.setDate(d.getDate() - i);
          if (days.has(d.toISOString().split('T')[0])) s++;
          else if (i > 0) break;
        }
        setStreak(s);

        // Auto-send greeting as first assistant message
        const greeting = buildGreeting(user.name, s, user.language);
        setMessages([{ role: 'assistant', content: greeting }]);
      });
  }, [user?.id]);

  const send = useCallback(async (text: string) => {
    if (!user || isLoading) return;

    const userMsg: KourajMessage  = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setIsLoading(true);
    setError(null);

    try {
      const reply = await askKouraj(history, {
        name:           user.name,
        language:       user.language,
        goal:           user.goal ?? 'active',
        recentSessions: recentSess,
        todayNutrition: null,
        currentStreak:  streak,
      });
      setMessages([...history, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Try again.');
      // Remove the user message so they can retry
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, user, isLoading, recentSess, streak]);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    initialised.current = false;
  }, []);

  return { messages, isLoading, error, send, reset, streak };
}
