import type { AnalysisResult, SmartSuggestion } from './types';

export function generateSuggestions(process: AnalysisResult): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const { steps, bottlenecks } = process.currentState;

  // Count handoffs
  const handoffs = steps.filter(s => s.type === 'handoff');
  if (handoffs.length > 0) {
    const eliminable = Math.max(1, Math.floor(handoffs.length * 0.6));
    suggestions.push({
      id: 'handoff-reduction',
      icon: '🔄',
      text: `You have ${handoffs.length} handoff${handoffs.length > 1 ? 's' : ''} — ${eliminable} could potentially be eliminated`,
      chatPrompt: `I have ${handoffs.length} handoffs in my current process: ${handoffs.map(h => h.label).join(', ')}. Which ones could be eliminated or combined, and how would you restructure the flow?`,
      category: 'handoff',
    });
  }

  // Bottleneck analysis
  if (bottlenecks.length > 0) {
    // Find the worst bottleneck
    const worstBottleneck = bottlenecks[0];
    const bottleneckStep = steps.find(s => s.id === worstBottleneck.stepId);
    if (bottleneckStep) {
      suggestions.push({
        id: 'worst-bottleneck',
        icon: '🎯',
        text: `The "${bottleneckStep.label}" step is your biggest bottleneck — consider parallel processing`,
        chatPrompt: `The "${bottleneckStep.label}" step is a major bottleneck because: ${worstBottleneck.reason}. How can I restructure this to run in parallel with other steps or reduce the delay?`,
        category: 'bottleneck',
      });
    }

    if (bottlenecks.length > 1) {
      suggestions.push({
        id: 'multiple-bottlenecks',
        icon: '⚡',
        text: `${bottlenecks.length} bottlenecks identified — addressing these could cut your timeline by 40-60%`,
        chatPrompt: `I have ${bottlenecks.length} bottlenecks in my process. Can you suggest a phased approach to address them, starting with the highest-impact one?`,
        category: 'bottleneck',
      });
    }
  }

  // Automation opportunities
  const manualSteps = steps.filter(s => {
    const text = `${s.label} ${s.description || ''}`.toLowerCase();
    return text.includes('manual') || text.includes('enter') || text.includes('paper') || 
           text.includes('print') || text.includes('scan') || text.includes('spreadsheet') ||
           text.includes('email') || text.includes('fax') || text.includes('physical');
  });

  if (manualSteps.length > 0) {
    suggestions.push({
      id: 'automation-opportunity',
      icon: '🤖',
      text: `${manualSteps.length} step${manualSteps.length > 1 ? 's' : ''} could be automated with existing tools`,
      chatPrompt: `These steps in my process appear to be manual/paper-based: ${manualSteps.map(s => s.label).join(', ')}. What specific tools or automation could replace each one?`,
      category: 'automation',
    });
  }

  // Client-facing improvements
  const clientSteps = steps.filter(s => {
    const text = `${s.label} ${s.description || ''}`.toLowerCase();
    return text.includes('client') || text.includes('customer') || text.includes('document') ||
           text.includes('collect') || text.includes('gather') || text.includes('submit');
  });

  if (clientSteps.length > 0) {
    suggestions.push({
      id: 'client-portal',
      icon: '🌐',
      text: 'Consider adding a client portal to reduce document collection time',
      chatPrompt: `My process has ${clientSteps.length} steps that involve client interaction or document collection. How would a client self-service portal change the flow, and what would it look like?`,
      category: 'improvement',
    });
  }

  // Process length suggestion
  if (steps.length > 12) {
    suggestions.push({
      id: 'simplification',
      icon: '✂️',
      text: `Your process has ${steps.length} steps — there may be opportunities to consolidate`,
      chatPrompt: `My current process has ${steps.length} steps. Can you identify any steps that could be merged or eliminated to simplify the workflow without losing quality?`,
      category: 'improvement',
    });
  }

  // Decision point optimization
  const decisions = steps.filter(s => s.type === 'decision');
  if (decisions.length > 3) {
    suggestions.push({
      id: 'decision-reduction',
      icon: '🔀',
      text: `${decisions.length} decision points create complexity — some could be pre-determined by rules`,
      chatPrompt: `My process has ${decisions.length} decision points: ${decisions.map(d => d.label).join(', ')}. Which ones could be automated with rule-based logic instead of manual decisions?`,
      category: 'improvement',
    });
  }

  // Compliance / review wait time
  const reviewSteps = steps.filter(s => {
    const text = `${s.label} ${s.description || ''}`.toLowerCase();
    return text.includes('review') || text.includes('approval') || text.includes('approve') ||
           text.includes('compliance') || text.includes('audit');
  });

  if (reviewSteps.length > 1) {
    suggestions.push({
      id: 'parallel-reviews',
      icon: '⏱️',
      text: `${reviewSteps.length} review/approval steps could potentially run in parallel`,
      chatPrompt: `I have ${reviewSteps.length} review or approval steps in my process: ${reviewSteps.map(s => s.label).join(', ')}. Could any of these run simultaneously instead of sequentially?`,
      category: 'improvement',
    });
  }

  return suggestions.slice(0, 6); // Max 6 suggestions
}

export function getSuggestedNextStep(process: AnalysisResult): string {
  // Simple heuristic for dashboard "suggested next step"
  if (process.options.length > 0 && !process.lastViewedAt) {
    return 'Try the swimlane view →';
  }
  if (process.options.length >= 2) {
    return 'Compare options with ROI Calculator →';
  }
  if (process.currentState.bottlenecks.length > 0) {
    return 'Ask the AI to refine a bottleneck →';
  }
  return 'Export as PDF for stakeholders →';
}
