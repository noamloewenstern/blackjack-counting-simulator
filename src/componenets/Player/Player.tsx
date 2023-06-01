import { useEffect } from 'react';
import { calculateHand } from '../../lib/calculateHand';
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

  // const isCurrentTurn = useGameStore(state => state.currentPlayerId === playerId);
  const didGameStart = useGameStore(state => state.didGameStart);
  const counts = didGameStart() ? calculateHand(player.hand) : null;
  const didBust = counts?.validCounts.length === 0 && counts?.bustCount > 21;
  const stand = useGameStore(state => state.stand);
  const finalCount = player.finalCount;

  useEffect(() => {
    if (didBust) {
      stand(playerId);
    }
  }, [didBust, playerId, stand]);

  const { hand, bet } = player;
  return (
    <div className='player border border-gray-500 rounded p-4 shadow-lg flex flex-col items-center gap-2 w-1/3'>
      <PlayerHeader player={player} />
      {counts && (
        <h3 className='text-lg ml-2'>
          Count:{' '}
          <span className={`text-xl font-bold ${didBust ? 'text-red-700' : 'text-green-600'}`}>
            {counts.validCounts.length > 0 ? finalCount ?? counts.validCounts.join(' | ') : `${counts.bustCount} BUST`}
            <EndGameMessage player={player} />
          </span>
        </h3>
      )}
      <div className='flex justify-between'>
        <span className='px-2'>Bet: {bet}</span>
      </div>
      <div className='hand flex justify-center gap-2 my-4'>
        {hand.map((card, index) => (
          <Card card={card} key={index} />
        ))}
      </div>
      {!didGameStart() ? <BetControls player={player} /> : !player.finished && <Controls player={player} />}
    </div>
  );
}

const PlayerHeader = ({ player }: { player: IPlayer }) => {
  return (
    <h2 className='text-xl font-bold'>
      Player {player.id} | {player.stratergy} | Balance: {player.balance}
    </h2>
  );
};

const EndGameMessage = ({ player }: { player: IPlayer }) => {
  const didGameStart = useGameStore(state => state.didGameStart);
  const dealerFinalScore = useGameStore(state => state.dealerFinalCount);
  const didGameEnd = didGameStart() && dealerFinalScore > 0;
  const finalCount = player.finalCount;

  if (!didGameEnd || !finalCount) return null;
  if (finalCount > 21 || (finalCount < dealerFinalScore && dealerFinalScore <= 21)) {
    return <span className='text-red-500 ml-4'>Lose</span>;
  }
  if (finalCount === dealerFinalScore) {
    return <span className='text-yellow-500 ml-4'>Push</span>;
  }
  return <span className='text-green-500 ml-4'>Win</span>;
};
