import { supabase } from './supabase';

export interface KourajMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserContext {
  name: string;
  language: 'en' | 'fr' | 'ht';
  goal: string;
  recentSessions: any[];
  todayNutrition: any;
  currentStreak: number;
}

// All Kouraj calls go through the Supabase Edge Function — ANTHROPIC_API_KEY never touches the client
export async function askKouraj(
  messages: KourajMessage[],
  userContext: UserContext,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('kouraj', {
    body: { messages, userContext },
  });

  if (error) throw new Error(error.message);
  return data.text as string;
}

export async function generateWorkoutPlan(userProfile: {
  goal: string;
  level: string;
  equipment: string;
}): Promise<any> {
  const { data, error } = await supabase.functions.invoke('generate-plan', {
    body: { userProfile },
  });

  if (error) throw new Error(error.message);
  return data.plan;
}
