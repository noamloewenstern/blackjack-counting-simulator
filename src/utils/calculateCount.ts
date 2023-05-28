interface Card {
  value: string;
  suit: string;
}

const calculateCount = (hand: Card[]): number => {
  let count = 0;
  let aceCount = 0;

  hand.forEach(card => {
    if (card.value === 'A') {
      aceCount++;
      count += 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      count += 10;
    } else {
      count += parseInt(card.value);
    }
  });

  while (count > 21 && aceCount > 0) {
    count -= 10;
    aceCount--;
  }

  return count;
};
export const calculateCountVariations = (hand: Card[]): number[] => {
  // the different possible counts for a hand, if has aces
  const counts = [calculateCount(hand)];
  let aceCount = 0;
  hand.forEach(card => {
    if (card.value === 'A') {
      aceCount++;
    }
  });
  for (let i = 0; i < aceCount; i++) {
    counts.push(counts[i] - 10);
  }
  return counts;
};

export default calculateCount;
