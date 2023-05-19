interface Card {
  value: string;
  suit: string;
}

const calculateScore = (hand: Card[]): number => {
  let score = 0;
  let aceCount = 0;

  hand.forEach(card => {
    if (card.value === 'A') {
      aceCount++;
      score += 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value);
    }
  });

  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return score;
};
export const calculateScoreVariations = (hand: Card[]): number[] => {
  // the different possible scores for a hand, if has aces
  const scores = [calculateScore(hand)];
  let aceCount = 0;
  hand.forEach(card => {
    if (card.value === 'A') {
      aceCount++;
    }
  });
  for (let i = 0; i < aceCount; i++) {
    scores.push(scores[i] - 10);
  }
  return scores;
};

export default calculateScore;
