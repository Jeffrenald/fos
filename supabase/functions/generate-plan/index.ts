import Anthropic from 'npm:@anthropic-ai/sdk';

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { goal, level, equipment, language, daysPerWeek = 5 } = await req.json();
    const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

    const equipLabel = { gym: 'full gym', home: 'home gym', dumbbells: 'dumbbells only', none: 'no equipment' }[equipment] ?? 'full gym';

    const prompt = `Generate a balanced ${daysPerWeek}-day workout week plan for this person.

Goal: ${goal}
Level: ${level}
Equipment: ${equipLabel}

Rules:
- Days without a workout should be rest or active recovery
- Balance push/pull/legs across the week — never train the same muscle group two days in a row
- For "none" or "home" equipment: only use bodyweight exercises
- For "dumbbells": only use exercises doable with dumbbells at home
- Include exercise names that are real, common gym exercises

Return ONLY valid JSON. No markdown, no explanation, just the JSON:
{
  "frequency": ${daysPerWeek},
  "days": [
    {
      "dayIndex": 0,
      "isRest": false,
      "workout": {
        "templateKey": "push",
        "name": "Push Day",
        "emoji": "💪",
        "focus": "Chest · Shoulders · Triceps",
        "estimatedMin": 45,
        "exerciseIds": ["bench-press", "shoulder-press", "lateral-raises", "tricep-pushdown", "cable-fly"]
      }
    },
    {
      "dayIndex": 1,
      "isRest": true
    }
  ]
}

dayIndex goes from 0 (Monday) to 6 (Sunday).
templateKey must be one of: push, pull, legs, upper, core, full.
exerciseIds must be from this list only:
push: bench-press, incline-db-press, cable-fly, shoulder-press, lateral-raises, tricep-pushdown, dips, push-up, pike-push-up, diamond-push-up, chair-dip
pull: pull-up, barbell-row, cable-row, face-pull, bicep-curl, hammer-curl, lat-pulldown, inverted-row, superman-hold
legs: squat, romanian-deadlift, leg-press, lunges, leg-curl, calf-raise, goblet-squat, bodyweight-squat, jump-squat, glute-bridge
core: plank, dead-bug, russian-twist, hanging-knee-raise, ab-wheel, bicycle-crunch, mountain-climber

Pick exercises appropriate for the user's equipment. Return exactly ${daysPerWeek} non-rest days.`;

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 2000,
      messages:   [{ role: 'user', content: prompt }],
    });

    const raw  = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const plan = JSON.parse(raw.trim());

    return new Response(JSON.stringify({ plan }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
