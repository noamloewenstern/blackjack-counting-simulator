import { GameMachineProvider } from '~/lib/machines/gameMachineContext';
import { useGameStore } from '../stores/gameStore';
import Dealer from './Dealer';
import Deck from './Deck';
import Player from './Player/Player';

export default function Game() {
  const players = useGameStore(state => state.players);

  return (
    <div className='game'>
      <GameMachineProvider>
        <Deck />
        <Dealer />
        <div className='h-20' />
        <div className='flex content-between justify-around'>
          {players.map(player => (
            <Player key={player.id} player={player} />
          ))}
        </div>
      </GameMachineProvider>
    </div>
  );
}
