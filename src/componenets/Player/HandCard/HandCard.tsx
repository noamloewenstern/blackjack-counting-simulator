import { useEffect } from 'react';
import { useGameMachine } from '~/lib/machines/gameMachineContext';
import ActionControls from './ActionControls';
import BetControls from './BetControls';
import usePlayerHand from '../hooks/usePlayerHand';
import EndGameMessage from './EndGameMessage';
import Card from '~/componenets/Card';

export default function HandCard() {
  const { hand } = usePlayerHand();
  const { send, isRoundFinished, isWaitingForBets, isPlayersTurn } = useGameMachine();
  const { isCurrentTurnHand, isBlackjack, didBust, counts, finalCount } = usePlayerHand();

  useEffect(() => {
    if (isCurrentTurnHand && isBlackjack) {
      send({ type: 'STAND' });
    }
    if (didBust) {
      // may add stuff, so separating the logic
      send({ type: 'STAND' });
    }
  }, [didBust, isBlackjack, isCurrentTurnHand, send]);

  return (
    <>
      {counts.length > 0 && (
        <h3 className='text-lg ml-2'>
          {`Count: `}
          <span className={`text-xl font-bold ${didBust ? 'text-red-700' : 'text-green-600'}`}>
            {didBust ? `${finalCount} BUST` : counts.join(' | ')}
            {isRoundFinished && <EndGameMessage hand={hand} />}
          </span>
        </h3>
      )}
      <div className='flex justify-between'>
        <span className='px-2'>Bet: {hand.bet}</span>
      </div>
      <div className='hand flex justify-center gap-2 my-4'>
        {hand.cards.map((card, index) => (
          <Card card={card} key={index} />
        ))}
      </div>
      {isWaitingForBets && <BetControls />}
      {isPlayersTurn && !hand.isFinished && !didBust && <ActionControls />}
    </>
  );
}
