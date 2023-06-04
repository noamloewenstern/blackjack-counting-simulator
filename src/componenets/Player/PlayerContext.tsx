import { ReactNode, createContext, useContext } from 'react';
import { IPlayer, useGameStore } from '../../stores/gameStore';
import { calculateHand, useHasBlackjack } from '../../lib/calculateHand';

type IPlayerContextState = {
  player: IPlayer;

  isCurrentTurn: boolean;
  counts: ReturnType<typeof calculateHand> | null;
  didBust: boolean;
  hasBlackjack: boolean;
};
const PlayerContext = createContext<IPlayerContextState | null>(null);

type ProviderProps = {
  children: ReactNode;
  player: IPlayer;
};
export const PlayerProvider = ({ children, player }: ProviderProps) => {
  const isCurrentTurn = useGameStore(state => state.currentPlayerId === player.id);
  const didGameStart = useGameStore(state => state.didGameStart);

  const playerHasCards = player.hand.length > 0;
  const counts = didGameStart && playerHasCards ? calculateHand(player.hand) : null;
  const didBust = counts?.validCounts.length === 0 && counts?.bustCount > 21;
  const hasBlackjack = useHasBlackjack(player.hand);

  const playerState: IPlayerContextState = {
    player,
    isCurrentTurn,
    counts,
    didBust,
    hasBlackjack,
  };
  return <PlayerContext.Provider value={playerState}>{children}</PlayerContext.Provider>;
};

/* create usePlayer hook for react */
export const usePlayer = () => {
  const player = useContext(PlayerContext);
  if (!player) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return player;
};
