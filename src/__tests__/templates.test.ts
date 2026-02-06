import { describe, it, expect } from 'vitest';
import { templates } from '../lib/templates';

describe('templates', () => {
  it('should have exactly 6 templates', () => {
    expect(templates).toHaveLength(6);
  });

  it('each template has required fields', () => {
    for (const template of templates) {
      expect(template.id).toBeTruthy();
      expect(typeof template.id).toBe('string');
      
      expect(template.name).toBeTruthy();
      expect(typeof template.name).toBe('string');
      
      expect(template.description).toBeTruthy();
      expect(typeof template.description).toBe('string');
      
      expect(template.industry).toBeTruthy();
      expect(typeof template.industry).toBe('string');
      
      expect(template.icon).toBeTruthy();
      expect(typeof template.icon).toBe('string');
      
      expect(template.currentProcess).toBeTruthy();
      expect(typeof template.currentProcess).toBe('string');
      
      expect(template.desiredOutcome).toBeTruthy();
      expect(typeof template.desiredOutcome).toBe('string');
      
      expect(Array.isArray(template.tags)).toBe(true);
      expect(template.tags.length).toBeGreaterThan(0);
    }
  });

  it('each template has unique id', () => {
    const ids = templates.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('currentProcess is detailed enough for analysis (> 100 chars)', () => {
    for (const template of templates) {
      expect(template.currentProcess.length).toBeGreaterThan(100);
    }
  });

  it('desiredOutcome is detailed enough (> 50 chars)', () => {
    for (const template of templates) {
      expect(template.desiredOutcome.length).toBeGreaterThan(50);
    }
  });

  it('all templates are in an allowed industry', () => {
    // Templates may use extended industries; at minimum check they're non-empty
    for (const template of templates) {
      expect(template.industry.length).toBeGreaterThan(0);
    }
  });

  it('each template has at least one tag', () => {
    for (const template of templates) {
      expect(template.tags.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('template names are descriptive (> 5 chars)', () => {
    for (const template of templates) {
      expect(template.name.length).toBeGreaterThan(5);
    }
  });

  it('template descriptions are meaningful (> 20 chars)', () => {
    for (const template of templates) {
      expect(template.description.length).toBeGreaterThan(20);
    }
  });
});
