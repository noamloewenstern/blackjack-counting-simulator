import { getActionByStrategy } from '~/lib/strategies/perfect-blackjack';
import { useAutomationSettingsStore, useSettingsStore } from '~/stores/settingsStore';
import { useDealerCount } from '~/lib/hooks/useDealerCount';
import usePlayerHand from '../hooks/usePlayerHand';
import { useEffect, useMemo } from 'react';
import { type Card } from '~/lib/deck';

/* AutomatePlayerActionForBots */
function useAutoPlayAction({ recommendedAction }: { recommendedAction: ReturnType<typeof useGetRecommendedAction> }) {
  const { isHandCurrentTurn, player, actions, hand } = usePlayerHand();
  const { hit, double, stand, split } = actions;
  const {
    isOn: automateInteractivePlayer,
    intervalWaits: { playerAction: playerActionTimeout },
  } = useAutomationSettingsStore();

  const actionMap = {
    H: hit,
    S: stand,
    D: double,
    SP: split,
  } as const;
  const sendAction = actionMap[recommendedAction];
  const _assureEffectTriggeredWhenNumberCardsChange = hand.cards.length;

  useEffect(() => {
    if (!isHandCurrentTurn) return;
    if (player.strategy === 'interactive' && !automateInteractivePlayer) return;

    _assureEffectTriggeredWhenNumberCardsChange; // don't remove
    setTimeout(() => {
      sendAction();
    }, playerActionTimeout);
  }, [
    automateInteractivePlayer,
    isHandCurrentTurn,
    player.id,
    player.strategy,
    playerActionTimeout,
    sendAction,
    _assureEffectTriggeredWhenNumberCardsChange,
  ]);
}
function useGetRecommendedAction({ cards }: { cards: Card[] }) {
  const { visible: visibleDealerCount } = useDealerCount();
  const { allowedToDoubleAfterSplit, allowedToDouble } = useSettingsStore();
  const recommendedAction = useMemo(
    () =>
      getActionByStrategy(
        cards.map(card => card.value),
        visibleDealerCount.validCounts[0]!,
        {
          allowedToDoubleAfterSplit,
          allowedToDouble,
        },
      ) || undefined,
    [allowedToDouble, allowedToDoubleAfterSplit, cards, visibleDealerCount.validCounts],
  );
  return recommendedAction;
}
export default function ActionControls() {
  const { hand, isHandCurrentTurn, canDouble, canSplit, actions } = usePlayerHand();
  const { hit, double, stand, split } = actions;
  const { cards } = hand;

  const recommendedAction = useGetRecommendedAction({ cards });

  const strategy = {
    recommendation: recommendedAction,
    styles: 'border-4 border-orange-300 rounded',
  };

  useAutoPlayAction({ recommendedAction });

  return (
    <div className='actions flex justify-center gap-4'>
      <button
        disabled={!isHandCurrentTurn}
        onClick={hit}
        className={`
            ${strategy.recommendation === 'H' ? strategy.styles : ''}
            ${isHandCurrentTurn ? 'bg-blue-500 hover:bg-blue-700' : 'disabled'}
           text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none disabled:hover
    `}
      >
        Hit
      </button>

      {canDouble && (
        <button
          disabled={!isHandCurrentTurn}
          onClick={double}
          className={`
             ${strategy.recommendation === 'D' ? strategy.styles : ''}
             ${isHandCurrentTurn ? 'bg-purple-600 hover:bg-purple-700' : 'disabled'}
           text-white font-bold py-2 px-4 rounded

   `}
        >
          Double
        </button>
      )}
      {canSplit && (
        <button
          disabled={!isHandCurrentTurn}
          onClick={split}
          className={`
            ${strategy.recommendation === 'SP' ? strategy.styles : ''}
            ${isHandCurrentTurn ? 'bg-purple-600 hover:bg-purple-700' : 'disabled'}
          text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none
    `}
        >
          Split
        </button>
      )}
      <button
        disabled={!isHandCurrentTurn}
        onClick={stand}
        className={`
            ${strategy.recommendation === 'S' ? strategy.styles : ''}
            ${isHandCurrentTurn ? 'bg-green-500 hover:bg-green-700' : 'disabled'}
          text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none

    `}
      >
        Stand
      </button>
    </div>
  );
}
