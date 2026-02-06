import { NextRequest, NextResponse } from 'next/server';
import { validateAnalyzeInput } from '@/lib/validation';

// Serverless with extended timeout (Vercel allows up to 60s on Hobby with Fluid Compute)
export const maxDuration = 60;

const SYSTEM_PROMPT = `Business process analyst. Return ONLY valid JSON:
{"title":"Short title","currentState":{"steps":[{"id":"1","label":"Name","type":"start|process|decision|handoff|bottleneck|end","connections":["2"],"description":"Brief"}],"bottlenecks":[{"stepId":"id","reason":"Why"}]},"options":[{"name":"Name","description":"Approach","improvement":"Impact","steps":[same format]}],"comparison":[{"metric":"Name","current":"Val","option1":"V","option2":"V","option3":"V"}]}
Rules: 3 options, 5-10 steps each, start+end nodes, 5-8 metrics. JSON ONLY, no markdown, no code fences.`;

/** Try to extract valid JSON from AI response that may have extra text */
function extractJSON(raw: string): object | null {
  // Strip markdown code fences
  let content = raw.trim();
  if (content.startsWith('```')) {
    content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  // Attempt 1: direct parse
  try {
    return JSON.parse(content);
  } catch { /* continue */ }

  // Attempt 2: find first { to last }
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(content.slice(firstBrace, lastBrace + 1));
    } catch { /* continue */ }
  }

  // Attempt 3: clean control characters and retry
  try {
    const cleaned = content
      .slice(firstBrace !== -1 ? firstBrace : 0, lastBrace !== -1 ? lastBrace + 1 : undefined)
      .replace(/[\x00-\x1f\x7f]/g, (ch) => ch === '\n' || ch === '\r' || ch === '\t' ? ch : '');
    return JSON.parse(cleaned);
  } catch { /* give up */ }

  return null;
}

async function callMoonshot(moonshotKey: string, industry: string, currentProcess: string, desiredOutcome: string) {
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
    throw new Error(`AI error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('Empty AI response');
  }

  const parsed = extractJSON(content);
  if (!parsed) {
    throw new Error('AI returned invalid JSON');
  }

  // Validate structure
  const result = parsed as Record<string, unknown>;
  if (!result.currentState || !result.options) {
    throw new Error('Invalid response structure');
  }

  return result;
}

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

    const moonshotKey = process.env.MOONSHOT_API_KEY;
    if (!moonshotKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Try up to 2 times (initial + 1 retry on JSON parse failure)
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await callMoonshot(moonshotKey, industry, currentProcess, desiredOutcome);
        return NextResponse.json(result);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Analysis attempt ${attempt + 1} failed:`, lastError.message);
        if (lastError.message.startsWith('AI error:')) {
          // API-level error, don't retry
          return NextResponse.json({ error: lastError.message }, { status: 502 });
        }
        // JSON parse error — retry once
      }
    }

    return NextResponse.json({ error: 'Analysis failed after retry. Please try again.' }, { status: 500 });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: `Failed: ${error instanceof Error ? error.message : 'Unknown'}` }, { status: 500 });
  }
}
