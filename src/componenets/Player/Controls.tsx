import { calculateHand, getCardValues } from '../../lib/calculateHand';
import { getActionByStrategy } from '../../lib/strategies/perfect-blackjack';
import { useGameStore } from '../../stores/gameStore';
import { usePlayer } from './PlayerContext';

export default function Controls() {
  const { player, counts } = usePlayer();
  const [hit, stand, double] = useGameStore(state => [state.hit, state.stand, state.double]);
  const isCurrentTurn = useGameStore(state => state.currentPlayerId === player.id);
  let visibleDealerCount = useGameStore(state => state.visibleDealerCount());
  visibleDealerCount = Array.isArray(visibleDealerCount) ? visibleDealerCount[0] : visibleDealerCount;
  // const strategyByPlayer = player.strategy;
  const count = calculateHand(player.hand);
  const recommendedAction =
    visibleDealerCount && counts?.validCounts[0] ? getActionByStrategy(player.hand, visibleDealerCount) : undefined;

  console.table({ recommendedAction, visibleDealerCount, hand: player.hand.map(c => c.number) });

  const handleDouble = async () => {
    try {
      await double(player.id);
    } catch (err) {
      console.log(err);
      alert(err);
    }
  };
  const strategy = {
    recommendation: recommendedAction,
    styles: 'border-4 border-orange-300 rounded',
  };

  return (
    <div className='actions flex justify-center gap-4'>
      <button
        disabled={!isCurrentTurn}
        onClick={() => hit(player.id)}
        className={`
   ${isCurrentTurn ? 'bg-blue-500 hover:bg-blue-700' : 'disabled'}
    text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none disabled:hover
    ${strategy.recommendation === 'H' ? strategy.styles : ''}}`}
      >
        Hit
      </button>

      <button
        disabled={!isCurrentTurn}
        onClick={handleDouble}
        className={`${isCurrentTurn ? 'bg-purple-600 hover:bg-purple-700' : 'disabled'}
     text-white font-bold py-2 px-4 rounded
     ${strategy.recommendation === 'D' ? strategy.styles : ''}
   `}
      >
        Double
      </button>
      <button
        disabled={!isCurrentTurn}
        onClick={() => stand(player.id)}
        className={`
   ${isCurrentTurn ? 'bg-green-500 hover:bg-green-700' : 'disabled'}
    text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none
    ${strategy.recommendation === 'S' ? strategy.styles : ''}
    `}
      >
        Stand
      </button>
    </div>
  );
}
