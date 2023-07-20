import { useMemo } from 'react';
import { calcHandCount } from '~/lib/calculateHand';
import { useGameMachine } from '~/lib/machines/gameMachineContext';
import { dealerHasFinalHand } from '../machines/utils';
import { useSettingsStore } from '~/stores/settingsStore';

export function useDealerCount() {
  const { state } = useGameMachine();
  const dealerMustHitOnSoft17 = useSettingsStore(state => state.dealerMustHitOnSoft17);
  const dealer = state.context.dealer;
  const dealerCards = dealer.hand.cards;
  const dealerHasCards = dealerCards.length > 0;

  const allPlayersFinishedRound = useMemo(
    () => state.context.players.every(player => player.hands.every(hand => hand.isFinished)),
    [state.context.players],
  );
  const { validCounts, bustCount } = useMemo(() => {
    if (!dealerHasCards) return { validCounts: [], bustCount: 0 };
    return calcHandCount(dealerCards);
  }, [dealerCards, dealerHasCards]);

  const { validCounts: visibleValidCounts, bustCount: VisibleBustCount } = useMemo(() => {
    if (allPlayersFinishedRound) {
      return {
        validCounts,
        bustCount,
      };
    }
    if (!dealerHasCards || dealerCards.length === 1) return { validCounts: [], bustCount: 0 };
    return calcHandCount(dealerCards.slice(1));
  }, [dealerHasCards, allPlayersFinishedRound, dealerCards, validCounts, bustCount]);
  const isFinalHand = dealerCards.length > 0 && dealerHasFinalHand(validCounts, { dealerMustHitOnSoft17 });
  const includeNonVisible = {
    finalCount: validCounts[0] ?? bustCount,
    validCounts,
    bustCount,
    didBust: validCounts.length === 0 && bustCount > 21,
    isBlackjack: dealerCards.length === 2 && validCounts[0] === 21,
    isFinalHand,
    dealerCards,
  };
  const visible = dealerCards[0]?.isVisible
    ? includeNonVisible
    : {
        finalCount: visibleValidCounts[0] ?? VisibleBustCount,
        validCounts: visibleValidCounts,
        bustCount: VisibleBustCount,
        didBust: visibleValidCounts.length === 0 && VisibleBustCount > 21,
        isBlackjack: dealerCards.length === 2 && visibleValidCounts[0] === 21,
        isFinalHand,
        dealerCards,
      };

  return {
    visible,
    includeNonVisible,
  };
}
