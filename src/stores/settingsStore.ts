import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
type AutomatePlay = {
  isOn: boolean;
  toggle: () => void;
  intervalWaitBetweenPlays: number;
  setIntervalWaitBetweenPlays: (interval: number) => void;
};
type DeckStore = {
  numberDecksInShoe: number;
  dealerMustHitOnSoft17: boolean;
  allowedToDoubleAfterSplit: boolean;

  automateInteractivePlayer: boolean;
  autoPlay: AutomatePlay;
};
type Actions = {
  setNumberOfDecks: (numberOfDecks: number) => void;
  toggleAutomateInteractivePlayer: () => void;
};

export const useSettingsStore = create(
  immer<DeckStore & Actions>(set => ({
    numberDecksInShoe: 4,
    dealerMustHitOnSoft17: true,
    allowedToDoubleAfterSplit: true,

    // automateInteractivePlayer: true,
    automateInteractivePlayer: false,
    autoPlay: {
      isOn: false,
      toggle: () => set(state => ({ autoPlay: { ...state.autoPlay, automatePlay: !state.autoPlay.isOn } })),
      intervalWaitBetweenPlays: 1000,
      setIntervalWaitBetweenPlays: (interval: number) =>
        set(state => ({ autoPlay: { ...state.autoPlay, intervalWaitBetweenPlays: interval } })),
    },

    setNumberOfDecks: (numberOfDecks: number) => set({ numberDecksInShoe: numberOfDecks }),
    toggleAutomateInteractivePlayer: () =>
      set(state => ({ automateInteractivePlayer: !state.automateInteractivePlayer })),
  })),
);
