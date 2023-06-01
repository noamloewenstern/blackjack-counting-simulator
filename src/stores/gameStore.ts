/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { useDeckStore } from './deckStore';
import { Card, Hand } from '../lib/deck';
import { calculateHand, isBlackJack } from '../lib/calculateHand';
import { sleep } from '../utils/helpers';

export const isAce = (card: Card) => card.number === 'A';
export type PlayerId = 0 | 1 | 2;

export type IPlayer = {
  id: PlayerId;
  hand: Hand;
  bet: number;
  balance: number;
  stratergy: 'interactive' | 'perfect-blackjack' | 'counting';
  finalCount?: number;
  ready: boolean;
  finished: boolean;
};
const initPlayers: IPlayer[] = [
  {
    id: 0,
    hand: [],
    bet: 10,
    balance: 10_000,
    stratergy: 'interactive',
    ready: true,
    finished: false,
  },
  {
    id: 1,
    hand: [],
    bet: 10,
    balance: 10_000,
    stratergy: 'perfect-blackjack',
    ready: true,
    finished: false,
  },
  {
    id: 2,
    hand: [],
    bet: 10,
    balance: 10_000,
    stratergy: 'counting',
    ready: true,
    finished: false,
  },
];

type GameStore = {
  dealer: Hand;
  players: IPlayer[];
  currentPlayerId: 'init' | PlayerId | 'dealer' | 'endGame';
  dealerFinalCount: number;

  didGameStart: boolean;
  readyForPlayingFirstRound: boolean;

  outcome: string;
};

type GameStoreActions = {
  hit: (playerId: PlayerId) => void;
  stand: (playerId: PlayerId) => void;
  setStandInfo: (playerId: PlayerId) => void;
  double: (playerId: PlayerId) => void;

  nextTurn: () => void;
  dealToDealer: () => Promise<void>;

  determineOutcome: (playerId: PlayerId) => 'lose' | 'push' | 'win' | 'blackjack'; // This could return a string indicating win, lose, or push

  runDealerHasBlackjackFlow: () => void;
  startGame: (options?: { shuffle?: boolean }) => Promise<void>;
  startDealRound: () => Promise<void>;
  isDealerTurn: () => boolean;
  restartGame: (options?: { shuffle?: boolean }) => Promise<void>;
  initDealState: () => void;
  finalizePlayersBalance: () => void;
  placeBet: (playerId: PlayerId, betAmount: number) => void;
  addMoney: (playerId: PlayerId, money: number) => void;
  setPlayerReady: (playerId: PlayerId) => void;
};
const getPlayerById = (state: GameStore, playerId: PlayerId) => state.players.find(player => player.id === playerId)!;
export const useGameStore = create(
  immer<GameStore & GameStoreActions>((set, get) => ({
    dealer: [],
    // players: [],
    players: initPlayers,
    currentPlayerId: 'init',
    dealerFinalCount: 0,

    didGameStart: false,
    readyForPlayingFirstRound: false,

    hit: (playerId: PlayerId) => {
      const { drawCard } = useDeckStore.getState();
      set(state => {
        const player = getPlayerById(state, playerId);
        const card = drawCard();

        player.hand.push(card);
        const validCounts = calculateHand(player.hand).validCounts;
        if (validCounts.length === 0) {
          state.stand(playerId);
        }
      });
    },

    double: (playerId: PlayerId) => {
      set(state => {
        const player = getPlayerById(state, playerId);
        player.balance = player.balance - player.bet;
        player.bet = player.bet * 2;
      });
      get().hit(playerId); // will stand if bust. so checking
      const player = getPlayerById(get(), playerId)!;
      if (!player.finalCount) {
        // finalCount would have a value if "stand" was called
        get().stand(playerId);
      }
    },

    setStandInfo: (playerId: PlayerId) => {
      set(state => {
        const player = state.players.find(player => player.id === playerId)!;
        const counts = calculateHand(player.hand);
        const finalCount = counts.validCounts[0] || counts.bustCount;
        player.finished = true;
        player.finalCount = finalCount;
      });
    },
    stand: (playerId: PlayerId) => {
      get().setStandInfo(playerId);
      get().nextTurn();
    },

    nextTurn: async () => {
      set(state => {
        const player = state.players.find(p => p.id === state.currentPlayerId)!;
        // const curPlayerIndex = state.players.findIndex(p => p.id === player.id);
        const curPlayerIndex = player.id;

        const isLastPlayer = curPlayerIndex + 1 === state.players.length;
        const nextPlayerId = isLastPlayer ? 'dealer' : ((player.id + 1) as PlayerId);
        state.currentPlayerId = nextPlayerId;
      });
      if (get().currentPlayerId === 'dealer') {
        get().dealToDealer();
      }
    },
    dealToDealer: async () => {
      const { drawCard } = useDeckStore.getState();

      // Deal cards to the dealer until their hand is 17 or higher.
      let counts: ReturnType<typeof calculateHand>;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // let { validCounts } = counts;
        counts = calculateHand(get().dealer);
        const { validCounts } = counts;
        if (
          validCounts.length === 0 ||
          validCounts[0] > 17 ||
          (validCounts[0] === 17 && validCounts[1] !== 7) /* soft 17 */
        ) {
          break;
        }
        await sleep(1000);
        const card = drawCard();
        set(state => {
          state.dealer.push(card);
        });
      }
      await sleep(1000);

      // get largest valid count
      // const { validCounts, bustCount } = calculateHand(get().dealer);
      const { validCounts, bustCount } = counts;

      const dealerFinalCount = validCounts[0] || bustCount;
      set({ dealerFinalCount, currentPlayerId: 'endGame' });
      await sleep(1000);
      get().finalizePlayersBalance();
    },

    determineOutcome: (playerId: PlayerId) => {
      const player = getPlayerById(get(), playerId);

      const dealerCount = get().dealerFinalCount;
      const playerCount = player.finalCount;
      if (!playerCount) throw new Error(`Player ${playerId} does not have a final count`);

      const dealerHasBlackjack = isBlackJack(get().dealer);
      const playerHasBlackjack = isBlackJack(player.hand);

      if (playerCount > 21 || (dealerCount <= 21 && playerCount < dealerCount)) {
        return 'lose';
      }
      if (playerCount === dealerCount || (dealerHasBlackjack && playerHasBlackjack)) {
        return 'push';
      }
      if (playerHasBlackjack) {
        return 'blackjack';
      }
      return 'win';
    },
    runDealerHasBlackjackFlow: async () => {
      const anyPlayerHaveBlackjack = get().players.some(p => isBlackJack(p.hand));
      if (!anyPlayerHaveBlackjack) {
        await sleep(1000);
        set(state => {
          state.players.forEach(player => {
            state.setStandInfo(player.id);
          });
          state.currentPlayerId = 'dealer';
        });
        get().dealToDealer();
      }
    },

    startGame: async ({ shuffle: shouldShuffle } = {}) => {
      set({ didGameStart: true });
      const { shuffle, deck } = useDeckStore.getState();
      if (shouldShuffle || !deck.length) {
        shuffle();
      }
      await get().startDealRound();
      set({ readyForPlayingFirstRound: true });
    },
    restartGame: async ({ shuffle } = {}) => {
      get().initDealState();
      await get().startGame({ shuffle });
    },
    initDealState: () => {
      set(state => {
        // state.players = initPlayers;
        state.players.forEach(player => {
          player.bet = 0;
          player.hand = [];
          player.finished = false;
          player.finalCount = undefined;
          player.ready = false;
        });
        state.dealer = [];
        state.currentPlayerId = 'init';
        state.dealerFinalCount = 0;
        state.didGameStart = false;
        state.readyForPlayingFirstRound = false;
      });
    },
    startDealRound: async () => {
      const { drawCard } = useDeckStore.getState();
      for (let index = 0; index < 2; index++) {
        for (const player of get().players) {
          await sleep(500);
          const card = drawCard();
          const curPlayer = player;
          set(state => {
            const player = getPlayerById(state, curPlayer.id);
            player.hand.push(card);
          });
        }
        await sleep(500);
        set(state => {
          state.dealer.push(drawCard());
        });
      }
      set({ currentPlayerId: initPlayers[0].id });
      if (isBlackJack(get().dealer)) {
        get().runDealerHasBlackjackFlow();
      }
    },
    finalizePlayersBalance: () => {
      set(state => {
        state.players.forEach(player => {
          const outcome = state.determineOutcome(player.id);
          if (outcome === 'win') {
            player.balance += player.bet; // return the bet amount
            player.balance += player.bet; // add win amount
          } else if (outcome === 'blackjack') {
            player.balance += player.bet; // return the bet amount
            player.balance += player.bet * (3 / 2); // add win amount
          } else if (outcome === 'push') {
            player.balance += player.bet;
          }
        });
      });
    },

    outcome: '',
    isDealerTurn: () => get().currentPlayerId === 'dealer',

    placeBet: (playerId: PlayerId, betAmount: number) => {
      set(state => {
        const player = getPlayerById(state, playerId);
        player.balance -= betAmount;
        player.bet += betAmount;
      });
    },

    addMoney: (playerId: PlayerId, money: number) => {
      set(state => {
        const player = getPlayerById(state, playerId);
        player.balance += money;
      });
    },
    setPlayerReady: (playerId: PlayerId) => {
      set(state => {
        const player = getPlayerById(state, playerId);
        player.ready = true;
      });
    },

    //
  })),
);