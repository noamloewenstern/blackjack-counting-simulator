import { useEffect } from 'react';
import { useHasBlackjack } from '../../lib/calculateHand';
import { IPlayer, PlayerId, useGameStore } from '../../stores/gameStore';
import Card from '../Card';
import BetControls from './BetControls';
import Controls from './Controls';
import { PlayerProvider, usePlayer } from './PlayerContext';

function Player() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { player, isCurrentTurn, hasBlackjack, didBust, counts } = usePlayer();
  const didGameStart = useGameStore(state => state.didGameStart);
  const playerHasCards = player.hand.length > 0;

  const readyForPlayingFirstRound = useGameStore(state => state.readyForPlayingFirstRound);

  const stand = useGameStore(state => state.stand);
  const setStandInfo = useGameStore(state => state.setStandInfo);
  const finalCount = player.finalCount;

  useEffect(() => {
    if (isCurrentTurn && hasBlackjack) {
      stand(player.id);
    }
  }, [isCurrentTurn, hasBlackjack, stand, player.id]);

  useEffect(() => {
    if (readyForPlayingFirstRound && hasBlackjack) {
      setStandInfo(player.id);
    }
  }, [readyForPlayingFirstRound, hasBlackjack, player.id, setStandInfo]);

  useEffect(() => {
    if (didBust) {
      setStandInfo(player.id);
    }
  }, [didBust, player.id, setStandInfo]);

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
      {!didGameStart && <Player.BetControls />}
      {didGameStart &&
        !player.finished &&
        !finalCount &&
        playerHasCards &&
        !hasBlackjack &&
        readyForPlayingFirstRound && <Player.Controls />}
    </div>
  );
}
Player.Controls = Controls;
Player.BetControls = BetControls;

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

  const dealer = useGameStore(state => state.dealer);
  const dealerHasBlackjack = useHasBlackjack(dealer.hand);

  const didGameEnd = didGameStart && dealer.finalCount > 0;

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
  if (finalCount > 21 || (finalCount < dealer.finalCount && dealer.finalCount <= 21)) {
    return <span className='text-red-500 ml-4'>Lose</span>;
  }
  if (finalCount === dealer.finalCount && !hasBlackjack && !dealerHasBlackjack) {
    return <span className='text-yellow-500 ml-4'>Push</span>;
  }

  return <span className='text-green-500 ml-4'>Win</span>;
};

type PlayerProps = {
  player: IPlayer;
};
export default function PlayerWithContext({ player }: PlayerProps) {
  return (
    <PlayerProvider player={player}>
      <Player />
    </PlayerProvider>
  );
}
