export function calculateCountingBet({
  runningCount,
  numberDecksInShoe,
}: {
  runningCount: number;
  numberDecksInShoe: number;
}): number {
  // Calculate the absolute count
  const absCount = runningCount / numberDecksInShoe;

  // Initialize bet at 100
  let bet = 100;

  // If the absolute count is positive, add 100 for each count
  if (absCount > 0) {
    bet += absCount * 100;
  }
  // If the absolute count is negative, subtract 20 for each count, down to a minimum of 20
  else if (absCount < 0) {
    const decreaseAmount = absCount * -20;
    bet = Math.max(bet - decreaseAmount, 20); // Ensure bet doesn't go below 20
  }

  // If the absolute count is 0, bet is 100
  return bet;
}
