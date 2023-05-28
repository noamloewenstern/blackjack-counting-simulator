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
function DealerHand({ hand, isCurrentPlay, onHandResult }: HandProps) {
  const playableHand = isCurrentPlay ? hand : [hand[0]];
  const countVariations = useCountVariations(playableHand);

  return (
    <div className='flex flex-col justify-start content-start'>
      <div className='text-2xl'>Dealer Hand</div>
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

export default DealerHand;
