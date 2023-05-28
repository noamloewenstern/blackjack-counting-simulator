import { useMemo } from 'react';
import { IHand } from '../lib/card-types';
import { calculateCountVariations } from '../utils/calculateCount';
import Card from './Card';

interface HandProps {
  hand: IHand;
  isCurrentPlay: boolean;
  onHandResult: (finalCount: string) => void;
}
const useCountVariations = (hand: IHand) => useMemo(() => calculateCountVariations(hand), hand);
function Hand({ hand }: HandProps) {
  const countVariations = useCountVariations(hand);
  if (!hand.length) return null;
  return (
    <div className='flex flex-col justify-start content-start'>
      <div className='text-2xl'>Hand #2</div>
      <div className='self-start'>Count: {countVariations.join(' | ')}</div>
      {/* <Controls onDeal={handleDeal} onHit={hit} onStand={handleStand} /> */}
      <div className='self-start flex bg min-w-min mt-2'>
        {hand.map(card => (
          <div key={`${card.value}-${card.suit}`} className='flex'>
            <Card key={`${card.value}-${card.suit}`} card={card} />
            {` `}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hand;
