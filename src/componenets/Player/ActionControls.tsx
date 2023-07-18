import { getActionByStrategy } from '../../lib/strategies/perfect-blackjack';
import { useGameStore } from '../../stores/gameStore';
import { usePlayer } from './PlayerContext';
import { useSettingsStore } from '../../stores/settingsStore';

export default function ActionControls() {
  const { player, counts } = usePlayer();
  const [hit, stand, double] = useGameStore(state => [state.hit, state.stand, state.double]);
  const isCurrentTurn = useGameStore(state => state.currentPlayerId === player.id);
  let visibleDealerCount = useGameStore(state => state.visibleDealerCount)();
  visibleDealerCount = Array.isArray(visibleDealerCount) ? visibleDealerCount[0] : visibleDealerCount;
  const allowedToDoubleAfterSplit = useSettingsStore(state => state.allowedToDoubleAfterSplit);
  // const strategyByPlayer = player.strategy;
  // const count = calculateHand(player.hand);
  const canDouble = player.balance - player.bet >= 0 && player.hand.length === 2;
  const recommendedAction =
    (visibleDealerCount &&
      counts?.validCounts[0] &&
      getActionByStrategy(player.hand, visibleDealerCount, {
        allowedToDoubleAfterSplit,
        canDouble,
      })) ||
    undefined;

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
        disabled={!isCurrentTurn}
        onClick={() => hit(player.id)}
        className={`
        ${strategy.recommendation === 'H' ? strategy.styles : ''}
      ${isCurrentTurn ? 'bg-blue-500 hover:bg-blue-700' : 'disabled'}
      text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none disabled:hover
    `}
      >
        Hit
      </button>

      <button
        disabled={!canDouble || !isCurrentTurn}
        onClick={() => double(player.id)}
        className={`
        ${strategy.recommendation === 'D' ? strategy.styles : ''}
        ${isCurrentTurn ? 'bg-purple-600 hover:bg-purple-700' : 'disabled'}
     text-white font-bold py-2 px-4 rounded

   `}
      >
        Double
      </button>
      <button
        disabled={!isCurrentTurn}
        onClick={() => stand(player.id)}
        className={`
        ${strategy.recommendation === 'S' ? strategy.styles : ''}
   ${isCurrentTurn ? 'bg-green-500 hover:bg-green-700' : 'disabled'}
    text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none

    `}
      >
        Stand
      </button>
    </div>
  );
}
