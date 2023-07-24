import { useDealerCount } from '~/lib/hooks/useDealerCount';
import usePlayerHand from '../hooks/usePlayerHand';

export default function EndGameMessage() {
  const { isBlackjack, didBust, finalCount } = usePlayerHand();
  const { includeNonVisible: dealerCount } = useDealerCount();

  if (isBlackjack) {
    return (
      <>
        <span className='text-green-500 border border-green-500 rounded ml-4 px-2 py-0.5'>Blackjack!</span>
        {dealerCount.isBlackjack ? ( // check if also dealer has blackjack
          <span className='text-yellow-500 ml-4'>Push</span>
        ) : (
          <span className='text-green-500 ml-4'>Win</span>
        )}
      </>
    );
  }
  if (dealerCount.isBlackjack || didBust || (finalCount < dealerCount.finalCount && !dealerCount.didBust)) {
    return <span className='text-red-500 ml-4'>{didBust ? `BUST ` : ''} Lose</span>;
  }
  if (finalCount === dealerCount.finalCount) {
    return <span className='text-yellow-500 ml-4'>Push</span>;
  }

  return <span className='text-green-500 ml-4'>Win</span>;
}
