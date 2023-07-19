/* eslint-disable react-refresh/only-export-components */
import { useActor } from '@xstate/react';
import { createContext, useContext, useMemo } from 'react';
import { Player, createGameMachine } from './gameMachine';
import { useDeckStore } from '~/stores/deckStore';
import { useSettingsStore } from '~/stores/settingsStore';

type Context = ReturnType<typeof useGameMachineContext>;
export const GameMachineContext = createContext<Context | null>(null);

const initPlayers: Player[] = [
  {
    id: 'player1',
    name: 'player interactive',
    hands: [],
    balance: 10_000,
    strategy: 'interactive',
  },
  {
    id: 'player2',
    name: 'player perfect-blackjack',
    hands: [],
    balance: 10_000,
    strategy: 'perfect-blackjack',
  },
  {
    id: 'player3',
    name: 'player counting',
    hands: [],
    balance: 10_000,
    strategy: 'counting',
  },
];
function useGameMachineContext() {
  const gameSettings = useSettingsStore();
  const { drawCard, shuffle } = useDeckStore();
  const gameMachine = createGameMachine({
    deck: {
      drawCard,
      initDeck: () => shuffle(),
      shuffleDeck: () => shuffle(),
    },
    gameSettings: gameSettings,
    initContext: {
      dealer: {
        id: 'dealer',
        hand: {
          id: 'dealerHand',
          cards: [],
          isFinished: false,
        },
      },
      playerHandTurn: undefined,
      players: initPlayers,
    },
  });

  const [state, send, service] = useActor(gameMachine);

  const allPlayersSetBets = useMemo(
    () => state.context.players.every(player => player.hands.every(hand => hand.bet > 0)),
    [state.context.players],
  );
  const isRoundFinished = state.matches('finalizeRound');
  const isPlayersTurn = state.matches('playersTurn.*');
  const isWaitingForBets = state.matches('placePlayerBets');

  const context = {
    state,
    context: state.context,
    send,
    service,
    allPlayersSetBets,
    isRoundFinished,
    isPlayersTurn,
    isWaitingForBets,
  };
  return context;
}
export function GameMachineProvider({ children }: { children: React.ReactNode }) {
  const context = useGameMachineContext();
  return <GameMachineContext.Provider value={context}>{children}</GameMachineContext.Provider>;
}

export const useGameMachine = () => useContext(GameMachineContext)!;
