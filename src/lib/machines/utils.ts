import { calcHandCount } from '../calculateHand';
import type { Card, RoundHandResult } from '../deck';

export function isHandBlackjack(cards: Card[]) {
  if (cards.length !== 2) return false;
  const { validCounts } = calcHandCount(cards);
  return validCounts[0] === 21;
}

export function calcHandInfo(cards: Card[]) {
  const { validCounts, bustCount } = calcHandCount(cards);

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
export function calcHandRoundResult({
  dealerHandInfo,
  playerHandInfo,
}: {
  dealerHandInfo: ReturnType<typeof calcHandInfo>;
  playerHandInfo: ReturnType<typeof calcHandInfo>;
}): RoundHandResult {
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
