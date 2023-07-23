import { useGameMachine } from '~/lib/machines/gameMachineContext';
import PlayerCard from './PlayerCard';
import { PlayerProvider } from './contexts/PlayerContext';

export default function Players() {
  const { state } = useGameMachine();
  return (
    <div className='flex content-between justify-around'>
      {state.context.players.map(player => (
        <PlayerProvider key={player.id} player={player}>
          <PlayerCard />
        </PlayerProvider>
      ))}
    </div>
  );
}
