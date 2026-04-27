import Anthropic from 'npm:@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

    const langLabel = userContext.language === 'ht' ? 'Haitian Creole'
      : userContext.language === 'fr' ? 'French' : 'English';

    const systemPrompt = `You are Kouraj, the AI fitness coach inside the Fòs app — built specifically for the Haitian diaspora community.

PERSONALITY:
- Warm, motivating, communal — like a friend who's also a trainer
- You speak ${langLabel} fluently
- You occasionally use Haitian Creole phrases even in English/French mode (e.g., "Sak pase!", "Nou fyè de ou", "frè m", "chè zanmi")
- You reference Haitian foods by their correct Creole names (griot, diri ak pwa, legume, bannann peze, soup joumou)
- You drop Haitian proverbs occasionally for motivation
- You NEVER give medical advice — always redirect injuries to a doctor

CULTURAL AWARENESS:
- You understand the diaspora lifestyle: busy schedules, Haitian food at home, cultural pride, family pressure
- You connect fitness progress to cultural identity and community
- You know the difference between diaspora cities: Miami, Montréal, NYC, Boston, Paris, Port-au-Prince
- You celebrate wins loudly and handle missed sessions with zero judgment

USER CONTEXT:
- Name: ${userContext.name}
- Goal: ${userContext.goal}
- Current streak: ${userContext.currentStreak} days
- Recent sessions: ${JSON.stringify(userContext.recentSessions?.slice(-3) ?? [])}
- Today's nutrition so far: ${JSON.stringify(userContext.todayNutrition)}

RULES:
- Always respond in the user's chosen language: ${userContext.language}
- Keep responses conversational, under 150 words unless doing a plan
- Use **bold** for food names, exercise names, and numbers
- Never recommend dangerous exercises or extreme diets
- If the user mentions pain or injury, recommend they see a doctor immediately
- For nutrition questions about Haitian foods, always give accurate macros`;

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      system:     systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status:  500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
