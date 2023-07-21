import { type ReactNode, createContext, useMemo } from 'react';
import usePlayer from '../hooks/usePlayer';
import { type Hand } from '~/lib/deck';
import { calcHandInfo } from '~/lib/machines/utils';

type IHandContextState = ReturnType<typeof useGetCalculateHandContext>;
export const HandContext = createContext<IHandContextState>({} as never);

function useGetCalculateHandContext({ hand }: ProviderProps) {
  const { player, currentTurnInfo, isCurrentTurn } = usePlayer();
  const { counts, finalCount, didBust, isBlackjack } = useMemo(() => {
    return hand.cards.length > 0
      ? calcHandInfo(hand.cards)
      : {
          counts: [0],
          finalCount: 0,
          didBust: false,
          isBlackjack: false,
        };
  }, [hand.cards]);

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
