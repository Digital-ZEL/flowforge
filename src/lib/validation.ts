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

  // desiredOutcome — make optional since goals might replace it
  if (body.desiredOutcome && typeof body.desiredOutcome === 'string') {
    const len = body.desiredOutcome.trim().length;
    if (len > 5000) {
      errors.push({ field: 'desiredOutcome', message: `Desired outcome must be at most 5,000 characters (got ${len}).` });
    }
  }

  // industry — accept any non-empty string
  if (!body.industry || typeof body.industry !== 'string' || body.industry.trim().length === 0) {
    errors.push({ field: 'industry', message: 'Industry is required.' });
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

  if (!body.analysisContext || typeof body.analysisContext !== 'object') {
    errors.push({ field: 'analysisContext', message: 'Analysis context is required.' });
  }

  return errors;
}
