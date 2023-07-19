import type { Card } from '../deck';

export type BlackjackStrategy = 'interactive' | 'perfect-blackjack' | 'counting';

const calcHiLowCount = (card: Card) => {
  const { value: number } = card;
  if (['A', '10', 'J', 'Q', 'K'].includes(number)) return -1;
  if (['7', '8', '9'].includes(number)) return 0;
  return 1;
};

export const COUNTING_STRATEGIES = {
  calculate: {
    'Hi-Lo': calcHiLowCount,
  },
};
