import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type DeckStore = {
  numberOfDecks: number;
};
type Actions = {
  setNumberOfDecks: (numberOfDecks: number) => void;
};

export const useSettingsStore = create(
  immer<DeckStore & Actions>(set => ({
    numberOfDecks: 4, // To be set by the user
    setNumberOfDecks: (numberOfDecks: number) => set({ numberOfDecks }),
  })),
);
