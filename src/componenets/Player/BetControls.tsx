import { useEffect } from 'react';
import { IPlayer, useGameStore } from '../../stores/gameStore';

type BetProps = {
  player: IPlayer;
};
export default function BetControls({ player }: BetProps) {
  const setPlayerReady = useGameStore(state => state.setPlayerReady);
  const isPlayerReady = useGameStore(state => state.players.find(p => p.id === player.id)!.ready);

  const handleReady = () => {
    if (player.bet === 0) {
      alert('No Bet Placed');
      return;
    }
    setPlayerReady(player.id);
  };
  const disablePlay = player.bet === 0;

  if (isPlayerReady) return <h3>Ready</h3>;

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
