import { HandProvider } from './contexts/HandContext';
import usePlayer from './hooks/usePlayer';
import HandCard from './HandCard/HandCard';
import { type Player } from '~/lib/machines/gameMachine';

export default function PlayerCard() {
  const { player } = usePlayer();

  return (
    <div className='player border border-gray-500 rounded p-4 shadow-lg flex flex-col items-center gap-2 w-1/3'>
      <PlayerHeader player={player} />
      <div className='flex gap-x-20'>
        {player.hands.map(hand => (
          <HandProvider hand={hand} key={hand.id}>
            <HandCard />
          </HandProvider>
        ))}
      </div>
    </div>
  );
}
function PlayerHeader({ player }: { player: Player }) {
  return (
    <h2 className='text-xl font-bold'>
      Player {player.id} | {player.strategy} | Balance: {player.balance}
    </h2>
  );
}
