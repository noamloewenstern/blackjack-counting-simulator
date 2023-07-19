import { calculateHand } from '../calculateHand';
import type { Card } from '../deck';

export function isHandBlackjack(cards: Card[]) {
  if (cards.length !== 2) return false;
  const { validCounts } = calculateHand(cards);
  return validCounts[0] === 21;
}
