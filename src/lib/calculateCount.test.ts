import { calculateHand } from './calculateHand'; // Assuming you export your function from blackjack.ts file.

describe('calculateHand', () => {
  test('should handle no cards', () => {
    expect(() => calculateHand([])).toThrow(Error);
  });

  test('should handle a numeric card', () => {
    expect(calculateHand(['7']).validCounts).toEqual([7]);
  });

  test('should handle a face card', () => {
    expect(calculateHand(['K']).validCounts).toEqual([10]);
  });

  test('should handle an ace', () => {
    expect(calculateHand(['A']).validCounts).toEqual([11, 1]);
  });

  test('should handle two aces', () => {
    expect(calculateHand(['A', 'A']).validCounts).toEqual([12, 2]);
  });

  test('should handle a numeric and a face card', () => {
    expect(calculateHand(['7', 'J']).validCounts).toEqual([17]);
  });

  test('should handle a numeric card and an ace', () => {
    expect(calculateHand(['7', 'A']).validCounts).toEqual([18, 8]);
  });

  test('should handle a face card and an ace', () => {
    expect(calculateHand(['J', 'A']).validCounts).toEqual([21, 11]);
  });

  test('should handle multiple aces', () => {
    expect(calculateHand(['A', 'A', 'A']).validCounts).toEqual([13, 3]);
  });

  test('should remove totals over 21', () => {
    expect(calculateHand(['K', 'K', 'K']).validCounts).toEqual([]);
    expect(calculateHand(['A', 'A', 'K']).validCounts).toEqual([12]);
  });

  test('should not contain duplicates', () => {
    const totals = calculateHand(['A', 'A', 'A']).validCounts;
    const noDuplicates = totals.length === new Set(totals).size;
    expect(noDuplicates).toBe(true);
  });
});
