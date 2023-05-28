import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import calculateCount from '../utils/calculateCount';
import shuffleDeck from '../utils/shuffleDeck';
import { ICard, IDeck } from '../lib/card-types';
import { minCardsTillShuffle } from '../utils/gameRules';

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const createDeck = () => {
  const newDeck = [] as ICard[];
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
      newDeck.push({ value: values[j], suit: suits[i] });
    }
  }
  return newDeck;
};

export const isAce = (card: ICard) => card.value === 'A';

const drawCard = (deck: IDeck) => {
  if (deck.length === 0) {
    throw new Error('No cards left in the deck.');
  }
  const card = deck.shift();
  if (!card) {
    throw new Error('No cards left in the deck.');
  }
  return card;
};

type State = {
  deck: ICard[];
  dealerHand: ICard[];
  playerHand: ICard[];
  isGameOver: boolean;
  startedGame: boolean;
  message: string;
};

type Actions = {
  initDeck: () => void;
  dealRound: () => void;
  hit: () => void;
  hitDealer: () => void;
  endGame: () => void;
  playerCount(): number;
  dealerCount(): number;
};

export const useGameStore = create(
  immer<State & Actions>((set, get) => ({
    deck: [],
    dealerHand: [],
    playerHand: [],
    startedGame: false,
    isGameOver: false,
    message: '',
    initDeck: () => {
      set({
        deck: shuffleDeck(createDeck()),
      });
    },
    dealRound: () => {
      let deck = [...get().deck];
      if (deck.length < minCardsTillShuffle) {
        deck = shuffleDeck(createDeck());
      }
      const newDealerHand = [drawCard(deck), drawCard(deck)];
      const newPlayerHand = [drawCard(deck), drawCard(deck)];
      set({
        deck,
        dealerHand: newDealerHand,
        playerHand: newPlayerHand,
        startedGame: true,
        isGameOver: false,
        message: '',
      });
      return true;
    },
    hit: () => {
      set(state => {
        const newPlayerHand = [...state.playerHand];
        newPlayerHand.push(drawCard(state.deck));
        if (calculateCount(newPlayerHand) > 21) {
          state.isGameOver = true;
          state.playerHand = newPlayerHand;
          state.message = 'Busted! You lost.';
        } else {
          state.playerHand = newPlayerHand;
        }
      });
    },
    hitDealer() {
      set(state => {
        state.dealerHand.push(drawCard(state.deck));
      });
    },
    endGame: () => {
      const playerCount = get().playerCount();
      const dealerCount = get().dealerCount();
      let endGameMessage = '';
      if (dealerCount > 21) {
        endGameMessage = 'Dealer busts. You win!';
      } else if (dealerCount > playerCount) {
        endGameMessage = 'Dealer wins!';
      } else if (dealerCount < playerCount) {
        endGameMessage = 'You win!';
      } else {
        endGameMessage = 'Push.';
      }
      set({
        isGameOver: true,
        message: endGameMessage,
      });
    },
    playerCount: () => calculateCount(get().playerHand),
    dealerCount: () => calculateCount(get().dealerHand),
  })),
);
