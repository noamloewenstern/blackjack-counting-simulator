import { getActionByStrategy } from '~/lib/strategies/perfect-blackjack';
import { useSettingsStore } from '~/stores/settingsStore';
import { useGameMachine } from '~/lib/machines/gameMachineContext';
import { useDealerCount } from '~/lib/hooks/useDealerCount';
import usePlayerHand from '../hooks/usePlayerHand';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export default function ActionControls() {
  const { send } = useGameMachine();
  const { hand, isCurrentTurnHand, player } = usePlayerHand();

  const hit = useCallback(() => isCurrentTurnHand && send({ type: 'HIT' }), [isCurrentTurnHand, send]);
  const double = useCallback(() => isCurrentTurnHand && send({ type: 'DOUBLE' }), [isCurrentTurnHand, send]);
  const stand = useCallback(() => isCurrentTurnHand && send({ type: 'STAND' }), [isCurrentTurnHand, send]);
  const split = useCallback(() => isCurrentTurnHand && send({ type: 'SPLIT' }), [isCurrentTurnHand, send]);

  const { visible: visibleDealerCount } = useDealerCount();
  const { allowedToDoubleAfterSplit, automateInteractivePlayer } = useSettingsStore();
  const canDouble = hand.cards.length === 2;
  const canSplit = hand.cards.length === 2 && hand.cards[0]!.value === hand.cards[1]!.value;

  const recommendedAction = useMemo(
    () =>
      getActionByStrategy(hand.cards, visibleDealerCount.validCounts[0]!, {
        allowedToDoubleAfterSplit,
        canDouble,
      }) || undefined,
    [allowedToDoubleAfterSplit, canDouble, hand.cards, visibleDealerCount.validCounts],
  );
  const strategy = {
    recommendation: recommendedAction,
    styles: 'border-4 border-orange-300 rounded',
  };

  /* AutomatePlayerActionForBots */
  useEffect(() => {
    if (!isCurrentTurnHand || (player.strategy === 'interactive' && !automateInteractivePlayer)) return;
    const actionMap = {
      H: hit,
      S: stand,
      D: double,
      SP: split,
    } as const;
    const sendAction = actionMap[strategy.recommendation];
    setTimeout(() => {
      console.log(`player: ${player.id}: sendAction`, strategy.recommendation);

      sendAction();
    }, 300);
  }, [
    double,
    hit,
    isCurrentTurnHand,
    split,
    stand,
    strategy.recommendation,
    hand.cards.length,
    player.strategy,
    automateInteractivePlayer,
    player.id,
  ]);

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
