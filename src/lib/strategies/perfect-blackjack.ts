import { calculateHand, getCardValues } from '../calculateHand';
import { Card, Hand } from '../deck';

type Action = 'H' | 'S' | 'D'; // H: Hit, S: Stand, D: Double

export const basicStrategy: Action[][] = [
  //                           2    3    4    5    6    7    8    9    10   11   12   13   14   15   16   17   18   19   20   21 (Player's total)
  /* Dealer's upcard = 2  */ ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'S'], 
  /* Dealer's upcard = 3  */ ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'S'], 
  /* Dealer's upcard = 4  */ ['H', 'H', 'H', 'H', 'H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'S'], 
  /* Dealer's upcard = 5  */ ['H', 'H', 'H', 'H', 'D', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'S'], 
  /* Dealer's upcard = 6  */ ['H', 'H', 'H', 'H', 'D', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'S'], 
  /* Dealer's upcard = 7  */ ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], 
  /* Dealer's upcard = 8  */ ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], 
  /* Dealer's upcard = 9  */ ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], 
  /* Dealer's upcard = 10 */ ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], 
  /* Dealer's upcard = 11 */ ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], 
];

export function getActionByStrategy(
  playerHand: Hand,
  dealerCount: number,
  strategy: Action[][] = basicStrategy,
  softStrategy: Action[][] = basicStrategy,
): Action {
  // Ensure playerTotal and dealerCard are in the valid range
  if (dealerCount < 2 || dealerCount > 11) {
    throw new Error(`Invalid player total or dealer card value dealerCount: ${dealerCount}`);
  }
  const { validCounts, bustCount } = calculateHand(playerHand);
  const playerTotal = validCounts[0] || bustCount;

  // If playerTotal is 4 or lower, or dealerCard is an Ace, always hit
  if (playerTotal <= 4 || dealerCount === 1) {
    return 'H';
  }
  if (playerTotal > 20) {
    return 'S';
  }

  strategy = hasAce(playerHand) ? softStrategy : strategy;
  const action = strategy[dealerCount - 2][playerTotal - 2];
  if (action === 'D' && playerHand.length > 2) {
    return 'H';
  }
  return action;
}

type PlayArgs = {
  playerHand: Hand;
  dealerCount: number;
  strategy: Action[][];
  drawCard: () => Card;
};

export function playHandAccordingToStrategy(playArgs: PlayArgs) {
  const { dealerCount, strategy, drawCard } = playArgs;
  const playerHand = [...playArgs.playerHand];

  let action = getActionByStrategy(playerHand, dealerCount, strategy);
  while (action !== 'S' && action !== 'D') {
    if (action === 'H') {
      const newCard = drawCard();
      playerHand.push(newCard);
    }
    action = getActionByStrategy(playerHand, dealerCount, strategy);
  }
}
function hasAce(playerHand: Hand) {
  return playerHand.some(card => card.number === 'A');
}
