import { raiseError } from '~/utils/helpers';
import { calculateHand, isBlackjack } from '../calculateHand';
import type { Card } from '../deck';

type PairSplitAction = 'Y' | 'Y/N' | 'N'; // Y: Split, Y/N: Split if allowed to double after split otherwise don't split, N: Don't split
type SoftTotalAction = 'H' | 'S' | 'D' | 'Ds'; // H: Hit, S: Stand, D: Double if allowed otherwise hit, Ds: Double if allowed to double after split otherwise stand
type HardTotalAction = 'H' | 'S' | 'D'; // H: Hit, S: Stand, D: Double if allowed otherwise hit
type Action = 'H' | 'S' | 'D' | 'SP'; // H: Hit, S: Stand, D: Double, SP: Split

type ActionSettings = {
  canDouble: boolean;
  allowedToDoubleAfterSplit: boolean;
};

export const PairSplittingStrategy: Record<string, readonly PairSplitAction[]> = {
  'A,A': ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  'T,T': ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
  '9,9': ['N', 'N', 'N', 'N', 'N', 'N', 'Y', 'Y', 'N', 'N'],
  '8,8': ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  '7,7': ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'N', 'N', 'N', 'N'],
  '6,6': ['Y/N', 'Y', 'Y', 'Y', 'Y', 'N', 'N', 'N', 'N', 'N'],
  '5,5': ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
  '4,4': ['N', 'N', 'N', 'Y/N', 'Y/N', 'N', 'N', 'N', 'N', 'N'],
  '3,3': ['Y/N', 'Y/N', 'Y', 'Y', 'Y', 'Y', 'N', 'N', 'N', 'N'],
  '2,2': ['Y/N', 'Y/N', 'Y', 'Y', 'Y', 'Y', 'N', 'N', 'N', 'N'],
} as const;
export const SoftTotalStrategy: Record<string, readonly SoftTotalAction[]> = {
  '20': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  '19': ['S', 'S', 'S', 'S', 'Ds', 'S', 'S', 'S', 'S', 'S'],
  '18': ['Ds', 'Ds', 'Ds', 'Ds', 'Ds', 'S', 'S', 'H', 'H', 'H'],
  '17': ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  '16': ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  '15': ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  '14': ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  '13': ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
} as const;
export const HardTotalAction: Record<string, readonly HardTotalAction[]> = {
  '17': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  '16': ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  '15': ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  '14': ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  '13': ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  '12': ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  '11': ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
  '10': ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
  '9': ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  '8': ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
} as const;
function isSoftHand(playerHand: Card[]): boolean {
  return playerHand.some(card => card.value === 'A');
}
function getSoftAction(
  playerHand: Card[],
  dealerCount: number,
  { canDouble }: { canDouble: boolean },
): HardTotalAction {
  const { validCounts } = calculateHand(playerHand);
  const playerTotal = validCounts[0] || 0;
  if (!SoftTotalStrategy[playerTotal]?.[dealerCount - 2]) {
    if (playerHand.length > 2) {
      return getHardAction(playerHand, dealerCount, { canDouble: false });
    }
    throw new Error(`Invalid playerTotal:${playerTotal} and dealerCount:${dealerCount} for soft hand`);
  }
  const action = SoftTotalStrategy[playerTotal]?.[dealerCount - 2];
  if (!action) raiseError(`Invalid action:${action} for playerTotal:${playerTotal} and dealerCount:${dealerCount}`);
  if (action === 'D' && !canDouble) {
    return 'H';
  }
  const hardAction = action === 'Ds' ? (canDouble ? 'D' : 'S') : action;
  return hardAction;
}
function isPairHand(playerHand: Card[]): boolean {
  return playerHand.length === 2 && playerHand[0]!.value === playerHand[1]!.value;
}
function getSplitAction(playerHand: Card[], dealerCount: number, { canDoubleAfterSplit = true } = {}): 'Y' | 'N' {
  // Pair splitting
  if (!playerHand[0]) raiseError(`Invalid playerHand:${playerHand} and dealerCount:${dealerCount} for pair hand`);
  let pair = playerHand[0].value as string;
  if (['10', 'J', 'Q', 'K'].includes(pair)) {
    pair = 'T';
  }
  const pairKey = `${pair},${pair}`;
  let action = PairSplittingStrategy[pairKey]?.[dealerCount - 2];
  if (!action) {
    throw new Error(`Invalid pairKey:${pairKey} and dealerCount:${dealerCount} for pair hand`);
  }
  if (action === 'Y/N') {
    action = canDoubleAfterSplit ? 'Y' : 'N';
  }
  return action;
}

function getHardAction(
  playerHand: Card[],
  dealerCount: number,
  { canDouble }: { canDouble: boolean },
): HardTotalAction {
  const { validCounts } = calculateHand(playerHand);
  const playerTotal = validCounts[0];
  if (!playerTotal) {
    throw new Error(`Invalid playerTotal:${playerTotal} and dealerCount:${dealerCount} for hard hand - IS BUST`);
  }
  if (playerTotal >= 18) {
    return 'S';
  }
  if (playerTotal <= 8) {
    return 'H';
  }

  if (!HardTotalAction[playerTotal]?.[dealerCount - 2]) {
    console.log(`playerHand : ${playerTotal}`, playerHand);
    throw new Error(`Invalid playerTotal:${playerTotal} and dealerCount:${dealerCount} for hard hand`);
  }
  const action = HardTotalAction[playerTotal]?.[dealerCount - 2];
  if (!action) raiseError(`Invalid action:${action} for playerTotal:${playerTotal} and dealerCount:${dealerCount}`);
  if (action === 'D' && !canDouble) {
    return 'H';
  }
  return action;
}
export function getActionByStrategy(playerHand: Card[], dealerCount: number, settings: ActionSettings): Action {
  // Ensure playerTotal and dealerCard are in the valid range
  if (dealerCount < 2 || dealerCount > 11) {
    throw new Error(`Invalid dealerCount value: ${dealerCount}`);
  }
  if (isBlackjack(playerHand)) {
    return 'S';
  }
  if (
    isPairHand(playerHand) &&
    getSplitAction(playerHand, dealerCount, {
      canDoubleAfterSplit: settings.canDouble && settings.allowedToDoubleAfterSplit,
    }) === 'Y'
  ) {
    return 'SP';
  }

  const { validCounts } = calculateHand(playerHand);
  if (validCounts[0] === 20 || validCounts.length === 0) {
    return 'S';
  }
  if (isSoftHand(playerHand)) {
    const action = getSoftAction(playerHand, dealerCount, { canDouble: settings.canDouble });
    return action;
  }

  // hard hand
  const action = getHardAction(playerHand, dealerCount, { canDouble: settings.canDouble });
  return action;
}

// type PlayArgs = {
//   playerHand: Hand;
//   dealerCount: number;
//   strategy: Action[][];
//   drawCard: () => Card;
// };

// export function playHandAccordingToStrategy(playArgs: PlayArgs, settings: ActionSettings) {
//   const { dealerCount, strategy, drawCard } = playArgs;
//   const playerHand = [...playArgs.playerHand];

//   let action = getActionByStrategy(playerHand, dealerCount);
//   while (action !== 'S' && action !== 'D') {
//     if (action === 'H') {
//       const newCard = drawCard();
//       playerHand.push(newCard);
//     }
//     action = getActionByStrategy(playerHand, dealerCount);
//   }
// }
// function hasAce(playerHand: Hand) {
//   return playerHand.some(card => card.number === 'A');
// }

export function calculateBetPerfectBlackjack() {
  // todo: implement change base on different tests
  return 100;
}
