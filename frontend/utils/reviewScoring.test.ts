import { describe, expect, it } from 'vitest';
import { isPassingScore } from './reviewScoring';

describe('isPassingScore', () => {
  it('passes when score is 4 out of 5', () => {
    expect(isPassingScore(4, 4)).toBe(true);
  });

  it('passes when score is above threshold', () => {
    expect(isPassingScore(5, 4)).toBe(true);
  });

  it('fails when score is below threshold', () => {
    expect(isPassingScore(3, 4)).toBe(false);
  });
});





