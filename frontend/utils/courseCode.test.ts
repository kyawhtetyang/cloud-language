import { describe, expect, it } from 'vitest';
import { resolveCurrentCourseCode } from './courseCode';

describe('resolveCurrentCourseCode', () => {
  it('renders CEFR course labels from backend framework fields', () => {
    const lessons = [
      { framework: 'cefr', frameworkLevel: 'A1', frameworkUnit: 1 },
      { framework: 'cefr', frameworkLevel: 'A1', frameworkUnit: 2 },
    ];

    expect(resolveCurrentCourseCode(lessons, 1)).toBe('A1 Unit 2');
  });

  it('renders HSK labels without UI-side scheme inference', () => {
    const lessons = [
      { framework: 'hsk', frameworkLevel: 'HSK 1', frameworkUnit: 1 },
      { framework: 'hsk', frameworkLevel: 'HSK 1', frameworkUnit: 2 },
    ];

    expect(resolveCurrentCourseCode(lessons, 1)).toBe('HSK 1 Unit 2');
  });

  it('supports JLPT tracks from backend-provided framework labels', () => {
    const lessons = [
      { framework: 'jlpt', frameworkLevel: 'JLPT N5', frameworkUnit: 1 },
      { framework: 'jlpt', frameworkLevel: 'JLPT N5', frameworkUnit: 2 },
    ];

    expect(resolveCurrentCourseCode(lessons, 0)).toBe('JLPT N5 Unit 1');
  });

  it('returns empty label when backend framework metadata is missing', () => {
    const lessons = [
      { framework: 'cefr', frameworkLevel: 'A1' },
      { frameworkLevel: 'A1', frameworkUnit: 2 },
    ];

    expect(resolveCurrentCourseCode(lessons, 0)).toBe('');
    expect(resolveCurrentCourseCode(lessons, 1)).toBe('');
  });
});

