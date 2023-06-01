import Card from './Card';
import { useGameStore } from '../stores/gameStore';
import { calculateHand, getCardValues, useHasBlackjack } from '../lib/calculateHand';

function DealerHand() {
  const dealer = useGameStore(state => state.dealer);
  const isDealerTurn = useGameStore(state => state.isDealerTurn);
  const dealerFinalCount = useGameStore(state => state.dealerFinalCount);
  // const finalizePlayersBalance = useGameStore(state => state.finalizePlayersBalance);
  const didGameStart = dealer.length > 0;
  const currentPlayerId = useGameStore(state => state.currentPlayerId);
  const didGameEnd = currentPlayerId === 'endGame';
  const counts = didGameStart && dealer.length >= 2 ? calculateHand(dealer) : undefined;
  const dealerHasBlackjack = useHasBlackjack(dealer);
  const dealerOutcomeMessage = didGameEnd && dealerFinalCount > 21 ? 'Bust' : dealerHasBlackjack ? 'Blackjack!' : '';

  const visibleCurrentCount = !didGameStart
    ? undefined
    : didGameEnd
    ? dealerFinalCount
    : !isDealerTurn() && dealer.length >= 2
    ? getCardValues(dealer[1].number)
    : counts?.validCounts || counts?.bustCount;
  const didBust = counts?.validCounts.length === 0 && counts?.bustCount > 21;

  return (
    <div className='h-60'>
      <div>
        <h2 className='text-xl font-bold'>
          Dealer
          {didGameEnd && (
            <>
              {` | `}
              <span className='text-red-600'>{dealerOutcomeMessage}</span>
              <div className='text-orange-500'>Round Finished</div>
            </>
          )}
        </h2>
        {didGameStart && (
          <h3 className='text-lg ml-2 font-bold'>
            Count:{` `}
            <span className={`text-xl font-bold ${didBust ? 'text-red-700' : 'text-green-600'}`}>
              {Array.isArray(visibleCurrentCount) ? visibleCurrentCount.join(' | ') : visibleCurrentCount}
            </span>
          </h3>
        )}
      </div>

      <div className='dealer min-h-24 rounded-lg p-4 flex justify-center gap-4 text-white'>
        {dealer.map((card, index) => (
          <Card card={index === 0 && !(isDealerTurn() || didGameEnd) ? null : card} key={index} />
        ))}
      </div>
    </div>
  );
}

export default DealerHand;