import { describe, it, expect } from 'vitest';
import { validateAnalyzeInput, validateChatInput, ALLOWED_INDUSTRIES } from '../lib/validation';

describe('validateAnalyzeInput', () => {
  const validInput = {
    currentProcess: 'This is a valid current process description that is long enough.',
    desiredOutcome: 'I want to improve this process significantly.',
    industry: 'Wealth Management',
  };

  it('accepts valid input', () => {
    const errors = validateAnalyzeInput(validInput);
    expect(errors).toHaveLength(0);
  });

  it('requires currentProcess', () => {
    const errors = validateAnalyzeInput({ ...validInput, currentProcess: '' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toBe('currentProcess');
  });

  it('rejects currentProcess shorter than 10 chars', () => {
    const errors = validateAnalyzeInput({ ...validInput, currentProcess: 'short' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toBe('currentProcess');
    expect(errors[0].message).toContain('10 characters');
  });

  it('rejects currentProcess longer than 10000 chars', () => {
    const errors = validateAnalyzeInput({ ...validInput, currentProcess: 'a'.repeat(10001) });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toBe('currentProcess');
    expect(errors[0].message).toContain('10,000');
  });

  it('requires desiredOutcome', () => {
    const errors = validateAnalyzeInput({ ...validInput, desiredOutcome: '' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field === 'desiredOutcome')).toBe(true);
  });

  it('rejects desiredOutcome shorter than 10 chars', () => {
    const errors = validateAnalyzeInput({ ...validInput, desiredOutcome: 'short' });
    expect(errors.some(e => e.field === 'desiredOutcome')).toBe(true);
  });

  it('rejects desiredOutcome longer than 5000 chars', () => {
    const errors = validateAnalyzeInput({ ...validInput, desiredOutcome: 'a'.repeat(5001) });
    expect(errors.some(e => e.field === 'desiredOutcome')).toBe(true);
  });

  it('requires industry', () => {
    const errors = validateAnalyzeInput({ ...validInput, industry: '' });
    expect(errors.some(e => e.field === 'industry')).toBe(true);
  });

  it('rejects invalid industry', () => {
    const errors = validateAnalyzeInput({ ...validInput, industry: 'Aerospace' });
    expect(errors.some(e => e.field === 'industry')).toBe(true);
    expect(errors.find(e => e.field === 'industry')!.message).toContain('Wealth Management');
  });

  it('accepts all allowed industries', () => {
    for (const industry of ALLOWED_INDUSTRIES) {
      const errors = validateAnalyzeInput({ ...validInput, industry });
      expect(errors).toHaveLength(0);
    }
  });

  it('returns multiple errors at once', () => {
    const errors = validateAnalyzeInput({});
    expect(errors.length).toBe(3); // all three fields missing
  });
});

describe('validateChatInput', () => {
  it('accepts valid input', () => {
    const errors = validateChatInput({
      message: 'What if we add a compliance step?',
      analysisContext: { title: 'Test' },
    });
    expect(errors).toHaveLength(0);
  });

  it('requires message', () => {
    const errors = validateChatInput({ message: '', analysisContext: {} });
    expect(errors.some(e => e.field === 'message')).toBe(true);
  });

  it('rejects message over 2000 chars', () => {
    const errors = validateChatInput({
      message: 'a'.repeat(2001),
      analysisContext: {},
    });
    expect(errors.some(e => e.field === 'message')).toBe(true);
  });

  it('allows missing analysisContext', () => {
    const errors = validateChatInput({ message: 'Hello' });
    expect(errors.some(e => e.field === 'analysisContext')).toBe(false);
  });

  it('rejects non-object analysisContext when provided', () => {
    const errors = validateChatInput({ message: 'Hello', analysisContext: 'bad' as unknown as object });
    expect(errors.some(e => e.field === 'analysisContext')).toBe(true);
  });
});
