import { create } from 'zustand';

import calculateScore from '../utils/calculateScore';
import shuffleDeck from '../utils/shuffleDeck';
import { ICard, IDeck } from '../lib/card-types';
// import shuffleDeck from '../utils/shuffleDeck';
// import calculateScore from '../utils/calculateScore';

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

export type IGameState = {
  deck: ICard[];
  dealerHand: ICard[];
  playerHand: ICard[];
  isGameOver: boolean;
  message: string;
  deal: () => void;
  hit: () => void;
  hitDealer: () => void;
  endGame: () => void;
  playerCount(): number;
  dealerCount(): number;
};

export const useStore = create<IGameState>((set, get) => ({
  deck: [],
  dealerHand: [],
  playerHand: [],
  isGameOver: false,
  message: '',
  deal: () => {
    const newDeck = shuffleDeck(createDeck());
    const newDealerHand = [drawCard(newDeck), drawCard(newDeck)];
    const newPlayerHand = [drawCard(newDeck), drawCard(newDeck)];
    set({ deck: newDeck, dealerHand: newDealerHand, playerHand: newPlayerHand, isGameOver: false, message: '' });
  },
  hit: () => {
    set(state => {
      const newPlayerHand = [...state.playerHand];
      newPlayerHand.push(drawCard(state.deck));
      if (calculateScore(newPlayerHand) > 21) {
        return { playerHand: newPlayerHand, isGameOver: true, message: 'Busted! You lost.' };
      } else {
        return { playerHand: newPlayerHand };
      }
    });
  },
  hitDealer() {
    set(state => {
      const newDealerHand = [...state.dealerHand];
      newDealerHand.push(drawCard(state.deck));
      return { dealerHand: newDealerHand };
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
    set({ isGameOver: true, message: endGameMessage });
  },
  playerCount: () => calculateScore(get().playerHand),
  dealerCount: () => calculateScore(get().dealerHand),
}));
