import '@total-typescript/ts-reset';

import { TypegenEnabled, assign, choose, createMachine, interpret, raise } from 'xstate';
import { BlackjackStrategy } from '../strategies/utils';
type Card = {
  suit: string;
  value: string;
};
type Hand = {
  cards: Card[];
  bet: number;
  isFinished: boolean;
};
type Player = {
  id: string;
  name: string;
  balance: number;
  hands: Hand[];
  strategy?: BlackjackStrategy;
};
type Dealer = {
  hand: Hand;
};
type Context = {
  deck: Card[];
  players: Player[];
  dealer: Dealer;
  playerHandTurn: `${number}.${number}`;
};
function getCurrentTurnHand({ players, playerHandTurn }: Pick<Context, 'players' | 'playerHandTurn'>) {
  const [playerIdx, handIdx] = playerHandTurn.split('.').map(Number).filter(Number.isInteger) as [number, number];
  const player = players[playerIdx]!;
  const hand = player.hands[handIdx]!;
  return { player, hand, playerIdx, handIdx };
}
export const machine = createMachine(
  {
    id: 'BlackjackGameMachine',
    context: {
      deck: [] as Card[],
      players: [] as Player[],
      dealer: {} as Dealer,
      playerHandTurn: '' as `${number}.${number}`,
    } satisfies Context,
    initial: 'Initial state',
    states: {
      'Initial state': {
        on: {
          INIT_GAME: {
            target: 'placePlayerBets',
            actions: ['shuffleDeck', 'initContextInfo'],
          },
        },
      },
      placePlayerBets: {
        initial: 'waitForBet',
        states: {
          waitForBet: {
            always: [
              {
                target: 'allBetsPlaced',
                guard: 'allPlayersSetBet',
              },
              {
                target: 'waitForBet',
                // reenter: true,
              },
            ],
            on: {
              PLACE_BET: {
                target: 'waitForBet',
                // reenter: true,
                actions: 'setPlayerBet',
              },
            },
          },
          allBetsPlaced: {
            type: 'final',
          },
        },
        onDone: {
          target: 'DealHands',
        },
      },
      DealHands: {
        invoke: {
          src: 'DealHandsToPlayersAndDealer',
          id: 'invokeDealHandsToPlayersAndDealer',
        },
        initial: 'waitForActionToDealCard',
        states: {
          waitForActionToDealCard: {
            always: {
              target: 'DoneDealingInitCards',
              guard: 'allPlayersGot2Cards',
            },
            on: {
              HIT_HAND: {
                // target: 'waitForActionToDealCard',
                // reenter: true,
                actions: 'hitHand',
              },
              FINISHED_DEALING_INIT_CARDS: {
                // ? invoked from DealHandsToPlayersAndDealer
                target: 'DoneDealingInitCards',
              },
            },
          },
          DoneDealingInitCards: {
            type: 'final',
          },
        },
        onDone: {
          target: 'PlayersTurn',
        },
      },
      PlayersTurn: {
        entry: ['setPlayerTurn'],
        initial: 'waitForPlayerAction',
        states: {
          waitForPlayerAction: {
            always: {
              guard: 'isOver21',
              actions: raise({ type: 'STAND' }),
            },
            on: {
              HIT: {
                // target: 'waitForPlayerAction',
                // reenter: true,
                guard: 'canHit',
                actions: 'hitHand',
              },
              STAND: {
                target: 'finishedPlayerAction',
              },
              DOUBLE: {
                target: 'finishedPlayerAction',
                guard: 'canDouble',
                actions: ['hitHand', 'doubleBet'],
              },
              SPLIT: {
                target: 'waitForPlayerAction',
                guard: 'canSplit',
                actions: ['splitHandTo2Hands' /* ? 'setPlayerTurn' */],
              },
            },
          },
          finishedPlayerAction: {
            entry: 'setHandAsFinished',
            always: [
              {
                target: 'waitForPlayerAction',
                actions: 'setPlayerTurn',
                guard: 'isNotLastPlayedHand',
              },
              {
                target: 'noMorePlayerActions',
              },
            ],
          },
          noMorePlayerActions: {
            type: 'final',
          },
        },
        onDone: [
          {
            target: 'DetermineOutcome',
            guard: 'dealerHasFinalHand',
          },
          {
            target: 'DEALER_TURN',
          },
        ],
      },
      DEALER_TURN: {
        entry: 'hitDealer',
        always: {
          target: 'DetermineOutcome',
          guard: 'dealerHasFinalHand',
        },
      },
      DetermineOutcome: {
        entry: ['setPlayersRoundOutcome', 'finalizePlayersBalance'],
      },
    },

    types: {
      events: {} as
        | { type: 'INIT_GAME' }
        | { type: 'HIT' }
        | { type: 'STAND' }
        | { type: 'DOUBLE' }
        | {
            type: 'HIT_HAND';
            params: {
              playerId: Player['id'];
              handIdx: number;
              dealer: boolean;
            };
          }
        | { type: 'FINISHED_DEALING_INIT_CARDS' }
        | { type: 'SPLIT' }
        | { type: 'PLACE_BET' },
    },
  },
  {
    actions: {
      shuffleDeck: ({ context, event }) => {},
      hitHand: assign(({ context }) => {
        const { playerIdx, player, hand, handIdx } = getCurrentTurnHand(context);
        const card = context.deck.pop()!;
        // hand.cards.push(card);
        return {
          players: context.players.with(playerIdx, {
            ...player,
            hands: player.hands.with(handIdx, {
              ...hand,
              cards: hand.cards.concat(card),
            }),
          }),
          deck: [...context.deck],
        };
      }),
      doubleBet: assign(({ context }) => {
        const { playerIdx, player, hand, handIdx } = getCurrentTurnHand(context);
        return {
          players: context.players.with(playerIdx, {
            ...player,
            hands: player.hands.with(handIdx, {
              ...hand,
              bet: hand.bet * 2,
            }),
          }),
        };
      }),
      setHandAsFinished: assign({
        players: ({ context }) => {
          const { playerIdx, player, hand, handIdx } = getCurrentTurnHand(context);
          return context.players.with(playerIdx, {
            ...player,
            hands: player.hands.with(handIdx, {
              ...hand,
              isFinished: true,
            }),
          });
        },
      }),
      initContextInfo: assign({}),
      hitDealer: assign(({ context }) => {
        const card = context.deck.pop()!;
        return {
          dealer: {
            ...context.dealer,
            hand: {
              ...context.dealer.hand,
              cards: context.dealer.hand.cards.concat(card),
            },
          },
          deck: [...context.deck],
        };
      }),
      setPlayersRoundOutcome: assign({}),
      finalizePlayersBalance: assign({}),
      setPlayerTurn: assign(({ context }) => {
        for (const [pIdx, player] of context.players.entries()) {
          for (const [hIdx, hand] of player.hands.entries()) {
            if (!hand.isFinished) {
              return {
                playerHandTurn: `${pIdx}.${hIdx}` as const,
              };
            }
          }
        }
        console.error('No player hand found');
        throw new Error('No player hand found');
      }),
      splitHandTo2Hands: assign({}),
      setPlayerBet: assign({}),
    },
    actors: {
      DealHandsToPlayersAndDealer: createMachine({
        /** @xstate-layout N4IgpgJg5mDOIC5gF8A0IB2B7CdGgAoBbAQwGMALASwzAEp8QAHLWKgFyqw0YA9EAjACZ0AT0FDkU5EA */
      }),
    },
    guards: {
      canHit: ({ context, event }) => false,
      canDouble: ({ context, event }) => {
        const { hand } = getCurrentTurnHand(context);
        return hand.cards.length === 2;
      },
      isOver21: ({ context, event }) => false,
      dealerHasFinalHand: ({ context, event }) => {},
      allPlayersGot2Cards: ({ context }) => {
        return context.players.every(player => player.hands.every(hand => hand.cards.length === 2));
      },
      isNotLastPlayedHand: ({ context }) => {
        const { playerIdx, player, handIdx } = getCurrentTurnHand(context);
        return !(playerIdx === context.players.length - 1 && handIdx === player.hands.length - 1);
      },
      canSplit: ({ context }) => {
        const { hand } = getCurrentTurnHand(context);
        return hand.cards.length === 2 && hand.cards[0]!.value === hand.cards[1]!.value;
      },
      allPlayersSetBet: ({ context }) => {
        return context.players.every(player => player.hands.every(hand => hand.bet > 0));
      },
    },
  },
);
