const http = require('http');
const https = require('https');

const PORT = 3456;
const MOONSHOT_KEY = process.env.MOONSHOT_API_KEY || 'sk-B0xcJmmL3TMTdG6zUNvJOmprj2QiswOEGi3XZFzVhoJpPmhc';

const SYSTEM_PROMPT = `You are an expert business process analyst. Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "title": "Short title (3-6 words)",
  "currentState": {
    "steps": [{"id": "1", "label": "Step name", "type": "start|process|decision|handoff|bottleneck|end", "connections": ["2"], "description": "Brief"}],
    "bottlenecks": [{"stepId": "id", "reason": "Why"}]
  },
  "options": [
    {"name": "Option Name", "description": "Approach", "improvement": "Quantified", "steps": [{"id": "1", "label": "Step", "type": "start|process|end", "connections": ["2"], "description": "Brief"}]}
  ],
  "comparison": [{"metric": "Name", "current": "Value", "option1": "V", "option2": "V", "option3": "V"}]
}
Return exactly 3 options. 5-10 steps per flow. 5-8 comparison metrics. JSON ONLY.`;

function callMoonshot(messages) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'moonshot-v1-8k',
      max_tokens: 4096,
      temperature: 0.7,
      messages,
    });

    const req = https.request({
      hostname: 'api.moonshot.ai',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MOONSHOT_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 120000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Invalid JSON from Moonshot: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(payload);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const input = JSON.parse(body);

      if (req.url === '/api/analyze') {
        const { currentProcess, desiredOutcome, industry, goals } = input;
        const outcome = desiredOutcome || (Array.isArray(goals) ? goals.join(', ') : goals) || 'Optimize';

        const result = await callMoonshot([
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Industry: ${industry || 'General'}\nProcess: ${currentProcess}\nGoals: ${outcome}\nReturn JSON.` },
        ]);

        let content = result.choices?.[0]?.message?.content?.trim();
        if (!content) throw new Error('Empty response');
        if (content.startsWith('```')) content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');

        const parsed = JSON.parse(content);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(parsed));
      } else if (req.url === '/api/chat') {
        const { message, analysisContext, chatHistory } = input;
        const messages = [
          { role: 'system', content: 'Business process analyst. Return JSON: {reply, hasProcessUpdate, updatedOption?}. JSON only.' },
        ];
        if (analysisContext) {
          messages.push({ role: 'user', content: `Context: ${analysisContext.title}. Process: ${analysisContext.currentProcess?.slice(0, 300)}` });
          messages.push({ role: 'assistant', content: '{"reply":"Ready.","hasProcessUpdate":false}' });
        }
        if (chatHistory) {
          for (const e of chatHistory.slice(-3)) {
            messages.push({ role: 'user', content: e.userMessage });
            if (e.aiResponse) messages.push({ role: 'assistant', content: JSON.stringify(e.aiResponse) });
          }
        }
        messages.push({ role: 'user', content: message });

        const result = await callMoonshot(messages);
        let content = result.choices?.[0]?.message?.content?.trim();
        if (content?.startsWith('```')) content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(content);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'FlowForge AI Proxy', time: new Date().toISOString() }));
      }
    } catch (err) {
      console.error('Error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`FlowForge AI Proxy running on port ${PORT}`);
});
