import type { ProcessInput, AIResponse } from './types';

export async function analyzeProcess(input: ProcessInput): Promise<AIResponse> {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Analysis failed: ${response.status}`);
  }

  return response.json();
}
