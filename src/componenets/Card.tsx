import React from 'react';
import { ICard } from '../lib/card-types';

interface CardProps {
  card: ICard;
}

const Card: React.FC<CardProps> = ({ card }) => {
  return (
    <span className='rounde ml-1 shadow text-xl'>
      {card.value}
      {card.suit}
      {/* <p>{}</p> */}
    </span>
  );
};

export default Card;
