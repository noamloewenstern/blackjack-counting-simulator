import { calcHandCount } from './calculateHand';

describe('calculateHand', () => {
  test('should handle no cards', () => {
    expect(() => calcHandCount([])).toThrow(Error);
  });

  test('should handle a numeric card', () => {
    expect(calcHandCount(['7']).validCounts).toEqual([7]);
  });

  test('should handle a face card', () => {
    expect(calcHandCount(['K']).validCounts).toEqual([10]);
  });

  test('should handle an ace', () => {
    expect(calcHandCount(['A']).validCounts).toEqual([11, 1]);
  });

  test('should handle two aces', () => {
    expect(calcHandCount(['A', 'A']).validCounts).toEqual([12, 2]);
  });

  test('should handle a numeric and a face card', () => {
    expect(calcHandCount(['7', 'J']).validCounts).toEqual([17]);
  });

  test('should handle a numeric card and an ace', () => {
    expect(calcHandCount(['7', 'A']).validCounts).toEqual([18, 8]);
  });

  test('should handle a face card and an ace', () => {
    expect(calcHandCount(['J', 'A']).validCounts).toEqual([21, 11]);
  });

  test('should handle multiple aces', () => {
    expect(calcHandCount(['A', 'A', 'A']).validCounts).toEqual([13, 3]);
  });

  test('should remove totals over 21', () => {
    expect(calcHandCount(['K', 'K', 'K']).validCounts).toEqual([]);
    expect(calcHandCount(['A', 'A', 'K']).validCounts).toEqual([12]);
  });

  test('should not contain duplicates', () => {
    const totals = calcHandCount(['A', 'A', 'A']).validCounts;
    const noDuplicates = totals.length === new Set(totals).size;
    expect(noDuplicates).toBe(true);
  });
});
