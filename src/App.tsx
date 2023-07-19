import { GameMachineProvider } from '~/lib/machines/gameMachineContext';
import Game from './componenets/Game';

function App() {
  return (
    <GameMachineProvider>
      <Game />
    </GameMachineProvider>
  );
}

export default App;
