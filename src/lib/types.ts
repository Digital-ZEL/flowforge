export type NodeType = 'start' | 'process' | 'decision' | 'handoff' | 'bottleneck' | 'end';

export interface ProcessStep {
  id: string;
  label: string;
  type: NodeType;
  connections: string[];
  description?: string;
  role?: string;
}

export interface Bottleneck {
  stepId: string;
  reason: string;
}

export interface ProcessState {
  steps: ProcessStep[];
  bottlenecks: Bottleneck[];
}

export interface OptimizationOption {
  name: string;
  description: string;
  improvement: string;
  steps: ProcessStep[];
}

export interface ComparisonMetric {
  metric: string;
  current: string;
  [key: string]: string;
}

export interface AnalysisResult {
  id: string;
  title: string;
  currentProcess: string;
  desiredOutcome: string;
  industry: string;
  currentState: ProcessState;
  options: OptimizationOption[];
  comparison: ComparisonMetric[];
  createdAt: string;
  updatedAt: string;
  goals?: string[];
  lastViewedAt?: string;
  feedbackCount?: number;
  // Library fields (v5)
  department?: string;
  owner?: string;
  status?: 'draft' | 'in_review' | 'approved' | 'needs_update';
  riskLevel?: number; // 1-5
  tags?: string[];
  lastReviewedAt?: string;
  featured?: boolean;
}

export interface ProcessInput {
  currentProcess: string;
  desiredOutcome: string;
  industry: string;
  goals?: string[];
}

export interface AIResponse {
  title: string;
  currentState: ProcessState;
  options: OptimizationOption[];
  comparison: ComparisonMetric[];
}

// Collaboration feedback
export interface FeedbackComment {
  id: string;
  processId: string;
  author: string;
  comment: string;
  createdAt: string;
}

// ROI Calculator
export interface ROIInputs {
  clientsPerYear: number;
  hourlyRate: number;
  implementationMonths: number;
}

// Health Score
export interface HealthScore {
  overall: number;
  bottleneckScore: number;
  handoffScore: number;
  lengthScore: number;
  decisionScore: number;
}

// Smart Suggestion
export interface SmartSuggestion {
  id: string;
  icon: string;
  text: string;
  chatPrompt: string;
  category: 'handoff' | 'bottleneck' | 'automation' | 'improvement';
}
