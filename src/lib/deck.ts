export const cardNumbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'T', 'J', 'Q', 'K'] as const;
export const suits = ['♠', '♥', '♦', '♣'] as const;

export type CardValue = (typeof cardNumbers)[number];
type CardSuit = (typeof suits)[number];

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
};

export function shuffleDeck(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }

  return deck;
}

export const createDeck = () => {
  const newDeck = [] as Card[];
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < cardNumbers.length; j++) {
      newDeck.push({ value: cardNumbers[j]!, suit: suits[i]!, isVisible: true });
    }
  }
  return newDeck;
};
