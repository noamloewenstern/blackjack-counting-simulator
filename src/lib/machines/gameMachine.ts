import { assign, choose, createMachine, fromCallback, fromPromise, log, pure, raise } from 'xstate';
import { BlackjackStrategy } from '../strategies/utils';
// import { inspect } from '@xstate/inspect';
import { raiseError, sleep } from '~/utils/helpers';
import type { Card, Hand, RoundHandResult } from '../deck';
import { calcHandCount, isBlackjack } from '../calculateHand';
import { calcHandInfo, calcHandRoundResult } from './utils';
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
  const [playerIdx, handIdx] = playerHandTurn.split('.').map(Number).filter(Number.isInteger);
  if (playerIdx === undefined || handIdx === undefined) raiseError(`Wrong player hand turn: ${playerHandTurn}`);
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
  updateRunningCount: (card: Card) => void;
};
type hitPlayerHandParams = {
  playerIdx: number;
  handIdx: number;
  dealer?: boolean;
  visible?: boolean;
};

export const createGameMachine = ({ deck, gameSettings, initContext, updateRunningCount }: MachineProps) =>
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
                  guard: 'allPlayersSetBetAndReady',
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
          on: {
            HIT_PLAYER: {
              actions: 'hitPlayerHand',
            },
            HIT_DEALER: {
              actions: 'hitDealerHand',
            },
            FINISHED_DEALING_INIT_CARDS: {
              target: 'playersTurn',
              guard: 'allPlayersGot2Cards',
            },
          },
        },
        playersTurn: {
          entry: ['setBlackjackHandsAsFinished', 'setPlayerTurn'],
          initial: 'waitForPlayerAction',
          states: {
            waitForPlayerAction: {
              on: {
                HIT: {
                  guard: 'canHit',
                  actions: [
                    'hitPlayerHand',
                    choose([
                      {
                        guard: 'isHand21OrMore',
                        actions: raise<Context, { type: 'STAND' }>({ type: 'STAND' }),
                      },
                    ]),
                  ],
                },
                STAND: {
                  target: 'finishedPlayerAction',
                },
                DOUBLE: {
                  guard: 'canDouble',
                  target: 'finishedPlayerAction',
                  actions: ['hitPlayerHand', 'doubleBet'],
                },
                SPLIT: {
                  target: 'SplitHand',
                  guard: 'canSplit',
                },
              },
            },
            SplitHand: {
              entry: ['splitHandToTwoHands' /* ? 'setPlayerTurn' */],
              after: {
                400: {
                  actions: 'hitPlayerHand',
                  target: 'waitForPlayerAction',
                },
              },
            },
            finishedPlayerAction: {
              entry: 'setHandAsFinished',
              always: [
                {
                  guard: 'isNotLastPlayedHand',
                  target: 'waitForPlayerAction',
                  actions: 'setPlayerTurn',
                },
                {
                  guard: 'isLastPlayedHand',
                  target: 'noMorePlayerActions',
                },
              ],
            },
            noMorePlayerActions: {
              type: 'final',
            },
          },
          onDone: 'dealerTurn',
        },
        dealerTurn: {
          entry: ['setDealerTurn'], // setting first card as visible
          invoke: {
            // updateing running count for the dealer's first card, since it's visible now
            src: fromPromise(async ({ input: card }) => {
              updateRunningCount(card);
            }),
            input: ({ context }: { context: Context }) => context.dealer.hand.cards[0]!,
          },
          after: {
            400: [
              {
                target: 'finalizeRound',
                guard: 'dealerHasFinalHand',
              },
              {
                actions: ['hitDealerHand'],
                reenter: true,
              },
            ],
          },
        },
        finalizeRound: {
          // todo: implement these actions
          entry: ['setPlayersRoundResult', 'finalizePlayersBalance'],
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
              params?: hitPlayerHandParams;
            }
          | {
              type: 'STAND';
              params?: hitPlayerHandParams;
            }
          | {
              type: 'DOUBLE';
              params?: hitPlayerHandParams;
            }
          | {
              type: 'HIT_PLAYER';
              params?: hitPlayerHandParams;
            }
          | { type: 'FINISHED_DEALING_INIT_CARDS' }
          | { type: 'SPLIT' }
          | {
              type: 'PLACE_BET';
              params: {
                playerId: Player['id'];
                handIdx: HandIdx;
                bet: number;
                overrideAction: 'override' | 'aggregate';
                isReady?: boolean;
              };
            }
          | { type: 'HIT_DEALER' }
          | { type: 'DEAL_ANOTHER_ROUND' }
          | { type: 'CLEAR_TABLE_ROUND' };
      },
    },
    {
      actions: {
        shuffleDeck: () => {
          deck.shuffleDeck();
        },
        hitPlayerHand: assign(({ context, event }) => {
          const allowedEvents = ['HIT', 'STAND', 'DOUBLE', 'HIT_PLAYER'] as const;
          if (!allowedEvents.includes(event.type)) raiseError(`Wrong event type: ${event.type}`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const params = (event as any).params as hitPlayerHandParams;

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
          const { playerIdx, handIdx, visible, player, hand } = getParams();
          const card = deck.drawCard({ visible });
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
        hitDealerHand: assign(({ context, event }) => {
          const isFirstCard = context.dealer.hand.cards.length === 0;
          const visible = !isFirstCard;
          const card = deck.drawCard({ visible });

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
        setPlayersRoundResult: assign({
          players: ({ context }) => {
            const dealerHandInfo = calcHandInfo(context.dealer.hand.cards);
            return context.players.map(player => ({
              ...player,
              hands: player.hands.map(hand => ({
                ...hand,
                roundResult: calcHandRoundResult({
                  dealerHandInfo: dealerHandInfo,
                  playerHandInfo: calcHandInfo(hand.cards),
                }),
              })),
            }));
          },
        }),
        finalizePlayersBalance: assign({
          players: ({ context }) =>
            context.players.map(player => {
              const resultMap: Record<RoundHandResult, number> = {
                blackjack: 2.5,
                win: 2,
                push: 1,
                lose: 0,
                bust: 0,
              };
              const balance = player.hands.reduce((acc, hand) => {
                const { roundResult, bet } = hand;
                return acc + resultMap[roundResult!] * bet;
              }, player.balance);
              return {
                ...player,
                balance,
              };
            }),
        }),
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
        splitHandToTwoHands: assign(({ context }) => {
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
        setPlayerBet: assign(({ context, event }) => {
          if (event.type !== 'PLACE_BET') raiseError('Wrong event type');
          const { playerId, handIdx = 0, bet, overrideAction, isReady = false } = event.params;
          const playerIdx = context.players.findIndex(player => player.id === playerId);
          const player = context.players[playerIdx]!;
          return {
            players: context.players.with(playerIdx, {
              ...player,
              hands: player.hands.with(handIdx, {
                ...player.hands[handIdx]!,
                bet: overrideAction === 'override' ? bet : player.hands[handIdx]!.bet + bet,
                isReady,
              }),
              balance:
                overrideAction === 'override'
                  ? player.balance + player.hands[handIdx]!.bet - bet
                  : player.balance - bet,
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
      },
      actors: {
        DealHandsToPlayersAndDealer: fromCallback(async (sendBack, _, { input }) => {
          const { playersIdxs } = input as { playersIdxs: number[] };
          const dealToPlayers = async () => {
            for (const playerIdx of playersIdxs) {
              await sleep(500);
              sendBack({
                type: 'HIT_PLAYER',
                params: {
                  playerIdx,
                  handIdx: 0, // should be 0, since it's the first hand, on the first deal of the round
                },
              });
            }
          };
          const dealToDealer = async () => {
            await sleep(500);
            sendBack({ type: 'HIT_DEALER' });
          };
          await dealToPlayers();
          await dealToDealer();
          await dealToPlayers();
          await dealToDealer();
          await sleep(400);
          sendBack({ type: 'FINISHED_DEALING_INIT_CARDS' });
        }),
      },
      guards: {
        canHit: ({ context, event }) => {
          const { hand } = getCurrentTurnHand(context);
          return calcHandCount(hand.cards).validCounts.length > 0;
        },
        canDouble: ({ context, event }) => {
          const { hand } = getCurrentTurnHand(context);
          return hand.cards.length === 2;
        },
        isHand21OrMore: ({ context }) => {
          const { hand } = getCurrentTurnHand(context);

          return hand.cards.length > 0 && (calcHandCount(hand.cards).validCounts[0] || 22) >= 21;
        },
        dealerHasFinalHand: ({ context }) => {
          const { dealerMustHitOnSoft17 } = gameSettings;

          const { hand } = context.dealer;
          const validCounts = calcHandCount(hand.cards).validCounts;
          const hasOverSoft17 =
            validCounts.length === 0 ||
            validCounts[0]! > 17 ||
            /* soft 17 */
            (validCounts[0] === 17 &&
              (!validCounts[1] /* means the count is total, not soft */ ||
                !dealerMustHitOnSoft17)); /* doesn't have to hit on soft 17 */
          if (hasOverSoft17) return true;
          const allPlayersBust = context.players.every(player => {
            return player.hands.every(hand => {
              const validCounts = calcHandCount(hand.cards).validCounts;
              return validCounts.length === 0 || validCounts[0]! > 21;
            });
          });
          if (allPlayersBust) return true;
          return false;
        },
        allPlayersGot2Cards: ({ context }) => {
          return context.players.every(player => player.hands.every(hand => hand.cards.length === 2));
        },
        isLastPlayedHand: ({ context }) => {
          const { playerIdx, player, handIdx } = getCurrentTurnHand(context);
          return playerIdx === context.players.length - 1 && handIdx === player.hands.length - 1;
        },
        isNotLastPlayedHand: ({ context }) => {
          const { playerIdx, player, handIdx } = getCurrentTurnHand(context);
          return !(playerIdx === context.players.length - 1 && handIdx === player.hands.length - 1);
        },
        canSplit: ({ context }) => {
          const { hand } = getCurrentTurnHand(context);
          return hand.cards.length === 2 && hand.cards[0]!.value === hand.cards[1]!.value;
        },
        allPlayersSetBetAndReady: ({ context }) => {
          return context.players.every(player => player.hands.every(hand => hand.bet > 0 && hand.isReady));
        },
      },
    },
  );
