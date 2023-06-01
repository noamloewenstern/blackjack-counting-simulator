import { Card as CardType } from '../lib/deck';

const Card = ({ card }: { card: CardType | null }) => {
  if (!card) {
    return (
      <div className='bg-blue-700 text-white rounded shadow-lg flex items-center justify-center w-16 h-24'>
        <span>🂠</span>
      </div>
    );
  }

  const color = ['hearts', 'diamonds'].includes(card.suit) ? 'text-red-500' : 'text-black';

  return (
    <div className={`bg-white rounded shadow-lg flex flex-col items-center justify-center w-16 h-24 ${color}`}>
      <span>{card.number}</span>
      <span>{card.suit}</span>
    </div>
  );
};

export default Card;
