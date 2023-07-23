import Dealer from './Dealer';
import Deck from './Deck';
import Settings from './Settings/Settings';
import GameHeader from './GameHeader';
import Players from './Player/Players';

export default function Game() {
  return (
    <div>
      <GameHeader />
      <Deck />
      <div className='flex flex-col pt-32 gap-10 px-12 justify-around h-screen w-screen '>
        <Dealer />
        <Players />
      </div>
      <Settings />
    </div>
  );
}
