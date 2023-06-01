import { useDeckStore } from '../stores/deckStore';
import { useGameStore } from '../stores/gameStore';

const Deck = () => {
  const deck = useDeckStore(state => state.deck);
  const shuffle = useDeckStore(state => state.shuffle);
  const startGame = useGameStore(state => state.startGame);
  const restartGame = useGameStore(state => state.restartGame);
  const dealerFinalCount = useGameStore(state => state.dealerFinalCount);
  const didGameStart = useGameStore(state => state.didGameStart);
  const didGameEnd = didGameStart() && dealerFinalCount > 0;
  const allPlayersAreReady = useGameStore(state => state.players.every(player => player.ready));

  return (
    <>
      <div className='flex'>
        <div
          onClick={shuffle}
          className='flex items-center justify-center h-32 w-24 bg-gray-900 text-white p-4 rounded shadow-lg cursor-pointer'
          title='Click to reshuffle the deck'
        >
          <p>{deck.length} cards</p>
        </div>

        {allPlayersAreReady && !didGameStart() && (
          <button
            disabled={!allPlayersAreReady}
            onClick={startGame}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              !allPlayersAreReady && 'disabled'
            }`}
          >
            Start Game
          </button>
        )}
        {didGameEnd && (
          <button
            onClick={restartGame}
            className='bg-blue-500 hover:bg-blue-700
       text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none disabled:hover'
          >
            Deal Again
          </button>
        )}
      </div>
      {!allPlayersAreReady && (
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

export default Deck;
