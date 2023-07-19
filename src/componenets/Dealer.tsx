import Card from './Card';
import { useGameMachine } from '~/lib/machines/gameMachineContext';
import { useDealerCount } from '../lib/hooks/useDealerCount';

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
function DealerCount() {
  const { visible: visibleCount } = useDealerCount();
  visibleCount.validCounts;
  return (
    visibleCount.finalCount && (
      <h3 className='text-lg ml-2 font-bold'>
        Count:{` `}
        {visibleCount.didBust ? (
          <span className={'text-xl font-bold text-red-700'}>{visibleCount.bustCount}</span>
        ) : (
          <span className={'text-xl font-bold text-green-600'}> {visibleCount.validCounts.join(' | ')}</span>
        )}
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
  const {
    includeNonVisible: { didBust, isBlackjack },
  } = useDealerCount();
  const dealerOutcomeMessage = didBust ? 'Bust' : isBlackjack ? 'Blackjack!' : '';

  return (
    <>
      {` | `}
      <span className='text-red-600'>{dealerOutcomeMessage}</span>
      <div className='text-orange-500'>Round Finished</div>
    </>
  );
}
export default DealerHand;
