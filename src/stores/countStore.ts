import { useSettingsStore } from './settingsStore';
import { create } from 'zustand';
import { Card } from '../lib/deck';
import { immer } from 'zustand/middleware/immer';
import { COUNTING_STRATEGIES } from '../lib/strategies/utils';

type CountStore = {
  runningCount: number;
};
type Actions = {
  getAbsoluteCount: () => number;
  updateCount: (card: Card) => void;
  resetCount: () => void;
};

export const useRunningCount = create(
  immer<CountStore & Actions>((set, get) => ({
    runningCount: 0,
    getAbsoluteCount: () => {
      const { numberDecksInShoe } = useSettingsStore.getState();
      return get().runningCount / numberDecksInShoe;
    },
    updateCount: card => {
      if (!card.isVisible) return;
      set(state => {
        state.runningCount += COUNTING_STRATEGIES.calculate['Hi-Lo'](card);
      });
    },
    resetCount: () => {
      set({ runningCount: 0 });
    },
  })),
);
