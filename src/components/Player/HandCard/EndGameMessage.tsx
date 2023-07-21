import { useMemo } from 'react';
import { calcHandCount } from '~/lib/calculateHand';
import { Hand } from '~/lib/deck';
import { useDealerCount } from '~/lib/hooks/useDealerCount';
import { isHandBlackjack } from '~/lib/machines/utils';

export default function EndGameMessage({ hand }: { hand: Hand }) {
  const hasBlackjack = isHandBlackjack(hand.cards);
  const { includeNonVisible: dealerCount } = useDealerCount();

  const { bustCount, validCounts } = useMemo(() => calcHandCount(hand.cards), [hand.cards]);
  const isBust = validCounts.length === 0 && bustCount > 21;
  const finalCount = validCounts.length > 0 ? validCounts[0]! : bustCount;

  if (hasBlackjack) {
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
  if (dealerCount.isBlackjack || isBust || (finalCount < dealerCount.finalCount && !dealerCount.didBust)) {
    return <span className='text-red-500 ml-4'>Lose</span>;
  }
  if (finalCount === dealerCount.finalCount) {
    return <span className='text-yellow-500 ml-4'>Push</span>;
  }

  return <span className='text-green-500 ml-4'>Win</span>;
}
