import { describe, it, expect } from 'vitest';
import type { AIResponse, ProcessStep, OptimizationOption } from '../lib/types';

/**
 * Tests that AI JSON responses parse correctly into the expected structures.
 * This validates the contract between the AI response and our frontend types.
 */

function parseAIResponse(jsonString: string): AIResponse {
  let text = jsonString.trim();
  // Strip markdown code fences if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(text);
}

const VALID_AI_RESPONSE = JSON.stringify({
  title: 'Client Onboarding Optimization',
  currentState: {
    steps: [
      { id: '1', label: 'Client Inquiry', type: 'start', connections: ['2'], description: 'Client contacts advisor' },
      { id: '2', label: 'Collect Info', type: 'process', connections: ['3'], description: 'Advisor collects client info' },
      { id: '3', label: 'KYC Review', type: 'bottleneck', connections: ['4'], description: 'Manual KYC review takes 3-5 days' },
      { id: '4', label: 'Complete', type: 'end', connections: [] },
    ],
    bottlenecks: [
      { stepId: '3', reason: 'Manual review creates a 3-5 day delay' },
    ],
  },
  options: [
    {
      name: 'Digital KYC',
      description: 'Automated KYC verification',
      improvement: '80% faster',
      steps: [
        { id: '1', label: 'Client Inquiry', type: 'start', connections: ['2'] },
        { id: '2', label: 'Digital Portal', type: 'process', connections: ['3'] },
        { id: '3', label: 'Auto KYC', type: 'process', connections: ['4'] },
        { id: '4', label: 'Complete', type: 'end', connections: [] },
      ],
    },
    {
      name: 'Hybrid Approach',
      description: 'Partially automated',
      improvement: '50% faster',
      steps: [
        { id: '1', label: 'Start', type: 'start', connections: ['2'] },
        { id: '2', label: 'Process', type: 'process', connections: ['3'] },
        { id: '3', label: 'End', type: 'end', connections: [] },
      ],
    },
    {
      name: 'Full Automation',
      description: 'Complete end-to-end',
      improvement: '90% faster',
      steps: [
        { id: '1', label: 'Start', type: 'start', connections: ['2'] },
        { id: '2', label: 'Auto Process', type: 'process', connections: ['3'] },
        { id: '3', label: 'End', type: 'end', connections: [] },
      ],
    },
  ],
  comparison: [
    { metric: 'Total Time', current: '15 days', option1: '3 days', option2: '7 days', option3: '1 day' },
    { metric: 'Manual Steps', current: '8', option1: '3', option2: '5', option3: '1' },
  ],
});

describe('AI Response Parser', () => {
  it('parses a valid response correctly', () => {
    const result = parseAIResponse(VALID_AI_RESPONSE);
    expect(result.title).toBe('Client Onboarding Optimization');
    expect(result.currentState.steps).toHaveLength(4);
    expect(result.currentState.bottlenecks).toHaveLength(1);
    expect(result.options).toHaveLength(3);
    expect(result.comparison).toHaveLength(2);
  });

  it('strips markdown code fences', () => {
    const wrapped = '```json\n' + VALID_AI_RESPONSE + '\n```';
    const result = parseAIResponse(wrapped);
    expect(result.title).toBe('Client Onboarding Optimization');
  });

  it('strips code fences without json language tag', () => {
    const wrapped = '```\n' + VALID_AI_RESPONSE + '\n```';
    const result = parseAIResponse(wrapped);
    expect(result.title).toBe('Client Onboarding Optimization');
  });

  it('validates step structure', () => {
    const result = parseAIResponse(VALID_AI_RESPONSE);
    const firstStep = result.currentState.steps[0];
    
    expect(firstStep.id).toBeDefined();
    expect(firstStep.label).toBeDefined();
    expect(firstStep.type).toBeDefined();
    expect(Array.isArray(firstStep.connections)).toBe(true);
  });

  it('validates step types are correct', () => {
    const result = parseAIResponse(VALID_AI_RESPONSE);
    const validTypes = ['start', 'process', 'decision', 'handoff', 'bottleneck', 'end'];
    
    for (const step of result.currentState.steps) {
      expect(validTypes).toContain(step.type);
    }
  });

  it('validates all connections reference existing step IDs', () => {
    const result = parseAIResponse(VALID_AI_RESPONSE);
    const stepIds = new Set(result.currentState.steps.map((s: ProcessStep) => s.id));
    
    for (const step of result.currentState.steps) {
      for (const conn of step.connections) {
        expect(stepIds.has(conn)).toBe(true);
      }
    }
  });

  it('validates bottleneck stepIds reference existing steps', () => {
    const result = parseAIResponse(VALID_AI_RESPONSE);
    const stepIds = new Set(result.currentState.steps.map((s: ProcessStep) => s.id));
    
    for (const bottleneck of result.currentState.bottlenecks) {
      expect(stepIds.has(bottleneck.stepId)).toBe(true);
    }
  });

  it('validates each option has required fields', () => {
    const result = parseAIResponse(VALID_AI_RESPONSE);
    
    for (const option of result.options) {
      expect(option.name).toBeDefined();
      expect(option.description).toBeDefined();
      expect(option.improvement).toBeDefined();
      expect(Array.isArray(option.steps)).toBe(true);
      expect(option.steps.length).toBeGreaterThan(0);
    }
  });

  it('validates each option starts with start and ends with end', () => {
    const result = parseAIResponse(VALID_AI_RESPONSE);
    
    for (const option of result.options) {
      const types = option.steps.map((s: ProcessStep) => s.type);
      expect(types[0]).toBe('start');
      expect(types[types.length - 1]).toBe('end');
    }
  });

  it('validates comparison has metric and current fields', () => {
    const result = parseAIResponse(VALID_AI_RESPONSE);
    
    for (const row of result.comparison) {
      expect(row.metric).toBeDefined();
      expect(row.current).toBeDefined();
    }
  });

  it('throws on invalid JSON', () => {
    expect(() => parseAIResponse('not json')).toThrow();
  });

  it('handles response with extra whitespace', () => {
    const result = parseAIResponse('  \n  ' + VALID_AI_RESPONSE + '  \n  ');
    expect(result.title).toBeDefined();
  });
});
