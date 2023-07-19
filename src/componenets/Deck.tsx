import { useDeckStore } from '../stores/deckStore';
import { useRunningCount } from '../stores/countStore';
import { useGameMachine } from '~/lib/machines/gameMachineContext';

const Deck = () => {
  const { state, send, isRoundFinished } = useGameMachine();
  const isOnInitGame = state.matches('initial');
  const isWaitingForPlayersBets = state.matches('placePlayerBets');

  const handleStartGame = async () => {
    send({ type: 'START_GAME' });
  };
  const handleDealAnotherRound = () => {
    send({ type: 'DEAL_ANOTHER_ROUND' });
  };

  // useEffect(() => {
  //   if (!clickedInitStartedGame && !didRoundStart && areAllPlayersReady) {
  //     clickedInitStartedGame = true;
  //     setTimeout(startGame, 300);
  //   }
  //   if (didRoundStart) {
  //     clickedInitStartedGame = false;
  //   }
  // }, [areAllPlayersReady, didRoundStart, startGame]);

  return (
    <>
      <div className='flex'>
        <div className='flex flex-col items-center justify-center h-auto w-auto bg-gray-900 text-white p-4 rounded shadow-lg'>
          <RunningCount />
          {isOnInitGame && <StartGameButton onStartGame={handleStartGame} />}
          {isRoundFinished && <EndGameMessage onDealAgain={handleDealAnotherRound}></EndGameMessage>}
        </div>
      </div>
      {isWaitingForPlayersBets && (
        <h2 className={`bg-orange-800 fixed text-white font-bold py-2 px-4 rounded top-1/4`}>Setup Bets!</h2>
      )}
    </>
  );

  /*
  <div className="flex flex-col items-center justify-center h-full">
      <div className="bg-gray-900 text-white p-4 rounded shadow-lg">
        Deck ({deck.length} cards)
      </div>
    </div>
   */
};
function RunningCount() {
  const deck = useDeckStore(state => state.deck);
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
