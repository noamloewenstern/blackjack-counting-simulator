// import React, { useEffect } from 'react';
// import Deck from './Deck';
import Hand from './Hand';
import Controls from './Controls';
import { useStore } from '../store/gameStore';
import calculateScore, { calculateScoreVariations } from '../utils/calculateScore';
import { useEffect, useState } from 'react';

const Game = () => {
  // const { dealerHand, playerHand, gameOver, message, deal, hit, stand } = useStore();
  const { dealerHand, playerHand, message, isGameOver, deal, hit, hitDealer, endGame, playerCount, dealerCount } =
    useStore();
  const [runTillFinish, setRunTillFinish] = useState(false);

  useEffect(() => {
    if (runTillFinish) {
      if (dealerCount() < 17) {
        hitDealer();
      } else {
        endGame();
      }
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
    deal();
  };

  return (
    <div className='max-w-lg mx-auto p-4'>
      <h1 className='text-4xl text-center my-4'>Blackjack</h1>
      <h2 className='text-2xl text-center my-4'>{message}</h2>

      <h2 className='text-2xl my-4'>Dealer's Hand {calculateScoreVariations(dealerHand).join(' | ')}</h2>
      <Hand hand={dealerHand} />

      <h2 className='text-2xl my-4'>Your Hand {calculateScoreVariations(playerHand).join(' | ')}</h2>
      <Hand hand={playerHand} />

      <Controls onDeal={handleDeal} onHit={hit} onStand={handleStand} />
      {isGameOver && (
        <div className='text-center'>
          <h2 className='text-2xl my-4'>Game Over: {message}</h2>
          <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={handleDeal}>
            Deal Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
