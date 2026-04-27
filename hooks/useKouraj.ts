import { useState, useCallback } from 'react';
import { askKouraj, KourajMessage } from '../lib/anthropic';
import { useUserStore } from '../stores/userStore';

export function useKouraj() {
  const user = useUserStore(s => s.user);
  const [messages, setMessages]   = useState<KourajMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const send = useCallback(async (text: string) => {
    if (!user) return;

    const userMsg: KourajMessage = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setIsLoading(true);
    setError(null);

    try {
      const reply = await askKouraj(next, {
        name:           user.name,
        language:       user.language,
        goal:           user.goal ?? 'active',
        recentSessions: [],
        todayNutrition: null,
        currentStreak:  0,
      });
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [messages, user]);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, send, reset };
}
