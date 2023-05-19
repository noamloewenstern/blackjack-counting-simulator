import React from 'react';
import Card from './Card';

interface HandProps {
  hand: { value: string; suit: string }[];
}

const Hand: React.FC<HandProps> = ({ hand }) => {
  return (
    <div className='flex flex-wrap flex-col'>
      {hand.map(card => (
        <>
          <Card key={`${card.value}-${card.suit}`} card={card} />
          {` `}
        </>
      ))}
    </div>
  );
};

export default Hand;
