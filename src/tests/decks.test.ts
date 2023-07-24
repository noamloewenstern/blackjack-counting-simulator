import type { Card, CardValue, Deck } from '~/lib/deck';
const defaultNumberPlayers = 4;

type TestDeck = {
  numberOfPlayers?: number; // including dealer
  round: {
    playerIndex: number;
    cards: CardValue[];
  }[];
  addCardsAfterInitRound?: CardValue[];
};
function getRandomCardValue() {
  const cardValues: CardValue[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  const randomIndex = Math.floor(Math.random() * cardValues.length);
  return cardValues[randomIndex]!;
}

/*
TEST EXAMPLES
*/

const testSplit: TestDeck = {
  numberOfPlayers: defaultNumberPlayers,
  round: [
    {
      playerIndex: 0,
      cards: ['6', '6'],
    },
  ],
  addCardsAfterInitRound: ['A', 'A', '10'],
};
const testSplit2: TestDeck = {
  numberOfPlayers: defaultNumberPlayers,
  round: [
    {
      playerIndex: 0,
      cards: ['6', '6'],
    },
  ],
  addCardsAfterInitRound: ['A', '5', '10'],
};
const testSplit3: TestDeck = {
  numberOfPlayers: defaultNumberPlayers,
  round: [
    {
      playerIndex: 0,
      cards: ['8', '8'],
    },
    {
      playerIndex: 3, // dealer
      cards: ['4', 'T'],
    },
  ],
  addCardsAfterInitRound: ['A', '5', '10'],
};
const testSoftHand: TestDeck = {
  numberOfPlayers: defaultNumberPlayers,
  round: [
    {
      playerIndex: 0,
      cards: ['3', 'A'],
    },
  ],
  addCardsAfterInitRound: ['8', '7', '10'],
};
const testDoubleAcesHand: TestDeck = {
  numberOfPlayers: defaultNumberPlayers,
  round: [
    {
      playerIndex: 0,
      cards: ['3', 'A'],
    },
  ],
  addCardsAfterInitRound: ['A', '7', '10'],
};
const testHard14vs10: TestDeck = {
  numberOfPlayers: defaultNumberPlayers,
  round: [
    {
      playerIndex: 0,
      cards: ['Q', '4'],
    },
  ],
  addCardsAfterInitRound: ['4', 'T', '10'],
};
const testDoubleAcesAndThen10: TestDeck = {
  numberOfPlayers: defaultNumberPlayers,
  round: [
    {
      playerIndex: 0,
      cards: ['A', 'A', '10'],
    },
  ],
  addCardsAfterInitRound: ['4', '10', '10'],
};
const testSoftMultiple: TestDeck = {
  numberOfPlayers: defaultNumberPlayers,
  round: [
    {
      playerIndex: 0,
      cards: ['A', '3', '3'],
    },
    {
      playerIndex: 3, // dealer
      cards: ['4', '10'],
    },
  ],
  addCardsAfterInitRound: ['3', '5', '10'],
};
const testBlackjack: TestDeck = {
  numberOfPlayers: 2,
  round: [
    {
      playerIndex: 0,
      cards: ['A', '10'],
    },
    {
      playerIndex: 1, // dealer
      cards: ['4', '10'],
    },
  ],
  addCardsAfterInitRound: ['3', '5', '10'],
};
/*
HELPERS
*/
function valueToCard(value: CardValue): Card {
  return { value, suit: '♠', isVisible: true };
}
function addTestRoundToDeck(deck: Deck, testDeck: TestDeck): Deck {
  const firstCardsInDeck = [] as CardValue[];

  for (let cardIndex = 0; cardIndex < 2; cardIndex++) {
    for (let index = 0; index < (testDeck.numberOfPlayers || defaultNumberPlayers); index++) {
      const playerRound = testDeck.round.find(round => round.playerIndex === index);
      const card = playerRound?.cards[cardIndex];
      if (!playerRound || !card) {
        firstCardsInDeck.push(getRandomCardValue());
        continue;
      }
      firstCardsInDeck.push(card);
    }
  }
  const cardsWithSuite: Card[] = firstCardsInDeck.map(valueToCard);
  const cardsAfterInitRound = (testDeck.addCardsAfterInitRound || []).map(valueToCard);
  return [...cardsWithSuite, ...cardsAfterInitRound, ...deck];
}
/*
  CURRENT TESTING DECK
*/
const allTests = [
  testSplit,
  testSplit2,
  testSoftHand,
  testDoubleAcesHand,
  testSplit3,
  testHard14vs10,
  testDoubleAcesAndThen10,
  testSoftMultiple,
  testBlackjack,
];
// const CURRENTLY_TESTING = testSoftHand;
const CURRENTLY_TESTING = testBlackjack;

export function getDeckWithTestRound(deck: Deck): Deck {
  return addTestRoundToDeck(deck, CURRENTLY_TESTING);
}
