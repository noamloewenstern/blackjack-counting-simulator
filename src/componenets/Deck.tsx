import { useDeckStore } from '../stores/deckStore';
import { useRunningCount } from '../stores/countStore';
import { useGameMachine } from '~/lib/machines/gameMachineContext';
import { useCallback, useEffect, useRef } from 'react';
import { useSettingsStore } from '~/stores/settingsStore';

const Deck = () => {
  const { state, send, isRoundFinished, isWaitingForBets, isShufflingAfterRound } = useGameMachine();
  const isOnInitGame = state.matches('Initial');
  const automateInteractivePlayer = useSettingsStore(state => state.automateInteractivePlayer);

  const handleStartGame = useCallback(() => {
    send({ type: 'START_GAME' });
  }, [send]);
  const handleDealAnotherRound = useCallback(() => {
    send({ type: 'DEAL_ANOTHER_ROUND' });
  }, [send]);

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

  return (
    <>
      <div className='flex'>
        <div className='flex flex-col items-center justify-center h-auto w-auto bg-gray-900 text-white p-4 rounded shadow-lg'>
          <p className='m-1 mb-3 text-lg'>
            Shoe Info: {isShufflingAfterRound && <span className='text-orange-500'>Shuffling!</span>}
          </p>
          <RunningCount />
          {isOnInitGame && <StartGameButton onStartGame={handleStartGame} />}
          {isRoundFinished && <EndGameMessage onDealAgain={handleDealAnotherRound}></EndGameMessage>}
        </div>
      </div>
      {isWaitingForBets && (
        <h2 className={`bg-orange-800 fixed text-white font-bold py-2 px-4 rounded top-1/4`}>Setup Bets!</h2>
      )}
    </>
  );
};
function RunningCount() {
  const deck = useDeckStore(state => state.shoe);
  const [runningCount, getAbsoluteCount] = useRunningCount(state => [state.runningCount, state.getAbsoluteCount]);
  return (
    <>
      <p>{deck.length} cards</p>

      <div className='bg-gray-900 text-white p-4 rounded shadow-lg'>
        <p>Running Count: {runningCount}</p>
        <p>Absolute Count: {getAbsoluteCount()}</p>
      </div>
    </>
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

export default Deck;
