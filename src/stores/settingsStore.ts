import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type AutomateStore = {
  isOn: boolean;
  toggle: () => void;
  intervalWaits: {
    betweenPlays: number;
    shuffleDeckBeforeNextDeal: number;
    splitHand: number;
    hitDealer: number;
    hitPlayer: number;
    playerAction: number;
  };
};
export type SettingsStore = {
  numberDecksInShoe: number;
  dealerMustHitOnSoft17: boolean;
  allowedToDoubleAfterSplit: boolean;
};
type Actions = {
  setNumberOfDecks: (numberOfDecks: number) => void;
};

export const useSettingsStore = create(
  immer<SettingsStore & Actions>(set => ({
    numberDecksInShoe: 4,
    dealerMustHitOnSoft17: true,
    allowedToDoubleAfterSplit: true,

    setNumberOfDecks: (numberOfDecks: number) => set({ numberDecksInShoe: numberOfDecks }),
  })),
);

export const useAutomationSettingsStore = create(
  immer<AutomateStore>(set => ({
    isOn: false,
    // isOn: true,
    toggle: () => set(state => ({ isOn: !state.isOn })),
    intervalWaits: {
      betweenPlays: 1000,
      shuffleDeckBeforeNextDeal: 1000,
      splitHand: 400,
      hitDealer: 400,
      hitPlayer: 400,
      playerAction: 400,
    },
  })),
);

export const useIsAutomateInteractivePlayer = () => useAutomationSettingsStore(state => state.isOn);
