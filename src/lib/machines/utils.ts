import { calculateHand } from '../calculateHand';
import type { Card } from '../deck';

export function isHandBlackjack(cards: Card[]) {
  if (cards.length !== 2) return false;
  const { validCounts } = calculateHand(cards);
  return validCounts[0] === 21;
}

export function calcHandInfo(cards: Card[]) {
  const { validCounts, bustCount } = calculateHand(cards);

  const counts = validCounts.length > 0 ? validCounts : [bustCount];

  const finalCount = validCounts[0] ?? bustCount;
  const didBust = validCounts.length === 0 && bustCount > 21;
  const isBlackjack = cards.length === 2 && validCounts[0] === 21;
  return {
    counts,
    finalCount,
    didBust,
    isBlackjack,
  };
}
export function calcualtePlayerRoundResult({ dealerCards, playerCards }: { dealerCards: Card[]; playerCards: Card[] }) {
  const dealerHandInfo = calcHandInfo(dealerCards);
  const playerHandInfo = calcHandInfo(playerCards);

  if (playerHandInfo.finalCount > 21) {
    return 'bust';
  }
  if (dealerHandInfo.finalCount <= 21 && playerHandInfo.finalCount < dealerHandInfo.finalCount) {
    return 'lose';
  }
  if (
    dealerHandInfo.finalCount === dealerHandInfo.finalCount ||
    (dealerHandInfo.isBlackjack && playerHandInfo.isBlackjack)
  ) {
    return 'push';
  }

  if (playerHandInfo.isBlackjack) {
    return 'blackjack';
  }
  return 'win';
}
