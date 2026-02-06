import type { ProcessState, HealthScore, OptimizationOption } from './types';

export function calculateHealthScore(state: ProcessState): HealthScore {
  const { steps, bottlenecks } = state;
  const totalSteps = steps.length;
  
  if (totalSteps === 0) {
    return { overall: 50, bottleneckScore: 50, handoffScore: 50, lengthScore: 50, decisionScore: 50 };
  }

  // Bottleneck score: fewer bottlenecks = better
  const bottleneckCount = bottlenecks.length;
  const bottleneckRatio = bottleneckCount / totalSteps;
  const bottleneckScore = Math.max(0, Math.round(100 - (bottleneckRatio * 300)));

  // Handoff score: fewer handoffs = better
  const handoffCount = steps.filter(s => s.type === 'handoff').length;
  const handoffRatio = handoffCount / totalSteps;
  const handoffScore = Math.max(0, Math.round(100 - (handoffRatio * 250)));

  // Length score: sweet spot is 5-10 steps
  let lengthScore: number;
  if (totalSteps >= 5 && totalSteps <= 10) {
    lengthScore = 100;
  } else if (totalSteps < 5) {
    lengthScore = Math.round(60 + (totalSteps / 5) * 40);
  } else {
    // Penalty for too many steps, but gradual
    lengthScore = Math.max(20, Math.round(100 - ((totalSteps - 10) * 5)));
  }

  // Decision score: some good (1-3), too many bad
  const decisionCount = steps.filter(s => s.type === 'decision').length;
  let decisionScore: number;
  if (decisionCount >= 1 && decisionCount <= 3) {
    decisionScore = 100;
  } else if (decisionCount === 0) {
    decisionScore = 70; // No decisions is okay but not ideal
  } else {
    decisionScore = Math.max(20, Math.round(100 - ((decisionCount - 3) * 15)));
  }

  // Weighted average
  const overall = Math.round(
    bottleneckScore * 0.35 +
    handoffScore * 0.25 +
    lengthScore * 0.20 +
    decisionScore * 0.20
  );

  return {
    overall: Math.min(100, Math.max(0, overall)),
    bottleneckScore: Math.min(100, Math.max(0, bottleneckScore)),
    handoffScore: Math.min(100, Math.max(0, handoffScore)),
    lengthScore: Math.min(100, Math.max(0, lengthScore)),
    decisionScore: Math.min(100, Math.max(0, decisionScore)),
  };
}

export function calculateOptionHealthScore(option: OptimizationOption): HealthScore {
  return calculateHealthScore({
    steps: option.steps,
    bottlenecks: [], // Options typically resolve bottlenecks
  });
}

export function getScoreColor(score: number): { text: string; bg: string; border: string; ring: string } {
  if (score >= 80) {
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      ring: '#10b981',
    };
  }
  if (score >= 50) {
    return {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      ring: '#f59e0b',
    };
  }
  return {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    ring: '#ef4444',
  };
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  if (score >= 50) return 'Needs Work';
  return 'Critical';
}
