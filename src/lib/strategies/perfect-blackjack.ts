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

function getActionByStrategy(playerHand: number[], dealerCount: number, strategy: Action[][]): Action {
  const playerTotal = playerHand.reduce((a, b) => a + b, 0);

  // If playerTotal is 4 or lower, or dealerCard is an Ace, always hit
  if (playerTotal <= 4 || dealerCount === 1) {
    return 'H';
  }

  // Ensure playerTotal and dealerCard are in the valid range
  if (playerTotal < 5 || playerTotal > 20 || dealerCount < 2 || dealerCount > 11) {
    throw new Error('Invalid player total or dealer card value');
  }

  // Subtract the minimum values from playerTotal and dealerCard to get the indices
  const playerIndex = playerTotal - 5;
  const dealerIndex = dealerCount - 2;

  // Return the action from the strategy matrix
  const action = strategy[dealerIndex][playerIndex];
  if (action === 'D' && playerHand.length > 2) {
    return 'H';
  }
  return action;
}

type PlayArgs = {
  playerHand: number[];
  dealerCount: number;
  strategy: Action[][];
  drawCard: () => number;
};

export function playHandAccordingToStrategy(playArgs: PlayArgs) {
  const { dealerCount, strategy, drawCard } = playArgs;
  const playerHand = [...playArgs.playerHand];
  // eslint-disable-next-line no-constant-condition
  const playerTotal = () => playerHand.reduce((a, b) => a + b, 0);

  while (playerTotal() < 21) {
    const action = getActionByStrategy(playerHand, dealerCount, strategy);

    if (action === 'D' || action === 'S') {
      return;
    }

    if (action === 'H') {
      const newCard = drawCard();
      playerHand.push(newCard);
    }
  }
}
