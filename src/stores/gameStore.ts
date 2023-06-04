/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { useDeckStore } from './deckStore';
import { Card, Hand } from '../lib/deck';
import { calculateHand, getCardValues, isBlackJack } from '../lib/calculateHand';
import { sleep } from '../utils/helpers';
import { BlackjackStrategy } from '../lib/strategies/utils';

export const isAce = (card: Card) => card.number === 'A';
export type PlayerId = 10 | 20 | 30;

export type IPlayer = {
  id: PlayerId;
  hand: Hand;
  bet: number;
  balance: number;
  strategy: BlackjackStrategy;
  finalCount?: number;
  ready: boolean;
  finished: boolean;
};
const initPlayers: IPlayer[] = [
  {
    id: 10,
    hand: [],
    bet: 10,
    balance: 10_000,
    strategy: 'interactive',
    ready: true,
    finished: false,
  },
  {
    id: 20,
    hand: [],
    bet: 10,
    balance: 10_000,
    strategy: 'perfect-blackjack',
    ready: true,
    finished: false,
  },
  {
    id: 30,
    hand: [],
    bet: 10,
    balance: 10_000,
    strategy: 'counting',
    ready: true,
    finished: false,
  },
];
type IDealer = {
  hand: Hand;
  finalCount: number;
};
type GameStore = {
  dealer: IDealer;
  players: IPlayer[];
  currentPlayerId: 'init' | PlayerId | 'dealer' | 'endGame';

  didGameStart: boolean;
  readyForPlayingFirstRound: boolean;

  outcome: string;
};

type GameStoreActions = {
  hit: (playerId: PlayerId) => Promise<void>;
  stand: (playerId: PlayerId) => Promise<void>;
  setStandInfo: (playerId: PlayerId) => void;
  double: (playerId: PlayerId) => Promise<void>;

  nextTurn: () => Promise<void>;
  dealToDealer: () => Promise<void>;
  visibleDealerCount: () => number | number[] | undefined;

  determineOutcome: (playerId: PlayerId) => 'lose' | 'push' | 'win' | 'blackjack'; // This could return a string indicating win, lose, or push

  runDealerHasBlackjackFlow: () => Promise<void>;
  startGame: (options?: { shuffle?: boolean }) => Promise<void>;
  startDealRound: () => Promise<void>;
  isDealerTurn: () => boolean;
  restartGame: (options?: { shuffle?: boolean }) => Promise<void>;
  initDealState: () => void;
  finalizePlayersBalance: () => void;
  placeBet: (playerId: PlayerId, betAmount: number) => void;
  addMoney: (playerId: PlayerId, money: number) => void;
  setPlayerReady: (playerId: PlayerId) => void;
  currentPlayer: () => IPlayer;
};
const getPlayerById = (state: GameStore, playerId: PlayerId) => state.players.find(player => player.id === playerId)!;
export const useGameStore = create(
  immer<GameStore & GameStoreActions>((set, get) => ({
    dealer: {
      hand: [],
      finalCount: 0,
    },
    // players: [],
    players: initPlayers,
    currentPlayerId: 'init',
    dealerFinalCount: 0,

    didGameStart: false,
    readyForPlayingFirstRound: false,

    hit: async (playerId: PlayerId) => {
      const { drawCard } = useDeckStore.getState();
      set(state => {
        const player = getPlayerById(state, playerId);
        const card = drawCard();
        player.hand.push(card);
      });
      const player = getPlayerById(get(), playerId);
      const validCounts = calculateHand(player.hand).validCounts;
      if (validCounts.length === 0) {
        await get().stand(playerId);
      }
    },

    double: async (playerId: PlayerId) => {
      set(state => {
        const player = getPlayerById(state, playerId);
        if (player.bet > player.balance) throw new Error('Not enough money');
        player.balance = player.balance - player.bet;
        player.bet = player.bet * 2;
      });
      await get().hit(playerId); // will stand if bust. so checking
      const player = getPlayerById(get(), playerId)!;
      if (!player.finalCount) {
        // finalCount would have a value if "stand" was called
        await get().stand(playerId);
      }
    },

    setStandInfo: (playerId: PlayerId) => {
      set(state => {
        const player = getPlayerById(state, playerId);
        const counts = calculateHand(player.hand);
        const finalCount = counts.validCounts[0] || counts.bustCount;
        player.finished = true;
        player.finalCount = finalCount;
      });
    },
    stand: async (playerId: PlayerId) => {
      get().setStandInfo(playerId);
      await get().nextTurn();
    },

    nextTurn: async () => {
      if (get().currentPlayerId === 'endGame') {
        return;
      }
      if (get().currentPlayerId === 'dealer') {
        await get().dealToDealer();
        return;
      }
      const player = get().currentPlayer();
      const players = get().players;
      const curPlayerIndex = players.findIndex(p => p.id === player.id);
      if (!player || curPlayerIndex === -1) {
        console.log(players);
        console.log(`currentPlayerId = ${get().currentPlayerId}`);
        throw new Error('Player is none');
      }
      const isLastPlayer = curPlayerIndex + 1 === players.length;
      const nextPlayerId = isLastPlayer ? 'dealer' : players[curPlayerIndex + 1].id;
      set({ currentPlayerId: nextPlayerId });
      if (nextPlayerId === 'dealer') {
        await get().dealToDealer();
        return;
      }
      if (isBlackJack(get().currentPlayer().hand)) {
        await get().nextTurn();
      }
    },
    visibleDealerCount: () => {
      const { hand, finalCount } = get().dealer;

      if (hand.length === 0) return undefined;
      const didGameEnd = get().currentPlayerId === 'endGame';
      if (didGameEnd && finalCount) {
        return finalCount;
      }
      const isDealerTurn = get().currentPlayerId === 'dealer';
      if (!isDealerTurn && hand.length >= 2) {
        return getCardValues(hand[1].number);
      }
      const counts = hand.length >= 2 ? calculateHand(hand) : undefined;
      if (!counts) return undefined;
      if (counts.validCounts.length > 0) {
        return counts.validCounts[0];
      }
      return counts.bustCount;
    },
    dealToDealer: async () => {
      const { drawCard } = useDeckStore.getState();

      // Deal cards to the dealer until their hand is 17 or higher.
      await sleep(500);
      let counts: ReturnType<typeof calculateHand>;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // let { validCounts } = counts;
        counts = calculateHand(get().dealer.hand);
        const { validCounts } = counts;
        if (
          validCounts.length === 0 ||
          validCounts[0] > 17 ||
          (validCounts[0] === 17 && validCounts[1] !== 7) /* soft 17 */
        ) {
          break;
        }
        const card = drawCard();
        set(state => {
          state.dealer.hand.push(card);
        });
        await sleep(500);
      }
      await sleep(200);

      // get largest valid count
      // const { validCounts, bustCount } = calculateHand(get().dealer);
      const { validCounts, bustCount } = counts;

      const dealerFinalCount = validCounts[0] || bustCount;
      set(state => {
        state.dealer.finalCount = dealerFinalCount;
        state.currentPlayerId = 'endGame';
      });
      await sleep(500);
      get().finalizePlayersBalance();
    },

    determineOutcome: (playerId: PlayerId) => {
      const player = getPlayerById(get(), playerId);

      const dealerCount = get().dealer.finalCount;
      const playerCount = player.finalCount;
      if (!playerCount) throw new Error(`Player ${playerId} does not have a final count`);

      const dealerHasBlackjack = isBlackJack(get().dealer.hand);
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
      for (const player of get().players) {
        get().setStandInfo(player.id);
      }
      set({ currentPlayerId: 'dealer' });
      await get().dealToDealer();
    },

    startGame: async ({ shuffle: shouldShuffle } = {}) => {
      set({ didGameStart: true });
      const { shuffle, deck } = useDeckStore.getState();
      if (shouldShuffle || !deck.length) {
        shuffle();
      }
      await get().startDealRound();
      await sleep(200);
      set({ readyForPlayingFirstRound: true });
    },
    restartGame: async ({ shuffle = false } = {}) => {
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
        state.dealer.hand = [];
        state.dealer.finalCount = 0;
        state.currentPlayerId = 'init';
        state.didGameStart = false;
        state.readyForPlayingFirstRound = false;
      });
    },
    startDealRound: async () => {
      const { drawCard } = useDeckStore.getState();
      for (let index = 0; index < 2; index++) {
        // 2 cards
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
          state.dealer.hand.push(drawCard());
        });
      }
      if (isBlackJack(get().dealer.hand)) {
        await sleep(300);
        await get().runDealerHasBlackjackFlow();
        return;
      }
      await sleep(300);
      set({ currentPlayerId: initPlayers[0].id });
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

    currentPlayer() {
      const state = this || get();
      const player = state.players.find(p => p.id === state.currentPlayerId)!;
      return player;
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

if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('GameStore', useGameStore);
}
