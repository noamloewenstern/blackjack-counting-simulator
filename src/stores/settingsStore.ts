import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type DeckStore = {
  numberDecksInShoe: number;
  dealerMustHitOnSoft17: boolean;
  allowedToDoubleAfterSplit: boolean;
};
type Actions = {
  setNumberOfDecks: (numberOfDecks: number) => void;
};

export const useSettingsStore = create(
  immer<DeckStore & Actions>(set => ({
    numberDecksInShoe: 4,
    dealerMustHitOnSoft17: true,
    allowedToDoubleAfterSplit: true,
    setNumberOfDecks: (numberOfDecks: number) => set({ numberDecksInShoe: numberOfDecks }),
  })),
);
