import { getActionByStrategy } from '~/lib/strategies/perfect-blackjack';
import { useSettingsStore } from '~/stores/settingsStore';
import { useGameMachine } from '~/lib/machines/gameMachineContext';
import { useDealerCount } from '~/lib/hooks/useDealerCount';
import usePlayerHand from '../hooks/usePlayerHand';

export default function ActionControls() {
  const { send } = useGameMachine();
  const { hand, player, isCurrentTurnHand, currentTurnInfo } = usePlayerHand();

  const hit = () => isCurrentTurnHand && send({ type: 'HIT' });
  const double = () => isCurrentTurnHand && send({ type: 'DOUBLE' });
  const stand = () => isCurrentTurnHand && send({ type: 'STAND' });

  const { visible: visibleDealerCount } = useDealerCount();
  const { allowedToDoubleAfterSplit } = useSettingsStore();
  const canDouble = hand.cards.length === 2 && hand.cards[0]!.value === hand.cards[1]!.value;

  const recommendedAction =
    getActionByStrategy(hand.cards, visibleDealerCount.validCounts[0]!, {
      allowedToDoubleAfterSplit,
      canDouble,
    }) || undefined;

  const strategy = {
    recommendation: recommendedAction,
    styles: 'border-4 border-orange-300 rounded',
  };
  // const alreadyClicked = useRef(false);
  // useEffect(() => {
  //   // if (!isCurrentTurn || alreadyClicked.current) return;
  //   if (!isCurrentTurn) return;

  //   switch (recommendedAction) {
  //     case 'H':
  //       hit(player.id);
  //       break;
  //     case 'S':
  //       stand(player.id);
  //       break;
  //     case 'D':
  //       double(player.id);
  //       break;
  //     default:
  //       throw new Error('Invalid action');
  //   }
  //   // alreadyClicked.current = true;
  // }, [double, hit, isCurrentTurn, player.id, recommendedAction, stand]);

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
