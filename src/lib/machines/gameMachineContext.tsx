/* eslint-disable react-refresh/only-export-components */
import { useActor } from '@xstate/react';
import { createContext, useContext } from 'react';
import { Player, createGameMachine } from './gameMachine';
import { useDeckStore } from '~/stores/deckStore';

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
  const { deck, drawCard, shuffle } = useDeckStore();
  const gameMachine = createGameMachine({
    deck: {
      drawCard,
      initDeck: () => shuffle(),
      shuffleDeck: () => shuffle(),
    },
    gameSettings: {
      allowedToDoubleAfterSplit: true,
      dealerMustHitOnSoft17: true,
      numberDecksInShoe: 6,
    },
    initContext: {
      dealer: {
        id: 'dealer',
        hand: {
          cards: [],
          isFinished: false,
        },
      },
      playerHandTurn: undefined,
      players: initPlayers,
    },
  });

  const [state, send, service] = useActor(gameMachine);
  const context = {
    state,
    send,
    service,
  };
  return context;
}
export function GameMachineProvider({ children }: { children: React.ReactNode }) {
  const context = useGameMachineContext();
  return <GameMachineContext.Provider value={context}>{children}</GameMachineContext.Provider>;
}

export const useGameMachine = () => useContext(GameMachineContext)!;
