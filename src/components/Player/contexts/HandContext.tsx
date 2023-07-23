import { type ReactNode, createContext, useMemo, useCallback } from 'react';
import usePlayer from '../hooks/usePlayer';
import { type Hand } from '~/lib/deck';
import { calcHandInfo } from '~/lib/machines/utils';
import { useSettingsStore } from '~/stores/settingsStore';
import { useGameMachine } from '~/lib/machines/gameMachineContext';

type IHandContextState = ReturnType<typeof useGetCalculateHandContext>;
export const HandContext = createContext<IHandContextState>({} as never);

function useGetCalculateHandContext({ hand }: ProviderProps) {
  const { send } = useGameMachine();
  const { player, isCurrentTurn, currentTurnInfo } = usePlayer();
  const { cards } = hand;
  const { counts, finalCount, didBust, isBlackjack } = useMemo(() => {
    return cards.length > 0
      ? calcHandInfo(cards)
      : {
          counts: [0],
          finalCount: 0,
          didBust: false,
          isBlackjack: false,
        };
  }, [cards]);
  const { allowedToDouble } = useSettingsStore();

  const isHandCurrentTurn = isCurrentTurn && currentTurnInfo!.hand.id === hand.id;
  const canDouble = useMemo(() => allowedToDouble && cards.length === 2, [allowedToDouble, cards.length]);
  const canSplit = useMemo(() => cards.length === 2 && cards[0]!.value === cards[1]!.value, [cards]);

  const hit = useCallback(() => isHandCurrentTurn && send({ type: 'HIT' }), [isHandCurrentTurn, send]);
  const double = useCallback(
    () => isHandCurrentTurn && canDouble && send({ type: 'DOUBLE' }),
    [canDouble, isHandCurrentTurn, send],
  );
  const stand = useCallback(() => isHandCurrentTurn && send({ type: 'STAND' }), [isHandCurrentTurn, send]);
  const split = useCallback(() => isHandCurrentTurn && send({ type: 'SPLIT' }), [isHandCurrentTurn, send]);

  const handState = {
    player,
    hand,
    currentTurnInfo,
    isPlayerCurrentTurn: isCurrentTurn,
    isHandCurrentTurn,
    counts,
    finalCount,
    didBust,
    isBlackjack,
    canDouble,
    canSplit,
    actions: {
      hit,
      double,
      stand,
      split,
    },
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
