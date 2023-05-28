// import React, { useEffect } from 'react';
// import Deck from './Deck';
import Hand from './PlayerHand';
import Controls from './Controls';
import { useGameStore } from '../store/gameStore';
import { ReactNode, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

const Game = () => {
  // const { dealerHand, playerHand, gameOver, message, deal, hit, stand } = useStore();
  const { dealerHand, playerHand, message, isGameOver, dealRound, hit, hitDealer, endGame, dealerCount, startedGame } =
    useGameStore();
  const [runTillFinish, setRunTillFinish] = useState(false);

  useEffect(() => {
    if (runTillFinish) {
      if (dealerCount() < 17) {
        hitDealer();
      } else {
        endGame();
      }
      setRunTillFinish(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runTillFinish, dealerHand]);

  const handleStand = () => {
    setRunTillFinish(true);
  };
  const handleDeal = () => {
    if (runTillFinish) {
      setRunTillFinish(false);
    }
    dealRound();
  };

  return (
    <>
      {/* <h1 className='text-4xl text-center my-4'>Blackjack</h1> */}
      <div className='max-w-6xl mx-auto py-20 px-4 h-screen flex flex-col justify-between content-between w-11/12'>
        <SmallWindow>
          <StartGame />
        </SmallWindow>
        <Hand hand={dealerHand} isCurrentPlay={true} onHandResult={() => {}} />
        <div className='flex justify-between w-11/12'>
          <Hand hand={playerHand} isCurrentPlay={true} onHandResult={() => {}} />
          <Hand hand={playerHand} isCurrentPlay={true} onHandResult={() => {}} />
          <Hand hand={playerHand} isCurrentPlay={true} onHandResult={() => {}} />
          <Hand hand={playerHand} isCurrentPlay={true} onHandResult={() => {}} />
        </div>

        {isGameOver && <DealAgain onDeal={handleDeal} message={message} />}
      </div>
    </>
  );
};

const DealAgain = ({ onDeal, message }: { onDeal: () => void; message: string }) => {
  return (
    <div className='text-center'>
      <h2 className='text-2xl my-4'>Game Over: {message}</h2>
      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={onDeal}>
        Deal Again
      </button>
    </div>
  );
};
const StartGame = () => {
  const { startedGame, dealRound } = useGameStore(
    state => ({ startedGame: state.startedGame, dealRound: state.dealRound }),
    shallow,
  );
  return (
    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={dealRound}>
      {startedGame ? 'Restart' : 'Start'}
    </button>
  );
};

const SmallWindow = ({ children }: { children: ReactNode }) => {
  if (!children || (Array.isArray(children) && !children.some(Boolean))) {
    return null;
  }
  return <div className='fixed top-0 left-0 p-4 bg-gray-200'>{children}</div>;
};

export default Game;
