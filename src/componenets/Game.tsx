import Dealer from './Dealer';
import Deck from './Deck';
import { PlayerProvider } from './Player/contexts/PlayerContext';
import PlayerCard from './Player/PlayerCard';
import { useGameMachine } from '~/lib/machines/gameMachineContext';

export default function Game() {
  const { state } = useGameMachine();
  return (
    <div className='game'>
      <Deck />
      <Dealer />
      <div className='h-20' />
      <div className='flex content-between justify-around'>
        {state.context.players.map(player => (
          <PlayerProvider key={player.id} player={player}>
            <PlayerCard />
          </PlayerProvider>
        ))}
      </div>
    </div>
  );
}
