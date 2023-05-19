import React from 'react';
import { useStore } from '../store/gameStore';

interface ControlsProps {
  onHit: () => void;
  onStand: () => void;
  onDeal: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onDeal, onHit, onStand }) => {
  const isGameOver = useStore(state => state.isGameOver);
  return (
    <div className='flex justify-around my-4'>
      <button
        disabled={!isGameOver}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={onDeal}
      >
        Deal
      </button>
      <button
        disabled={isGameOver}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={onHit}
      >
        Hit
      </button>
      <button
        disabled={isGameOver}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={onStand}
      >
        Stand
      </button>
    </div>
  );
};

export default Controls;
