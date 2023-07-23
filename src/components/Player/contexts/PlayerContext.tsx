import { ReactNode, createContext, useContext } from 'react';
import { type Player, getCurrentTurnHand } from '~/lib/machines/gameMachine';
import { useGameMachine } from '~/lib/machines/gameMachineContext';

type IPlayerContextState = ReturnType<typeof useGetCalculatePlayerContext>;
export const PlayerContext = createContext<IPlayerContextState>({} as never);

type ProviderProps = {
  children: ReactNode;
  player: Player;
};
function useGetCalculatePlayerContext(player: Player) {
  const { state } = useGameMachine();
  const { players, playerHandTurn } = state.context;
  const isCurrentlySomePlayerTurn = !!playerHandTurn && playerHandTurn !== 'dealer';
  const currentTurnInfo = (isCurrentlySomePlayerTurn && getCurrentTurnHand({ players, playerHandTurn })) || undefined;
  const isCurrentTurn = currentTurnInfo && currentTurnInfo.player.id === player.id;

  const playerState = {
    player,
    isCurrentTurn,
    currentTurnInfo,
  };
  return playerState;
}
export function PlayerProvider({ children, player }: ProviderProps) {
  const playerState = useGetCalculatePlayerContext(player);
  return <PlayerContext.Provider value={playerState}>{children}</PlayerContext.Provider>;
}
