import { getDeckWithTestRound } from '~/tests/decks.test';
import { DEBUG } from '~/utils/config';

export const cardNumbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'T', 'J', 'Q', 'K'] as const;
export const suits = ['♠', '♥', '♦', '♣'] as const;

export type CardValue = (typeof cardNumbers)[number];
type CardSuit = (typeof suits)[number];
export type RoundHandResult = 'win' | 'lose' | 'push' | 'blackjack' | 'bust';
export type Card = {
  value: CardValue;
  suit: CardSuit;
  isVisible: boolean;
};
export type Deck = Card[];
export type Hand = {
  id: string;
  cards: Card[];
  bet: number;
  isFinished: boolean;
  isReady: boolean;
  roundResult?: RoundHandResult;
};

export function shuffleDeck(deck: Card[]): Card[] {
  if (DEBUG) return deck;

  const newDeck = deck.map(card => ({ ...card })); // deep copy
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j]!, newDeck[i]!];
  }

  return newDeck;
}

export const createDeck = () => {
  const cardNumbersWithoutDuplicateTens = cardNumbers.filter(cardNumber => cardNumber !== 'T');
  const newDeck = [] as Card[];
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < cardNumbersWithoutDuplicateTens.length; j++) {
      newDeck.push({ value: cardNumbersWithoutDuplicateTens[j]!, suit: suits[i]!, isVisible: true });
    }
  }
  if (DEBUG) return getDeckWithTestRound(newDeck);
  return newDeck;
};
