import { useMemo } from 'react';
import { calculateHand } from '~/lib/calculateHand';
import { useGameMachine } from '~/lib/machines/gameMachineContext';

export function useDealerCount() {
  const { state } = useGameMachine();
  const dealer = state.context.dealer;
  const dealerCards = dealer.hand.cards;

  const allPlayersFinishedRound = useMemo(
    () => state.context.players.every(player => player.hands.every(hand => hand.isFinished)),
    [state.context.players],
  );
  const { validCounts, bustCount } = useMemo(() => calculateHand(dealerCards), [dealerCards]);
  const { validCounts: visibleValidCounts, bustCount: VisibleBustCount } = useMemo(() => {
    if (allPlayersFinishedRound) {
      return {
        validCounts,
        bustCount,
      };
    }
    return calculateHand(dealerCards.slice(1));
  }, [allPlayersFinishedRound, dealerCards, validCounts, bustCount]);
  const includeNonVisible = {
    finalCount: validCounts[0] ?? bustCount,
    validCounts,
    bustCount,
    didBust: validCounts.length === 0 && bustCount > 21,
    isBlackjack: dealerCards.length === 2 && validCounts[0] === 21,
  };
  const visible = dealerCards[0]?.isVisible
    ? includeNonVisible
    : {
        finalCount: validCounts[0] ?? bustCount,
        validCounts: visibleValidCounts,
        bustCount: VisibleBustCount,
        didBust: visibleValidCounts.length === 0 && VisibleBustCount > 21,
        isBlackjack: dealerCards.length === 2 && visibleValidCounts[0] === 21,
      };

  return {
    visible,
    includeNonVisible,
  };
}