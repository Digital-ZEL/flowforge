import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const { message, analysisContext, chatHistory } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const moonshotKey = process.env.MOONSHOT_API_KEY;
    if (!moonshotKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: 'Business process analyst. Return JSON: {"reply":"text","hasProcessUpdate":false}. If suggesting process changes, set hasProcessUpdate:true and add updatedOption with steps. JSON only.' },
    ];

    if (analysisContext) {
      messages.push({ role: 'user', content: `Context: ${analysisContext.title}. Process: ${analysisContext.currentProcess?.slice(0, 300)}` });
      messages.push({ role: 'assistant', content: '{"reply":"Ready.","hasProcessUpdate":false}' });
    }

    if (chatHistory && Array.isArray(chatHistory)) {
      for (const e of chatHistory.slice(-3)) {
        messages.push({ role: 'user', content: e.userMessage });
        if (e.aiResponse) messages.push({ role: 'assistant', content: JSON.stringify(e.aiResponse) });
      }
    }

    messages.push({ role: 'user', content: message });

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
        messages,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `AI error: ${response.status}` }, { status: 502 });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json({ error: 'Empty response' }, { status: 500 });
    }

    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: `Failed: ${error instanceof Error ? error.message : 'Unknown'}` }, { status: 500 });
  }
}
