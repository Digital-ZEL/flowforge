import { NextRequest, NextResponse } from 'next/server';
import { validateAnalyzeInput } from '@/lib/validation';

// Serverless with extended timeout (Vercel allows up to 60s on Hobby with Fluid Compute)
export const maxDuration = 60;

const SYSTEM_PROMPT = `Business process analyst. Return ONLY valid JSON:
{"title":"Short title","currentState":{"steps":[{"id":"1","label":"Name","type":"start|process|decision|handoff|bottleneck|end","connections":["2"],"description":"Brief"}],"bottlenecks":[{"stepId":"id","reason":"Why"}]},"options":[{"name":"Name","description":"Approach","improvement":"Impact","steps":[same format]}],"comparison":[{"metric":"Name","current":"Val","option1":"V","option2":"V","option3":"V"}]}
Rules: 3 options, 5-10 steps each, start+end nodes, 5-8 metrics. JSON ONLY, no markdown.`;

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const errors = validateAnalyzeInput(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0].message, errors }, { status: 400 });
    }

    const { currentProcess, industry } = body;
    const desiredOutcome = body.desiredOutcome || (body.goals ? (Array.isArray(body.goals) ? body.goals.join(', ') : body.goals) : 'Optimize');

    if (!currentProcess || currentProcess.trim().length < 10) {
      return NextResponse.json({ error: 'Process description too short' }, { status: 400 });
    }

    const moonshotKey = process.env.MOONSHOT_API_KEY;
    if (!moonshotKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.moonshot.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${moonshotKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        max_tokens: 4096,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Industry: ${industry || 'General'}\nProcess: ${currentProcess}\nGoals: ${desiredOutcome}\nAnalyze and return JSON.` },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Moonshot error:', response.status, errText);
      return NextResponse.json({ error: `AI error: ${response.status}` }, { status: 502 });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json({ error: 'Empty AI response' }, { status: 500 });
    }

    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    const parsed = JSON.parse(content);

    if (!parsed.currentState?.steps || !parsed.options) {
      return NextResponse.json({ error: 'Invalid response structure' }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Analysis error:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'AI returned invalid JSON. Try again.' }, { status: 500 });
    }
    return NextResponse.json({ error: `Failed: ${error instanceof Error ? error.message : 'Unknown'}` }, { status: 500 });
  }
}
