/* eslint-disable react-refresh/only-export-components */
import { useActor } from '@xstate/react';
import { createContext, useContext, useMemo } from 'react';
import { Player, createGameMachine } from './gameMachine';
import { useDeckStore } from '~/stores/deckStore';
import { useAutomationSettingsStore, useSettingsStore } from '~/stores/settingsStore';
import { useRunningCount } from '~/stores/countStore';
import { nanoid } from 'nanoid';

type Context = ReturnType<typeof useGameMachineContext>;
export const GameMachineContext = createContext<Context | null>(null);

const initPlayers: Player[] = [
  {
    id: 'player1',
    name: 'player interactive',
    hands: [
      {
        id: 'Hand-0',
        bet: 0,
        cards: [],
        isFinished: false,
        isReady: false,
      },
    ],
    balance: 150_000,
    strategy: 'interactive',
  },
  {
    id: 'player2',
    name: 'player perfect-blackjack',
    hands: [
      {
        id: 'Hand-0',
        bet: 0,
        cards: [],
        isFinished: false,
        isReady: false,
      },
    ],
    balance: 150_000,
    strategy: 'perfect-blackjack',
  },
  {
    id: 'player3',
    name: 'player counting',
    hands: [
      {
        id: 'Hand-0',
        bet: 0,
        cards: [],
        isFinished: false,
        isReady: false,
      },
    ],
    balance: 150_000,
    strategy: 'counting',
  },
];
function useGameMachineContext() {
  const gameSettings = useSettingsStore();
  const automationSettings = useAutomationSettingsStore();
  const { drawCard, shuffle, shoe } = useDeckStore();
  const { updateCount } = useRunningCount();
  const gameMachine = useMemo(
    () =>
      createGameMachine({
        id: `BlackjackGameMachine-${nanoid()}`,
        deck: {
          drawCard,
          initDeck: () => shuffle(),
          shuffleDeck: () => shuffle(),
          shoe,
        },
        gameSettings: {
          ...gameSettings,
          automation: automationSettings,
        },
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
          roundsPlayed: 0,
        },
        updateRunningCount: card => updateCount(card),
      }),
    [automationSettings, drawCard, gameSettings, shoe, shuffle, updateCount],
  );
  const [state, send, service] = useActor(gameMachine, {
    // devTools: true,
    // logger: msg => console.log(msg),
  });
  const sendWithLog = (event: Parameters<typeof send>[0]) => {
    send(event);
  };

  const allPlayersSetBets = useMemo(
    () => state.context.players.every(player => player.hands.every(hand => hand.bet > 0)),
    [state.context.players],
  );
  const isShufflingAfterRound = state.matches('FinalizeRound.ShuffleDeckBeforeNextDeal');

  const isRoundFinished = state.matches('FinalizeRound') || isShufflingAfterRound;
  const canDealNextRound = isRoundFinished && state.can({ type: 'DEAL_ANOTHER_ROUND' });
  const isPlayersTurn = state.matches('PlayersTurn');
  const isWaitingForBets = state.matches('PlacePlayerBets');

  const context = {
    state,
    context: state.context,
    send: sendWithLog,
    service,
    allPlayersSetBets,
    isRoundFinished,
    canDealNextRound,
    isShufflingAfterRound,
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
