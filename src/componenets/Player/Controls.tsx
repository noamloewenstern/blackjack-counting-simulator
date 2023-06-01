import { IPlayer, useGameStore } from '../../stores/gameStore';

type ControlsProps = {
  player: IPlayer;
};
export default function Controls({ player }: ControlsProps) {
  const hit = useGameStore(state => state.hit);
  const stand = useGameStore(state => state.stand);
  const double = useGameStore(state => state.double);
  const isCurrentTurn = useGameStore(state => state.currentPlayerId === player.id);

  const handleDouble = async () => {
    try {
      await double(player.id);
    } catch (err) {
      console.log(err);
      alert(err);
    }
  };

  return (
    <div className='actions flex justify-center gap-4'>
      <button
        disabled={!isCurrentTurn}
        onClick={() => hit(player.id)}
        className={`
   ${isCurrentTurn ? 'bg-blue-500 hover:bg-blue-700' : 'disabled'}
    text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none disabled:hover`}
      >
        Hit
      </button>

      <button
        disabled={!isCurrentTurn}
        onClick={handleDouble}
        className={`${isCurrentTurn ? 'bg-purple-600 hover:bg-purple-700' : 'disabled'}
     text-white font-bold py-2 px-4 rounded
   `}
      >
        Double
      </button>
      <button
        disabled={!isCurrentTurn}
        onClick={() => stand(player.id)}
        className={`
   ${isCurrentTurn ? 'bg-green-500 hover:bg-green-700' : 'disabled'}
    text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none`}
      >
        Stand
      </button>
    </div>
  );
}
