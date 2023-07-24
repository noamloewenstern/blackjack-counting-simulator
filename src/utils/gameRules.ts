export const minCardsPerPlayerTillShuffle = 10;
export function doesShoeNeedShuffle({
  numberPlayers,
  numberCardsInShoe,
}: {
  numberPlayers: number;
  numberCardsInShoe: number;
}): boolean {
  return numberCardsInShoe < minCardsPerPlayerTillShuffle * (numberPlayers + 1) /* including dealer */;
}
