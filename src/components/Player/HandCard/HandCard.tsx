import { useEffect } from 'react';
import { useGameMachine } from '~/lib/machines/gameMachineContext';
import ActionControls from './ActionControls';
import BetControls from './BetControls';
import usePlayerHand from '../hooks/usePlayerHand';
import EndGameMessage from './EndGameMessage';
import Card from '~/components/Card';

export default function HandCard() {
  const { isRoundFinished, isWaitingForBets, isPlayersTurn } = useGameMachine();
  const {
    isCurrentTurnHand,
    isBlackjack,
    didBust,
    counts,
    finalCount,
    player,
    hand,
    actions: { stand },
  } = usePlayerHand();

  useEffect(() => {
    if (!isCurrentTurnHand) return;
    if (isBlackjack || didBust) {
      stand();
    }
  }, [didBust, hand.id, isBlackjack, isCurrentTurnHand, player.id, stand]);
  const countMsg = hand.isFinished ? finalCount : counts.join(' | ');
  return (
    <div>
      {counts.length > 0 && (
        <h3 className='text-lg ml-2'>
          {`Count: `}
          <span className={`text-xl font-bold ${didBust ? 'text-red-700' : 'text-green-600'}`}>
            {countMsg}
            {(isRoundFinished || didBust || isBlackjack) && <EndGameMessage />}
          </span>
        </h3>
      )}
      <span className='px-2'>Bet: {hand.bet}</span>
      <div className='hand flex justify-center gap-2 my-4'>
        {hand.cards.map((card, index) => (
          <Card card={card} key={index} />
        ))}
      </div>
      {isWaitingForBets && <BetControls />}
      {isPlayersTurn && !hand.isFinished && !didBust && <ActionControls />}
    </div>
  );
}
