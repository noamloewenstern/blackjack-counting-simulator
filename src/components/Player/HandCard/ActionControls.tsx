import { getActionByStrategy } from '~/lib/strategies/perfect-blackjack';
import { useAutomationSettingsStore, useSettingsStore } from '~/stores/settingsStore';
import { useDealerCount } from '~/lib/hooks/useDealerCount';
import usePlayerHand from '../hooks/usePlayerHand';
import { useEffect, useMemo } from 'react';
import { Card } from '~/lib/deck';

/* AutomatePlayerActionForBots */
function useAutoPlayAction({ recommendedAction }: { recommendedAction: ReturnType<typeof useGetRecommendedAction> }) {
  const { hand, isCurrentTurnHand, player, actions } = usePlayerHand();
  const { hit, double, stand, split } = actions;
  const { cards } = hand;
  const {
    isOn: automateInteractivePlayer,
    intervalWaits: { playerAction: playerActionTimeout },
  } = useAutomationSettingsStore();

  useEffect(() => {
    if (!isCurrentTurnHand) return;
    if (player.strategy === 'interactive' && !automateInteractivePlayer) return;
    const actionMap = {
      H: hit,
      S: stand,
      D: double,
      SP: split,
    } as const;
    const sendAction = actionMap[recommendedAction];
    setTimeout(() => {
      sendAction();
    }, playerActionTimeout);
  }, [
    double,
    hit,
    isCurrentTurnHand,
    split,
    stand,
    cards.length,
    player.strategy,
    automateInteractivePlayer,
    player.id,
    playerActionTimeout,
    recommendedAction,
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
  const { hand, isCurrentTurnHand, canDouble, canSplit, actions } = usePlayerHand();
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
        disabled={!isCurrentTurnHand}
        onClick={hit}
        className={`
        ${strategy.recommendation === 'H' ? strategy.styles : ''}
      ${isCurrentTurnHand ? 'bg-blue-500 hover:bg-blue-700' : 'disabled'}
      text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none disabled:hover
    `}
      >
        Hit
      </button>

      {canDouble && (
        <button
          disabled={!canDouble || !isCurrentTurnHand}
          onClick={double}
          className={`
        ${strategy.recommendation === 'D' ? strategy.styles : ''}
        ${isCurrentTurnHand ? 'bg-purple-600 hover:bg-purple-700' : 'disabled'}
     text-white font-bold py-2 px-4 rounded

   `}
        >
          Double
        </button>
      )}
      {canSplit && (
        <button
          disabled={!isCurrentTurnHand}
          onClick={split}
          className={`
        ${strategy.recommendation === 'SP' ? strategy.styles : ''}
   ${isCurrentTurnHand ? 'bg-purple-600 hover:bg-purple-700' : 'disabled'}
    text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none

    `}
        >
          Split
        </button>
      )}
      <button
        disabled={!isCurrentTurnHand}
        onClick={stand}
        className={`
        ${strategy.recommendation === 'S' ? strategy.styles : ''}
   ${isCurrentTurnHand ? 'bg-green-500 hover:bg-green-700' : 'disabled'}
    text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none

    `}
      >
        Stand
      </button>
    </div>
  );
}
