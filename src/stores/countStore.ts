import { useSettingsStore } from './settingsStore';
import { create } from 'zustand';
import { Card } from '../lib/deck';
import { immer } from 'zustand/middleware/immer';
import { calcHiLowCount } from '../lib/strategies/utils';

type CountStore = {
  runningCount: number;
};
type Actions = {
  getAbsoluteCount: () => number;
  updateCount: (card: Card) => void;
  resetCount: () => void;
};

export const useCountStore = create(
  immer<CountStore & Actions>((set, get) => ({
    runningCount: 0,
    getAbsoluteCount: () => {
      const { numberDecksInShoe: numberOfDecks } = useSettingsStore.getState();
      return get().runningCount / numberOfDecks;
    },
    updateCount: card => {
      if (!card.isVisible) return;
      set(state => {
        state.runningCount += calcHiLowCount(card);
      });
    },
    resetCount: () => {
      set({ runningCount: 0 });
    },
  })),
);
