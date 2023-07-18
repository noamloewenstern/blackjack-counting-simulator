import { useMemo } from 'react';
import { Card, Hand } from './deck';
import { LRUCache } from 'lru-cache';

type getCardValuesArgs = [Parameters<typeof getCardValues>[0], ReturnType<typeof getCardValues>];
const getCardValuesCache = new LRUCache<getCardValuesArgs[0], getCardValuesArgs[1]>({ max: 1000 });
export function getCardValues(cValue: Card['number']): number[] {
  const cachedValue = getCardValuesCache.get(cValue);
  if (cachedValue) return cachedValue;
  let cardValue: number[];
  switch (cValue) {
    case 'A':
      cardValue = [1, 11];
      break;
    case '2':
      cardValue = [2];
      break;
    case '3':
      cardValue = [3];
      break;
    case '4':
      cardValue = [4];
      break;
    case '5':
      cardValue = [5];
      break;
    case '6':
      cardValue = [6];
      break;
    case '7':
      cardValue = [7];
      break;
    case '8':
      cardValue = [8];
      break;
    case '9':
      cardValue = [9];
      break;
    case '10':
    case 'T':
    case 'J':
    case 'Q':
    case 'K':
      cardValue = [10];
      break;
    default:
      throw new Error(`Unknown card: ${cValue}`);
  }
  getCardValuesCache.set(cValue, cardValue);
  return cardValue;
}

function handToNumberHand(hand: Card[] | Card['number'][]) {
  if (typeof hand[0] === 'object') {
    hand = (hand as Card[]).map(card => card.number);
  } else {
    hand = hand as Card['number'][];
  }
  return hand;
}
const calculateHandCache = new LRUCache<string, ReturnType<typeof calculateHand>>({ max: 2000 });
export function calculateHand(hand: Card[] | Card['number'][]): {
  validCounts: number[];
  bustCount: number;
} {
  let totals = [0];
  if (hand.length === 0) {
    throw new Error('Hand must have at least one card');
  }
  const newHand = handToNumberHand(hand);
  const cachedKey = [...newHand].sort().join(',');
  const cachedResult = calculateHandCache.get(cachedKey);
  if (cachedResult) {
    return cachedResult;
  }

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
  const validTotals = totals.filter(total => total <= 21).sort((a, b) => b - a); // reverse sort
  const result = {
    validCounts: validTotals,
    bustCount: totals[0],
  };
  calculateHandCache.set(cachedKey, result);
  return result;
}

export function isBlackJack(hand: Card[] | Card['number'][]) {
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
