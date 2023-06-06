import { useEffect, useRef } from 'react';
import { IPlayer, useGameStore } from '../../stores/gameStore';
import { usePlayer } from './PlayerContext';
import { calculateCountingBet } from '../../lib/strategies/blackjack-counting';
import { useCountStore } from '../../stores/countStore';
import { useSettingsStore } from '../../stores/settingsStore';

export default function BetControls() {
  const { player } = usePlayer();
  const setPlayerReady = useGameStore(state => state.setPlayerReady);
  const runningCount = useCountStore(state => state.runningCount);
  const numberDecksInShoe = useSettingsStore(state => state.numberDecksInShoe);

  const handleReady = () => {
    if (player.bet === 0) {
      alert('No Bet Placed');
      return;
    }
    setPlayerReady(player.id);
  };
  const disablePlay = player.bet === 0;

  const placeBet = useGameStore(state => state.placeBet);

  const ranUseEffect = useRef(false);
  useEffect(() => {
    if (player.strategy !== 'interactive' && !ranUseEffect.current && !player.ready && !player.bet) {
      ranUseEffect.current = true;

      setTimeout(() => {
        let bet = 100;
        if (player.strategy === 'perfect-blackjack') {
          bet = 100;
        } else if (player.strategy === 'counting') {
          bet = calculateCountingBet({ runningCount, numberDecksInShoe });
        }
        placeBet(player.id, bet);
        setPlayerReady(player.id);
      }, 500);
    }
  }, [placeBet, player.bet, player.id, player.ready, setPlayerReady, player.strategy, runningCount, numberDecksInShoe]);

  if (player.ready) return <h3>Ready</h3>;

  return (
    <div className='flex flex-wrap justify-center gap-4 max-w-[400px] mx-auto'>
      <>
        <BetButton player={player} amount={1} />
        <BetButton player={player} amount={5} />
        <BetButton player={player} amount={10} />
        <BetButton player={player} amount={20} />
        <BetButton player={player} amount={50} />
        <BetButton player={player} amount={100} />
        <button
          onClick={handleReady}
          disabled={disablePlay}
          className={`${
            disablePlay ? 'disabled' : ''
          } bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2`}
        >
          Ready
        </button>
      </>
    </div>
  );
}

const BetButton = ({ amount, player }: { amount: number; player: IPlayer }) => {
  const placeBet = useGameStore(state => state.placeBet);

  const handleBet = (betAmount: number) => {
    if (player.balance >= betAmount) {
      placeBet(player.id, betAmount);
    } else {
      alert('Not Enough Balance');
    }
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
