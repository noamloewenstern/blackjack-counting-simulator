import React from 'react';
import Card from './Card';
import { IDeck } from '../lib/card-types';

interface DeckProps {
  deck: IDeck;
}

const Deck: React.FC<DeckProps> = ({ deck }) => {
  return (
    <div className='flex flex-wrap'>
      {deck.map((card, index) => (
        <Card key={index} card={card} />
      ))}
    </div>
  );
};

export default Deck;
