import Card from './Card';
import { calculateHand } from '../lib/calculateHand';
import { useGameMachine } from '~/lib/machines/gameMachineContext';
import { useMemo } from 'react';

function DealerHand() {
  const { isRoundFinished } = useGameMachine();

  return (
    <div className='h-60'>
      <div>
        <h2 className='text-xl font-bold'>
          Dealer
          {isRoundFinished && <EndGameDealerMessage />}
        </h2>
        <DealerCount />
      </div>
      <DealerCards />
    </div>
  );
}
function useDealerCount() {
  const { state } = useGameMachine();
  const dealer = state.context.dealer;
  const allPlayersFinishedRound = useMemo(
    () => state.context.players.every(player => player.hands.every(hand => hand.isFinished)),
    [state.context.players],
  );
  const { validCounts, bustCount } = useMemo(() => {
    const cards = allPlayersFinishedRound ? dealer.hand.cards : dealer.hand.cards.slice(1);
    return calculateHand(cards);
  }, [dealer.hand.cards, allPlayersFinishedRound]);
  const visibleDealerCount = validCounts.length > 0 ? validCounts : bustCount;
  const didBust = validCounts.length === 0 && bustCount > 21;
  return {
    validCounts,
    bustCount,
    visibleDealerCount,
    didBust,
  };
}

function DealerCount() {
  const { visibleDealerCount, didBust } = useDealerCount();

  return (
    visibleDealerCount && (
      <h3 className='text-lg ml-2 font-bold'>
        Count:{` `}
        <span className={`text-xl font-bold ${didBust ? 'text-red-700' : 'text-green-600'}`}>
          {Array.isArray(visibleDealerCount) && visibleDealerCount.length > 0
            ? visibleDealerCount.join(' | ')
            : visibleDealerCount}
        </span>
      </h3>
    )
  );
}
function DealerCards() {
  const { state } = useGameMachine();
  const dealer = state.context.dealer;
  return (
    <div className='dealer min-h-24 rounded-lg p-4 flex justify-center gap-4 text-white'>
      {dealer.hand.cards.map((card, index) => (
        <Card card={card} key={index} />
      ))}
    </div>
  );
}
function EndGameDealerMessage() {
  const dealerHasBlackjack = false; // todo! implement
  const { visibleDealerCount } = useDealerCount();
  const finalCount = typeof visibleDealerCount === 'number' ? visibleDealerCount : visibleDealerCount[0]!;
  const dealerOutcomeMessage = finalCount > 21 ? 'Bust' : dealerHasBlackjack ? 'Blackjack!' : '';

  return (
    <>
      {` | `}
      <span className='text-red-600'>{dealerOutcomeMessage}</span>
      <div className='text-orange-500'>Round Finished</div>
    </>
  );
}
export default DealerHand;
