export const cardNumbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export const suits = ['♠', '♥', '♦', '♣'] as const;

type CardValue = (typeof cardNumbers)[number];
type CardSuit = (typeof suits)[number];

export type Card = {
  number: CardValue;
  suit: CardSuit;
};
export type Deck = Card[];
export type Hand = Card[];

export function shuffleDeck(deck: Card[]): Card[] {
  // for (let i = deck.length - 1; i > 0; i--) {
  //   const j = Math.floor(Math.random() * (i + 1));
  //   [deck[i], deck[j]] = [deck[j], deck[i]];
  // }

  return deck;
}

export const createDeck = () => {
  const newDeck = [] as Card[];
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < cardNumbers.length; j++) {
      newDeck.push({ number: cardNumbers[j], suit: suits[i] });
    }
  }
  return blackJackDealCards[0].concat(newDeck);
};
const blackJackDealCards: Card[][] = [
  [
    // first and dealer players have blackjack
    { number: 'A', suit: '♠' },
    { number: '5', suit: '♥' },
    { number: '5', suit: '♥' },
    { number: 'A', suit: '♠' },

    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
    { number: '4', suit: '♦' },
    { number: '10', suit: '♠' },
  ],
  [
    // first and dealer players have blackjack
    { number: 'A', suit: '♠' },
    { number: '5', suit: '♥' },
    { number: '5', suit: '♥' },
    { number: '8', suit: '♠' },

    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
    { number: '4', suit: '♦' },
    { number: '8', suit: '♠' },

    { number: '4', suit: '♠' },
    { number: '4', suit: '♦' },
    { number: '5', suit: '♠' },
  ],
  [
    // first has blackjack, and dealer gets 21
    { number: 'A', suit: '♠' },
    { number: '5', suit: '♥' },
    { number: '5', suit: '♥' },
    { number: 'A', suit: '♠' },

    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
    { number: '4', suit: '♦' },
    { number: '10', suit: '♠' },
  ],
  [
    // first player has blackjack
    { number: 'A', suit: '♠' },
    { number: '3', suit: '♥' },
    { number: '4', suit: '♥' },
    { number: '5', suit: '♥' },

    { number: '10', suit: '♠' },
    { number: '3', suit: '♦' },
    { number: '4', suit: '♦' },
    { number: '4', suit: '♦' },
  ],
  [
    // second player has blackjack
    { number: '3', suit: '♥' },
    { number: 'A', suit: '♠' },
    { number: '4', suit: '♥' },
    { number: '5', suit: '♥' },

    { number: '3', suit: '♦' },
    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
    { number: '4', suit: '♦' },
  ],
  [
    // third player has blackjack
    { number: '3', suit: '♥' },
    { number: '4', suit: '♥' },
    { number: 'A', suit: '♠' },
    { number: '5', suit: '♥' },

    { number: '3', suit: '♦' },
    { number: '4', suit: '♦' },
    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
  ],
  [
    // dealer player has blackjack
    { number: '3', suit: '♥' },
    { number: '4', suit: '♥' },
    { number: '5', suit: '♥' },
    { number: 'A', suit: '♠' },

    { number: '3', suit: '♦' },
    { number: '4', suit: '♦' },
    { number: '4', suit: '♦' },
    { number: '10', suit: '♠' },
  ],
  [
    // first and second players have blackjack
    { number: 'A', suit: '♠' },
    { number: 'A', suit: '♠' },
    { number: '4', suit: '♥' },
    { number: '5', suit: '♥' },

    { number: '10', suit: '♠' },
    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
    { number: '4', suit: '♦' },
  ],
  [
    // second and third players have blackjack
    { number: '4', suit: '♥' },
    { number: 'A', suit: '♠' },
    { number: 'A', suit: '♠' },
    { number: '5', suit: '♥' },

    { number: '4', suit: '♦' },
    { number: '10', suit: '♠' },
    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
  ],
  [
    // second and dealer players have blackjack
    { number: '4', suit: '♥' },
    { number: 'A', suit: '♠' },
    { number: '5', suit: '♥' },
    { number: 'A', suit: '♠' },

    { number: '4', suit: '♦' },
    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
    { number: '10', suit: '♠' },
  ],
  [
    // first and dealer players have blackjack
    { number: 'A', suit: '♠' },
    { number: '5', suit: '♥' },
    { number: '5', suit: '♥' },
    { number: 'A', suit: '♠' },

    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
    { number: '4', suit: '♦' },
    { number: '10', suit: '♠' },
  ],
  [
    // first second and dealer players have blackjack
    { number: 'A', suit: '♠' },
    { number: 'A', suit: '♠' },
    { number: '5', suit: '♥' },
    { number: 'A', suit: '♠' },

    { number: '10', suit: '♠' },
    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
    { number: '10', suit: '♠' },
  ],
  [
    // first second and third players have blackjack
    { number: 'A', suit: '♠' },
    { number: 'A', suit: '♠' },
    { number: 'A', suit: '♠' },
    { number: '5', suit: '♥' },

    { number: '10', suit: '♠' },
    { number: '10', suit: '♠' },
    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
  ],
  [
    // second third and dealer players have blackjack
    { number: '5', suit: '♥' },
    { number: 'A', suit: '♠' },
    { number: 'A', suit: '♠' },
    { number: 'A', suit: '♠' },

    { number: '4', suit: '♦' },
    { number: '10', suit: '♠' },
    { number: '10', suit: '♠' },
    { number: '10', suit: '♠' },
  ],
  [
    // first third and dealer players have blackjack
    { number: 'A', suit: '♠' },
    { number: '5', suit: '♥' },
    { number: 'A', suit: '♠' },
    { number: 'A', suit: '♠' },

    { number: '10', suit: '♠' },
    { number: '4', suit: '♦' },
    { number: '10', suit: '♠' },
    { number: '10', suit: '♠' },
  ],
  [
    // everyone players have blackjack
    { number: 'A', suit: '♠' },
    { number: 'A', suit: '♠' },
    { number: 'A', suit: '♠' },
    { number: 'A', suit: '♠' },

    { number: '10', suit: '♠' },
    { number: '10', suit: '♠' },
    { number: '10', suit: '♠' },
    { number: '10', suit: '♠' },
  ],
];
