import { useEffect } from 'react';
import { calculateHand, useHasBlackjack } from '../../lib/calculateHand';
import { IPlayer, PlayerId, useGameStore } from '../../stores/gameStore';
import Card from '../Card';
import BetControls from './BetControls';
import Controls from './Controls';

type PlayerProps = {
  playerId: PlayerId;
};

export default function Player({ playerId }: PlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const player = useGameStore(state => state.players.find(p => p.id === playerId))!;

  const isCurrentTurn = useGameStore(state => state.currentPlayerId === player.id);
  const readyForPlayingFirstRound = useGameStore(state => state.readyForPlayingFirstRound);
  const didGameStart = useGameStore(state => state.didGameStart);
  const playerHasCards = player.hand.length > 0;
  const counts = didGameStart && playerHasCards ? calculateHand(player.hand) : null;
  const didBust = counts?.validCounts.length === 0 && counts?.bustCount > 21;
  const stand = useGameStore(state => state.stand);
  const setStandInfo = useGameStore(state => state.setStandInfo);
  const finalCount = player.finalCount;
  const hasBlackjack = useHasBlackjack(player.hand);

  useEffect(() => {
    if (isCurrentTurn && hasBlackjack) {
      stand(playerId);
    }
  }, [isCurrentTurn, hasBlackjack, stand, playerId]);

  useEffect(() => {
    if (readyForPlayingFirstRound && hasBlackjack) {
      setStandInfo(playerId);
    }
  }, [readyForPlayingFirstRound, hasBlackjack, playerId, setStandInfo]);

  useEffect(() => {
    if (didBust) {
      setStandInfo(playerId);
    }
  }, [didBust, playerId, setStandInfo]);

  return (
    <div className='player border border-gray-500 rounded p-4 shadow-lg flex flex-col items-center gap-2 w-1/3'>
      <PlayerHeader player={player} />
      {(counts || hasBlackjack) && (
        <h3 className='text-lg ml-2'>
          Count:{' '}
          <span className={`text-xl font-bold ${didBust ? 'text-red-700' : 'text-green-600'}`}>
            {!counts
              ? null
              : counts.validCounts.length > 0
              ? finalCount ?? counts.validCounts.join(' | ')
              : `${counts.bustCount} BUST`}
            <EndGameMessage player={player} />
          </span>
        </h3>
      )}
      <div className='flex justify-between'>
        <span className='px-2'>Bet: {player.bet}</span>
      </div>
      <div className='hand flex justify-center gap-2 my-4'>
        {player.hand.map((card, index) => (
          <Card card={card} key={index} />
        ))}
      </div>
      {!didGameStart && <BetControls player={player} />}
      {didGameStart &&
        !player.finished &&
        !finalCount &&
        playerHasCards &&
        !hasBlackjack &&
        readyForPlayingFirstRound && <Controls player={player} />}
    </div>
  );
}

const PlayerHeader = ({ player }: { player: IPlayer }) => {
  return (
    <h2 className='text-xl font-bold'>
      Player {player.id} | {player.strategy} | Balance: {player.balance}
    </h2>
  );
};

const EndGameMessage = ({ player }: { player: IPlayer }) => {
  const didGameStart = useGameStore(state => state.didGameStart);
  const hasBlackjack = useHasBlackjack(player.hand);
  const finalCount = player.finalCount;

  const dealerHasBlackjack = useHasBlackjack(useGameStore(state => state.dealer));
  const dealerFinalCount = useGameStore(state => state.dealerFinalCount);

  const didGameEnd = didGameStart && dealerFinalCount > 0;

  const readyForPlayingFirstRound = useGameStore(state => state.readyForPlayingFirstRound);

  if (hasBlackjack) {
    return (
      <>
        <span className='text-green-500 border border-green-500 rounded ml-4 px-2 py-0.5'>Blackjack!</span>
        {readyForPlayingFirstRound &&
          (dealerHasBlackjack ? ( // check if also dealer has blackjack
            <span className='text-yellow-500 ml-4'>Push</span>
          ) : (
            <span className='text-green-500 ml-4'>Win</span>
          ))}
      </>
    );
  }
  if (!didGameEnd || !finalCount) return null;
  if (finalCount > 21 || (finalCount < dealerFinalCount && dealerFinalCount <= 21)) {
    return <span className='text-red-500 ml-4'>Lose</span>;
  }
  if (finalCount === dealerFinalCount && !hasBlackjack && !dealerHasBlackjack) {
    return <span className='text-yellow-500 ml-4'>Push</span>;
  }

  return <span className='text-green-500 ml-4'>Win</span>;
};
