export const ALLOWED_INDUSTRIES = [
  'Wealth Management',
  'Banking',
  'Insurance',
  'Healthcare',
  'Legal',
  'Real Estate',
  'Technology',
  'Manufacturing',
  'Retail',
  'Education',
  'Government',
  'Nonprofit',
  'Other',
] as const;

export type AllowedIndustry = typeof ALLOWED_INDUSTRIES[number];

export interface ValidationError {
  field: string;
  message: string;
}

export interface AnalyzeInput {
  currentProcess: string;
  desiredOutcome: string;
  industry: string;
  goals?: string[];
}

/**
 * Validate analyze API input.
 * Returns an array of validation errors (empty = valid).
 */
export function validateAnalyzeInput(body: Partial<AnalyzeInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  // currentProcess
  if (!body.currentProcess || typeof body.currentProcess !== 'string') {
    errors.push({ field: 'currentProcess', message: 'Current process description is required.' });
  } else {
    const len = body.currentProcess.trim().length;
    if (len < 10) {
      errors.push({ field: 'currentProcess', message: `Current process must be at least 10 characters (got ${len}).` });
    }
    if (len > 10000) {
      errors.push({ field: 'currentProcess', message: `Current process must be at most 10,000 characters (got ${len}).` });
    }
  }

  // desiredOutcome
  const desiredOutcomeValue = typeof body.desiredOutcome === 'string' ? body.desiredOutcome.trim() : '';
  const hasGoals = Array.isArray(body.goals) && body.goals.some(goal => typeof goal === 'string' && goal.trim().length > 0);
  if (!desiredOutcomeValue && !hasGoals) {
    errors.push({ field: 'desiredOutcome', message: 'Desired outcome is required.' });
  } else if (desiredOutcomeValue) {
    const len = desiredOutcomeValue.length;
    if (len < 10) {
      errors.push({ field: 'desiredOutcome', message: `Desired outcome must be at least 10 characters (got ${len}).` });
    }
    if (len > 5000) {
      errors.push({ field: 'desiredOutcome', message: `Desired outcome must be at most 5,000 characters (got ${len}).` });
    }
  }

  // industry
  if (!body.industry || typeof body.industry !== 'string' || body.industry.trim().length === 0) {
    errors.push({ field: 'industry', message: 'Industry is required.' });
  } else if (!ALLOWED_INDUSTRIES.includes(body.industry as AllowedIndustry)) {
    errors.push({
      field: 'industry',
      message: `Industry must be one of: ${ALLOWED_INDUSTRIES.join(', ')}.`,
    });
  }

  return errors;
}

/**
 * Validate chat API input.
 */
export function validateChatInput(body: { message?: string; analysisContext?: unknown }): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
    errors.push({ field: 'message', message: 'Message is required.' });
  } else if (body.message.length > 2000) {
    errors.push({ field: 'message', message: 'Message must be at most 2,000 characters.' });
  }

  if (body.analysisContext != null && typeof body.analysisContext !== 'object') {
    errors.push({ field: 'analysisContext', message: 'Analysis context must be an object when provided.' });
  }

  return errors;
}
