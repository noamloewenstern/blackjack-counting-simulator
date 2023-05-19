import React from 'react';
import { ICard } from '../lib/card-types';

interface CardProps {
  card: ICard;
}

const Card: React.FC<CardProps> = ({ card }) => {
  return (
    <span className='bg-white rounded shadow p-4 m-2 text-xl'>
      {card.value}
      {card.suit}
      {/* <p>{}</p> */}
    </span>
  );
};

export default Card;
