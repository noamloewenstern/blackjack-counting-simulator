import Card from './Card';
import { useGameStore } from '../stores/gameStore';
import { calculateHand, useHasBlackjack } from '../lib/calculateHand';

function DealerHand() {
  const dealer = useGameStore(state => state.dealer);
  const { hand: dealerHand, finalCount: dealerFinalCount } = dealer;
  // const finalizePlayersBalance = useGameStore(state => state.finalizePlayersBalance);
  const didGameStart = dealerHand.length > 0;
  const currentPlayerId = useGameStore(state => state.currentPlayerId);
  const isDealerTurn = currentPlayerId === 'dealer';
  const didGameEnd = currentPlayerId === 'endGame';
  const counts = didGameStart && dealerHand.length >= 2 ? calculateHand(dealerHand) : undefined;
  const dealerHasBlackjack = useHasBlackjack(dealerHand);
  const dealerOutcomeMessage = didGameEnd && dealerFinalCount > 21 ? 'Bust' : dealerHasBlackjack ? 'Blackjack!' : '';

  const didBust = counts?.validCounts.length === 0 && counts?.bustCount > 21;

  const visibleDealerCount = useGameStore(state => state.visibleDealerCount)();

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
        {/* {(didGameStart || didGameEnd) && visibleDealerCount && ( */}
        {visibleDealerCount && (
          <h3 className='text-lg ml-2 font-bold'>
            Count:{` `}
            <span className={`text-xl font-bold ${didBust ? 'text-red-700' : 'text-green-600'}`}>
              {Array.isArray(visibleDealerCount) && visibleDealerCount.length > 0
                ? visibleDealerCount.join(' | ')
                : visibleDealerCount}
            </span>
          </h3>
        )}
      </div>

      <div className='dealer min-h-24 rounded-lg p-4 flex justify-center gap-4 text-white'>
        {dealerHand.map((card, index) => (
          <Card card={card} key={index} />
        ))}
      </div>
    </div>
  );
}

export default DealerHand;
