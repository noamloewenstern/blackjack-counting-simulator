import { useEffect, useRef, useState } from 'react';
import { calculateCountingBet } from '~/lib/strategies/blackjack-counting';
import { useRunningCount } from '~/stores/countStore';
import { useSettingsStore } from '~/stores/settingsStore';
import { useGameMachine } from '~/lib/machines/gameMachineContext';
import { calculateBetPerfectBlackjack } from '~/lib/strategies/perfect-blackjack';
import usePlayer from '../hooks/usePlayer';
import usePlayerHand from '../hooks/usePlayerHand';

const useAutomateBetForCountingBots = ({ isReady, setIsReady }: { isReady: boolean; setIsReady: () => void }) => {
  const { send } = useGameMachine();
  const { player } = usePlayerHand();
  const runningCount = useRunningCount(state => state.runningCount);
  const numberDecksInShoe = useSettingsStore(state => state.numberDecksInShoe);

  const ranUseEffect = useRef(false);
  useEffect(() => {
    if (player.strategy !== 'interactive' || isReady) return;
    if (!ranUseEffect.current) {
      ranUseEffect.current = true;
      const placeBet = (bet: number) => {
        send({
          type: 'PLACE_BET',
          params: {
            playerId: player.id,
            handIdx: 0, // init deal
            bet,
          },
        });
      };
      setTimeout(async () => {
        let bet: number;
        if (player.strategy === 'perfect-blackjack') {
          bet = calculateBetPerfectBlackjack();
        } else if (player.strategy === 'counting') {
          bet = calculateCountingBet({ runningCount, numberDecksInShoe });
        } else {
          throw new Error(`Invalid strategy ${player.strategy}`);
        }
        placeBet(bet);
        setIsReady();
      }, 500);
    }
  }, [isReady, numberDecksInShoe, player.id, player.strategy, runningCount, send, setIsReady]);
};

export default function BetControls() {
  const { hand } = usePlayerHand();
  const [isReady, setIsReady] = useState(false);
  const handleReady = () => {
    if (hand.bet === 0) {
      alert('No Bet Placed');
      return;
    }
    setIsReady(true);
  };
  const disableReady = hand.bet === 0;

  useAutomateBetForCountingBots({ isReady, setIsReady: handleReady });

  if (isReady) return <h3>Ready</h3>;

  return (
    <div className='flex flex-wrap justify-center gap-4 max-w-[400px] mx-auto'>
      <>
        <BetButton amount={1} />
        <BetButton amount={5} />
        <BetButton amount={10} />
        <BetButton amount={20} />
        <BetButton amount={50} />
        <BetButton amount={100} />
        <button
          onClick={handleReady}
          disabled={disableReady}
          className={`${
            disableReady ? 'disabled' : ''
          } bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2`}
        >
          Ready
        </button>
      </>
    </div>
  );
}

const BetButton = ({ amount }: { amount: number }) => {
  const { send } = useGameMachine();
  const { player } = usePlayer();

  const handleBet = (betAmount: number) => {
    if (player.balance < betAmount) {
      alert('Not Enough Balance');
      return;
    }
    send({ type: 'PLACE_BET', params: { playerId: player.id, handIdx: 0 /* init deal */, bet: betAmount } });
  };

  return (
    <button
      onClick={() => handleBet(amount)}
      className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2'
    >
      Bet {amount}
    </button>
  );
};