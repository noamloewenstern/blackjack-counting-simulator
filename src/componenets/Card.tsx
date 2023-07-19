import type { Card as CardType } from '../lib/deck';

const Card = ({ card }: { card: CardType }) => {
  if (!card || !card.isVisible) {
    return (
      <div className='bg-blue-700 text-white rounded shadow-lg flex items-center justify-center w-16 h-24'>
        <span>🂠</span>
      </div>
    );
  }

  const color = card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-black';

  return (
    <div className={`bg-white rounded shadow-lg flex flex-col items-center justify-center w-16 h-24 ${color}`}>
      <span>{card.value}</span>
      <span>{card.suit}</span>
    </div>
  );
};

export default Card;
