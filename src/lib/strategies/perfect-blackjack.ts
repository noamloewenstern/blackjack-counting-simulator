import { raiseError } from '~/utils/helpers';
import { calcHandCount, isBlackjack } from '../calculateHand';
import type { Card } from '../deck';

type PairSplitAction = 'Y' | 'Y/N' | 'N'; // Y: Split, Y/N: Split if allowed to double after split otherwise don't split, N: Don't split
type SoftTotalAction = 'H' | 'S' | 'D' | 'Ds'; // H: Hit, S: Stand, D: Double if allowed otherwise hit, Ds: Double if allowed to double after split otherwise stand
type HardTotalAction = 'H' | 'S' | 'D'; // H: Hit, S: Stand, D: Double if allowed otherwise hit
type Action = 'H' | 'S' | 'D' | 'SP'; // H: Hit, S: Stand, D: Double, SP: Split

export type ActionSettings = {
  allowedToDouble: boolean;
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
export function isSoftHand(
  cards: Card['value'][],
  { validCounts: origValidCounts }: { validCounts?: number[] } = {},
): boolean {
  const validCounts = origValidCounts || calcHandCount(cards).validCounts;
  return cards.some(card => card === 'A') && cards.length > 1 && validCounts.length > 1;
}
export function getSoftAction({
  playerCards,
  dealerCount,
  validCounts,
  allowedToDouble,
}: {
  playerCards: Card['value'][];
  dealerCount: number;
  allowedToDouble: boolean;
  validCounts: number[];
}): HardTotalAction {
  const higherSoftCount = validCounts[0] || 0;
  if (!higherSoftCount) {
    raiseError(`Invalid playerTotal:${higherSoftCount} and dealerCount:${dealerCount} for soft hand - IS BUST`);
  }
  const softCountAction = SoftTotalStrategy[higherSoftCount]?.[dealerCount - 2];
  if (!softCountAction) {
    raiseError(`Invalid playerTotal:${higherSoftCount} and dealerCount:${dealerCount} for soft hand`);
  }
  const canDouble = allowedToDouble && playerCards.length === 2;
  const action = softCountAction;
  if (!action) raiseError(`Invalid action:${action} for playerTotal:${higherSoftCount} and dealerCount:${dealerCount}`);
  if (action === 'D' && !canDouble) {
    return 'H';
  }
  const hardAction = action === 'Ds' ? (canDouble ? 'D' : 'S') : action;
  return hardAction;
}
function isPairHand(playerHand: Card['value'][]): boolean {
  return playerHand.length === 2 && playerHand[0] !== undefined && playerHand[0] === playerHand[1];
}
export function getSplitAction(
  playerHand: Card['value'][],
  dealerCount: number,
  { canDoubleAfterSplit = true } = {},
): 'Y' | 'N' {
  // Pair splitting
  if (!playerHand[0]) raiseError(`Invalid playerHand:${playerHand} and dealerCount:${dealerCount} for pair hand`);
  let pair = playerHand[0];
  if (['10', 'J', 'Q', 'K'].includes(pair)) {
    pair = 'T';
  }
  const pairKey = `${pair},${pair}`;
  let action = PairSplittingStrategy[pairKey]?.[dealerCount - 2];
  if (!action) {
    raiseError(`Invalid pairKey:${pairKey} and dealerCount:${dealerCount} for pair hand`);
  }
  if (action === 'Y/N') {
    action = canDoubleAfterSplit ? 'Y' : 'N';
  }
  return action;
}

function getHardAction({
  playerCards,
  dealerCount,
  validCounts,
  allowedToDouble,
}: {
  playerCards: Card['value'][];
  dealerCount: number;
  validCounts: number[];
  allowedToDouble: boolean;
}): HardTotalAction {
  const playerTotal = validCounts[0];
  if (!playerTotal) {
    raiseError(
      `Invalid playerTotal:${playerTotal} and dealerCount:${dealerCount} for hard hand - IS BUST playerCards:${playerCards.join(
        ',',
      )}`,
    );
  }
  if (playerTotal >= 17) {
    return 'S';
  }
  if (playerTotal <= 8) {
    return 'H';
  }

  const action = HardTotalAction[playerTotal]?.[dealerCount - 2];
  if (!action) {
    raiseError(
      `Invalid playerTotal:${playerTotal} and dealerCount:${dealerCount} for hard hand. playerCards:${playerCards.join(
        ',',
      )}`,
    );
  }
  const canDouble = allowedToDouble && playerCards.length === 2;
  if (action === 'D' && !canDouble) {
    return 'H';
  }
  return action;
}

/* CALC ACTION */
export function getActionByStrategy(
  playerCards: Card['value'][],
  dealerCount: number,
  settings: ActionSettings,
): Action {
  playerCards.length === 0 && raiseError(`getActionByStrategy: playerCards length is 0!`);
  // Ensure playerTotal and dealerCard are in the valid range
  if (dealerCount < 2 || dealerCount > 11) {
    raiseError(`Invalid dealerCount value: ${dealerCount}`);
  }
  if (isBlackjack(playerCards)) {
    return 'S';
  }
  if (
    isPairHand(playerCards) &&
    getSplitAction(playerCards, dealerCount, {
      canDoubleAfterSplit: settings.allowedToDouble && settings.allowedToDoubleAfterSplit,
    }) === 'Y'
  ) {
    return 'SP';
  }

  const { validCounts } = calcHandCount(playerCards);
  if (
    validCounts.length === 0 ||
    validCounts[0] === 20 /* includes soft 20 */ ||
    (validCounts.length === 1 && validCounts[0]! >= 17)
  ) {
    return 'S';
  }
  if (isSoftHand(playerCards, { validCounts })) {
    const action = getSoftAction({ playerCards, dealerCount, validCounts, allowedToDouble: settings.allowedToDouble });
    return action;
  }

  // hard hand
  const action = getHardAction({ playerCards, dealerCount, validCounts, allowedToDouble: settings.allowedToDouble });
  return action;
}

export function calculateBetPerfectBlackjack() {
  // todo: implement change base on different tests
  return 100;
}
