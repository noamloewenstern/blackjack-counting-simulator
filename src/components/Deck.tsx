import { useDeckStore } from '../stores/deckStore';
import { useRunningCount } from '../stores/countStore';
import { useGameMachine } from '~/lib/machines/gameMachineContext';
import { useCallback, useEffect, useRef } from 'react';
import { useSettingsStore } from '~/stores/settingsStore';

const useAutoPlay = ({
  handleStartGame,
  handleDealAnotherRound,
}: {
  handleStartGame: () => void;
  handleDealAnotherRound: () => void;
}) => {
  const { state, send, isRoundFinished, isWaitingForBets, isShufflingAfterRound } = useGameMachine();
  const isOnInitGame = state.matches('Initial');
  const automateInteractivePlayer = useSettingsStore(state => state.automateInteractivePlayer);
  const alreadyAutoStartedRound = useRef(false);
  useEffect(() => {
    if (!automateInteractivePlayer) return;
    if (!isOnInitGame && !isRoundFinished) {
      alreadyAutoStartedRound.current = false; // reset after started playing (on state change)/ will accure after calling start game
      return;
    }
    if (alreadyAutoStartedRound.current) return;
    alreadyAutoStartedRound.current = true;
    setTimeout(() => {
      if (isOnInitGame) handleStartGame();
      else if (isRoundFinished) handleDealAnotherRound();
    }, 300);
  }, [automateInteractivePlayer, handleDealAnotherRound, handleStartGame, isOnInitGame, isRoundFinished]);
};

export default function Deck() {
  const { state, send, isRoundFinished, isWaitingForBets, isShufflingAfterRound } = useGameMachine();
  const isOnInitGame = state.matches('Initial');
  const deck = useDeckStore(state => state.shoe);

  const handleStartGame = useCallback(() => send({ type: 'START_GAME' }), [send]);
  const handleDealAnotherRound = useCallback(() => send({ type: 'DEAL_ANOTHER_ROUND' }), [send]);

  useAutoPlay({ handleStartGame, handleDealAnotherRound });

  const roundsPlayed = state.context.roundsPlayed;

  return (
    <>
      <div className='absolute left-4 top-4'>
        <div className='flex flex-col items-start justify-start h-auto w-auto bg-gray-900 text-white p-4 rounded shadow-lg'>
          <p className='my-1 text-lg'>
            Shoe Info: {isShufflingAfterRound && <span className='text-orange-500 text-start'>Shuffling!</span>}
          </p>
          <p>{deck.length} cards</p>
          <RunningCount />
          {roundsPlayed !== 0 && <p>Rounds Played: {roundsPlayed}</p>}
          {isOnInitGame && <StartGameButton onStartGame={handleStartGame} />}
          {isRoundFinished && <EndGameMessage onDealAgain={handleDealAnotherRound}></EndGameMessage>}
        </div>
      </div>
      {isWaitingForBets && (
        <h2 className={`bg-orange-800 fixed text-white font-bold py-2 px-4 rounded top-1/4`}>Setup Bets!</h2>
      )}
    </>
  );
}
function RunningCount() {
  const [runningCount, getAbsoluteCount] = useRunningCount(state => [state.runningCount, state.getAbsoluteCount]);
  return (
    <div className='bg-gray-900 text-white text-start py-4 w-40 self-start rounded shadow-lg'>
      <p>Running Count: {runningCount}</p>
      <p>Absolute Count: {getAbsoluteCount()}</p>
    </div>
  );
}
function StartGameButton({ onStartGame }: { onStartGame: () => void }) {
  return (
    <button
      // disabled={!allPlayersSetBets}
      onClick={onStartGame}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
    >
      Start Game
    </button>
  );
}
function EndGameMessage({ onDealAgain }: { onDealAgain: () => void }) {
  return (
    <button
      onClick={onDealAgain}
      className='bg-blue-500 hover:bg-blue-700
       text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none disabled:hover'
    >
      Deal Again
    </button>
  );
}
