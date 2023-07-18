import { useMemo } from 'react';
import { Card, Hand } from './deck';
import { LRUCache } from 'lru-cache';
import { groupBy, raiseError } from '~/utils/helpers';

// type getCardValuesArgs = [Parameters<typeof getCardValues>[0], ReturnType<typeof getCardValues>];
const mappedCardValue = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  T: 10,
  J: 10,
  Q: 10,
  K: 10,
} as const;
// const getCardValuesCache = new LRUCache<getCardValuesArgs[0], getCardValuesArgs[1]>({ max: 1000 });
export function getCardValues(cValue: Card['value']): readonly number[] {
  const cardValue =
    cValue === 'A' ? ([1, 11] as const) : ([mappedCardValue[cValue] ?? raiseError('Error Value')] as const);

  return cardValue;
}
function handToNumberHand(hand: Card[] | Card['value'][]) {
  if (typeof hand[0] === 'object') {
    hand = (hand as Card[]).map(card => card.value);
  } else {
    hand = hand as Card['value'][];
  }
  return hand;
}
const calculateHandCache = new LRUCache<string, ReturnType<typeof calculateHand>>({ max: 2000 });
export function calculateHand(hand: Card[] | Card['value'][]): {
  validCounts: number[];
  bustCount: number;
} {
  if (hand.length === 0) {
    throw new Error('Hand must have at least one card');
  }
  const newHand = handToNumberHand(hand);
  const cachedKey = [...newHand].sort().join(',');
  const cachedResult = calculateHandCache.get(cachedKey);
  if (cachedResult) {
    return cachedResult;
  }

  if (!newHand.includes('A')) {
    const total = newHand.reduce((a, b) => a + getCardValues(b)![0]!, 0);
    return {
      validCounts: total <= 21 ? [total] : [],
      bustCount: total > 21 ? total : 0,
    };
  }

  let totals = [0];
  for (const card of newHand) {
    const newTotals = [];
    const cardValues = getCardValues(card);
    for (const total of totals) {
      for (const value of cardValues) {
        newTotals.push(total + value);
      }
    }
    // remove duplicates and sort
    totals = [...new Set(newTotals)].sort((a, b) => a - b);
  }
  // const validTotals = totals.filter(total => total <= 21).sort((a, b) => b - a); // reverse sort
  const groupsCounts = groupBy(
    totals.sort((a, b) => b - a),
    total => (total <= 21 ? 'validCounts' : 'bustCount'),
  );
  const result = {
    validCounts: groupsCounts.get('validCounts') ?? [],
    bustCount: groupsCounts.get('bustCount')?.[0] ?? 0,
  };
  calculateHandCache.set(cachedKey, result);
  return result;
}

export function isBlackJack(hand: Card[] | Card['value'][]) {
  if (hand.length !== 2) {
    return false;
  }
  hand = handToNumberHand(hand);
  const { validCounts } = calculateHand(hand);
  return validCounts[0] === 21;
}

export function useHasBlackjack(hand: Hand) {
  return useMemo(() => {
    return hand.length === 2 && calculateHand(hand).validCounts[0] === 21;
  }, [hand]);
}
