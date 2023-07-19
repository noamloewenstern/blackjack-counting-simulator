/* eslint-disable react-refresh/only-export-components */
import { useActor } from '@xstate/react';
import { createContext, useContext, useEffect, useMemo } from 'react';
import { Player, createGameMachine } from './gameMachine';
import { useDeckStore } from '~/stores/deckStore';
import { useSettingsStore } from '~/stores/settingsStore';
import { Card } from '../deck';

type Context = ReturnType<typeof useGameMachineContext>;
export const GameMachineContext = createContext<Context | null>(null);

const initPlayers: Player[] = [
  {
    id: 'player1',
    name: 'player interactive',
    hands: [
      {
        id: 'player1Hand',
        bet: 0,
        cards: [],
        isFinished: false,
        isReady: false,
      },
    ],
    balance: 10_000,
    strategy: 'interactive',
  },
  {
    id: 'player2',
    name: 'player perfect-blackjack',
    hands: [
      {
        id: 'player2Hand',
        bet: 0,
        cards: [],
        isFinished: false,
        isReady: false,
      },
    ],
    balance: 10_000,
    strategy: 'perfect-blackjack',
  },
  {
    id: 'player3',
    name: 'player counting',
    hands: [
      {
        id: 'player3Hand',
        bet: 0,
        cards: [],
        isFinished: false,
        isReady: false,
      },
    ],
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
          isReady: true,
        },
      },
      playerHandTurn: undefined,
      players: initPlayers,
    },
  });
  const [state, send, service] = useActor(gameMachine, {
    devTools: true,
    logger: msg => console.log(msg),
  });

  useEffect(() => {
    const parsed = typeof state.value === 'object' ? JSON.stringify(state.value) : state.value;
    console.log('state.value', parsed);
    // state.matches('placePlayerBets');
  }, [state.value]);
  useEffect(() => {
    // console.log('state.done', state.done);
  }, [state.done]);

  // console.table(gameMachine);
  // console.table(state)
  // state.historyValue;

  const allPlayersSetBets = useMemo(
    () => state.context.players.every(player => player.hands.every(hand => hand.bet > 0)),
    [state.context.players],
  );
  const isRoundFinished = state.matches('finalizeRound');
  const isPlayersTurn = state.matches('playersTurn');
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
