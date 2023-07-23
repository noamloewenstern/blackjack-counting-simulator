import { useSettingsStore } from './settingsStore';
import { create } from 'zustand';
import type { Card } from '../lib/deck';
import { immer } from 'zustand/middleware/immer';
import { COUNTING_STRATEGIES } from '../lib/strategies/utils';
import { roundToNearestHalf } from '~/lib/utils';

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
      return roundToNearestHalf(get().runningCount / numberDecksInShoe);
    },
    updateCount: card => {
      set(state => {
        state.runningCount += COUNTING_STRATEGIES.calculate['Hi-Lo'](card);
      });
    },
    resetCount: () => {
      set({ runningCount: 0 });
    },
  })),
);
