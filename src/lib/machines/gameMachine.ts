import { assign, createMachine, fromCallback, pure, raise } from 'xstate';
import { BlackjackStrategy } from '../strategies/utils';
// import { inspect } from '@xstate/inspect';
import { raiseError } from '~/utils/helpers';
import type { Card, Hand } from '../deck';
import { calculateHand, isBlackjack } from '../calculateHand';
// inspect();

export type Player = {
  id: string;
  name: string;
  balance: number;
  hands: Hand[];
  strategy?: BlackjackStrategy;
};
type Dealer = {
  id: 'dealer';
  hand: Omit<Hand, 'bet'>;
};
type PlayerIdx = number;
type HandIdx = number;
type Context = {
  // deck: Card[];
  players: Player[];
  dealer: Dealer;
  playerHandTurn?: 'dealer' | `${PlayerIdx}.${HandIdx}`;
};
type GameSettings = {
  numberDecksInShoe: number;
  dealerMustHitOnSoft17: boolean;
  allowedToDoubleAfterSplit: boolean;
};
export function getCurrentTurnHand({ players, playerHandTurn }: Pick<Context, 'players' | 'playerHandTurn'>) {
  if (!playerHandTurn) raiseError('No player hand turn');
  const [playerIdx, handIdx] = playerHandTurn.split('.').map(Number).filter(Number.isInteger) as [number, number];
  const player = players[playerIdx]!;
  const hand = player.hands[handIdx]!;
  return { player, hand, playerIdx, handIdx };
}
type MachineProps = {
  deck: {
    initDeck: () => void;
    shuffleDeck: () => void;
    drawCard: (opts?: { visible?: boolean }) => Card;
  };
  gameSettings: GameSettings;
  initContext: Context;
};
export const createGameMachine = ({ deck, gameSettings, initContext }: MachineProps) =>
  createMachine(
    {
      id: 'BlackjackGameMachine',
      context: initContext,
      initial: 'initial',
      states: {
        initial: {
          on: {
            START_GAME: {
              target: 'placePlayerBets',
              // actions: ['shuffleDeck', 'initContext'],
              actions: ['shuffleDeck'],
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
              ],
              on: {
                PLACE_BET: {
                  actions: 'setPlayerBet',
                },
              },
            },
            allBetsPlaced: {
              type: 'final',
            },
          },
          onDone: {
            target: 'dealHands',
          },
        },
        dealHands: {
          invoke: {
            id: 'invokeDealHandsToPlayersAndDealer',
            src: 'DealHandsToPlayersAndDealer',
            input: ({ context }: { context: Context }) => ({
              playersIdxs: Array.from({ length: context.players.length }, (_, i) => i),
            }),
          },
          initial: 'waitForActionToDealCard',
          states: {
            waitForActionToDealCard: {
              always: {
                target: 'doneDealingInitCards',
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
                  target: 'doneDealingInitCards',
                },
              },
            },
            doneDealingInitCards: {
              type: 'final',
            },
          },
          onDone: {
            target: 'playersTurn',
          },
        },
        playersTurn: {
          entry: ['setBlackjackHandsAsFinished', 'setPlayerTurn'],
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
              target: 'finalizeRound',
              guard: 'dealerHasFinalHand',
            },
            {
              target: 'dealerTurn',
            },
          ],
        },
        dealerTurn: {
          entry: 'setDealerTurn',
          always: [
            {
              target: 'finalizeRound',
              guard: 'dealerHasFinalHand',
            },
            {
              actions: raise({ type: 'HIT_DEALER' }),
            },
          ],
          on: {
            HIT_DEALER: {
              actions: ['hitDealer', 'testFinishedDealerTurn'],
            },
            FINISHED_DEALER_TURN: {
              target: 'finalizeRound',
            },
          },
        },
        finalizeRound: {
          entry: ['setPlayersRoundOutcome', 'finalizePlayersBalance', 'showRoundOutcome'],
          on: {
            CLEAR_TABLE_ROUND: {
              actions: ['clearTableCards', 'clearPlayersBets'],
            },
            DEAL_ANOTHER_ROUND: {
              actions: ['clearTableCards', 'clearPlayersBets'],
              target: 'placePlayerBets',
            },
          },
        },
      },

      types: {} as {
        // input: {
        //   gameSettings: GameSettings;
        // };

        events:
          | { type: 'START_GAME' }
          | {
              type: 'HIT';
              params?: {
                playerIdx: number;
                handIdx: number;
                dealer?: boolean;
                visible?: boolean;
              };
            }
          | {
              type: 'STAND';
              params?: {
                playerIdx: number;
                handIdx: number;
                dealer?: boolean;
                visible?: boolean;
              };
            }
          | {
              type: 'DOUBLE';
              params?: {
                playerIdx: number;
                handIdx: number;
                dealer?: boolean;
                visible?: boolean;
              };
            }
          | {
              type: 'HIT_HAND';
              params?: {
                playerIdx: number;
                handIdx: number;
                dealer?: boolean;
                visible?: boolean;
              };
            }
          | { type: 'FINISHED_DEALING_INIT_CARDS' }
          | { type: 'SPLIT' }
          | {
              type: 'PLACE_BET';
              params: {
                playerId: Player['id'];
                handIdx: HandIdx;
                bet: number;
              };
            }
          | {
              type: 'HIT_DEALER';
            }
          | { type: 'FINISHED_DEALER_TURN' }
          | { type: 'DEAL_ANOTHER_ROUND' }
          | { type: 'CLEAR_TABLE_ROUND' };
      },
    },
    {
      actions: {
        shuffleDeck: () => {
          deck.shuffleDeck();
        },
        hitHand: assign(({ context, event, action }) => {
          if (event.type !== 'HIT_HAND') raiseError('Wrong event type');
          console.log({ event, action });
          const params = (event.params || (action.params as typeof event.params)) ?? raiseError('No params found');
          // TODO: check if gets params from action/event:

          function getParams() {
            if (!params) {
              const { playerIdx, player, hand, handIdx } = getCurrentTurnHand(context);
              const dealer = false;
              const visible = true;
              return { playerIdx, handIdx, dealer, visible, player, hand };
            } else {
              const { playerIdx, handIdx, dealer, visible = true } = params;
              const player = context.players[playerIdx]!;
              const hand = player.hands[handIdx]!;
              return { playerIdx, handIdx, dealer, visible, player, hand };
            }
          }
          const { playerIdx, handIdx, dealer, visible, player, hand } = getParams();
          const card = deck.drawCard({ visible });

          if (dealer) {
            return {
              dealer: {
                ...context.dealer,
                hand: {
                  ...context.dealer.hand,
                  cards: context.dealer.hand.cards.concat(card),
                },
              },
            };
          }
          return {
            players: context.players.with(playerIdx, {
              ...player,
              hands: player.hands.with(handIdx, {
                ...hand,
                cards: hand.cards.concat(card),
              }),
            }),
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
        // initContext: assign(initContext), // ! todo
        hitDealer: assign(({ context }) => {
          const card = deck.drawCard();
          return {
            dealer: {
              ...context.dealer,
              hand: {
                ...context.dealer.hand,
                cards: context.dealer.hand.cards.concat(card),
              },
            },
          };
        }),
        setPlayersRoundOutcome: assign({}),
        finalizePlayersBalance: assign({}),
        setBlackjackHandsAsFinished: assign(({ context }) => {
          return {
            players: context.players.map(player => {
              const hand = {
                ...player.hands[0]!, // only has one hand, since it's the first deal of the round
                isFinished: isBlackjack(player.hands[0]!.cards),
              };
              return {
                ...player,
                hands: [hand],
              };
            }),
          };
        }),
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
        splitHandTo2Hands: assign(({ context }) => {
          const { playerIdx, player, hand, handIdx } = getCurrentTurnHand(context);
          if (hand.cards.length !== 2) throw new Error('Cannot split hand with more than 2 cards');
          const [card1, card2] = hand.cards as [Card, Card];
          return {
            players: context.players.with(playerIdx, {
              ...player,
              hands: player.hands
                .with(handIdx, {
                  ...hand,
                  cards: [card1],
                })
                .concat({
                  ...hand,
                  cards: [card2],
                }),
            }),
          };
        }),
        setPlayerBet: assign(({ context, action, event }) => {
          // if (event.type !== 'PLACE_BET') throw new Error('Wrong event type');
          if (event.type !== 'PLACE_BET') raiseError('Wrong event type');
          const { playerId, handIdx = 0, bet } = event.params;
          const playerIdx = context.players.findIndex(player => player.id === playerId);
          const player = context.players[playerIdx]!;
          return {
            players: context.players.with(playerIdx, {
              ...player,
              hands: player.hands.with(handIdx, {
                ...player.hands[handIdx]!,
                bet: player.hands[handIdx]!.bet + bet,
              }),
            }),
          };
        }),
        setDealerTurn: assign({
          playerHandTurn: 'dealer',
          dealer: ({ context }) => ({
            ...context.dealer,
            hand: {
              ...context.dealer.hand,
              cards: context.dealer.hand.cards.with(0, {
                ...context.dealer.hand.cards[0]!,
                isVisible: true,
              }),
            },
          }),
        }),
        testFinishedDealerTurn: pure(({ context }) => {
          // todo: test if dealer has finished turn
          const dealerHasFinalHand = true;
          if (dealerHasFinalHand) {
            return raise({ type: 'FINISHED_DEALER_TURN' });
          }
        }),
      },
      actors: {
        DealHandsToPlayersAndDealer: fromCallback((sendBack, _, { input }) => {
          const { playersIdxs } = input as { playersIdxs: number[] };
          const dealToPlayers = () => {
            playersIdxs.forEach(playerIdx => {
              sendBack({
                type: 'HIT_HAND',
                params: {
                  playerIdx,
                  handIdx: 0, // should be 0, since it's the first hand, on the first deal of the round
                },
              });
            });
          };
          const dealToDealer = ({ visible = true } = {}) => {
            sendBack({
              type: 'HIT_HAND',
              params: {
                playerId: 'dealer',
                handIdx: 0,
                dealer: true,
                visible,
              },
            });
          };
          dealToPlayers();
          dealToDealer({ visible: false });
          dealToPlayers();
          dealToDealer();
          sendBack({ type: 'FINISHED_DEALING_INIT_CARDS' });
        }),
      },
      guards: {
        canHit: ({ context, event }) => {
          const { hand } = getCurrentTurnHand(context);
          return calculateHand(hand.cards).validCounts.length > 0;
        },
        canDouble: ({ context, event }) => {
          const { hand } = getCurrentTurnHand(context);
          return hand.cards.length === 2;
        },
        isOver21: ({ context, event }) => {
          const { hand } = getCurrentTurnHand(context);
          return calculateHand(hand.cards).validCounts.length === 0;
        },
        dealerHasFinalHand: ({ context, event }) => {
          const { dealerMustHitOnSoft17 } = gameSettings;

          const { hand } = context.dealer;
          const validCounts = calculateHand(hand.cards).validCounts;
          return (
            validCounts.length === 0 ||
            validCounts[0]! > 17 ||
            /* soft 17 */
            (validCounts[0] === 17 &&
              (!validCounts[1] /* means the count is total, not soft */ ||
                !dealerMustHitOnSoft17)) /* doesn't have to hit on soft 17 */
          );
        },
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
