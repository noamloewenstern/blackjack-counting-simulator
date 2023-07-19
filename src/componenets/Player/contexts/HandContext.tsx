import { type ReactNode, createContext, useContext, useMemo } from 'react';
import { calculateHand } from '~/lib/calculateHand';
import usePlayer from '../hooks/usePlayer';
import { type Hand } from '~/lib/deck';

type IHandContextState = ReturnType<typeof useGetCalculateHandContext>;
export const HandContext = createContext<IHandContextState>({} as never);

function useGetCalculateHandContext({ hand }: ProviderProps) {
  const { player, currentTurnInfo, isCurrentTurn } = usePlayer();
  const { validCounts, bustCount } = useMemo(() => {
    return currentTurnInfo
      ? calculateHand(hand.cards)
      : {
          validCounts: [],
          bustCount: 0,
        };
  }, [currentTurnInfo, hand.cards]);

  const counts = validCounts.length > 0 ? validCounts : [bustCount];
  const finalCount = validCounts[0] ?? bustCount;
  const didBust = validCounts.length === 0 && bustCount > 21;
  const isBlackjack = hand.cards.length === 2 && validCounts[0] === 21;
  const isCurrentTurnHand = currentTurnInfo?.hand.id === hand.id;

  const handState = {
    player,
    hand,
    isCurrentPlayerTurn: isCurrentTurn,
    currentTurnInfo,
    isCurrentTurnHand,
    counts,
    finalCount,
    didBust,
    isBlackjack,
  };
  return handState;
}

type ProviderProps = {
  hand: Hand;
};
export function HandProvider({ children, hand }: ProviderProps & { children: ReactNode }) {
  const handState = useGetCalculateHandContext({ hand });
  return <HandContext.Provider value={handState}>{children}</HandContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
