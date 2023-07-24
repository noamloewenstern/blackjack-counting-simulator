import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import deepMerge from 'deepmerge';

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
  setIntervalWaits: (intervalWaits: Partial<AutomateStore['intervalWaits']>) => void;
  reset: (newState?: Partial<AutomateStore>) => void;
};
export type SettingsStore = {
  numberDecksInShoe: number;
  dealerMustHitOnSoft17: boolean;
  allowedToDoubleAfterSplit: boolean;
  allowedToDouble: boolean;
};
type Actions = {
  setNumberOfDecks: (numberOfDecks: number) => void;
  reset: (newState?: Partial<SettingsStore>) => void;
};

export const useSettingsStore = create(
  persist(
    immer<SettingsStore & Actions>(set => ({
      numberDecksInShoe: 6,
      dealerMustHitOnSoft17: true,
      allowedToDoubleAfterSplit: true,
      allowedToDouble: true,

      setNumberOfDecks: (numberOfDecks: number) => set({ numberDecksInShoe: numberOfDecks }),
      reset: (newState = {}) => {
        localStorage.removeItem('settings');
        set(state => ({
          numberDecksInShoe: 6,
          dealerMustHitOnSoft17: true,
          allowedToDoubleAfterSplit: true,
          allowedToDouble: true,
          ...newState,
        }));
      },
    })),
    {
      name: 'settings',
    },
  ),
);

export const useAutomationSettingsStore = create(
  persist(
    immer<AutomateStore>(set => ({
      isOn: false,
      toggle: () => set(state => ({ isOn: !state.isOn })),
      intervalWaits: {
        betweenPlays: 1000,
        shuffleDeckBeforeNextDeal: 1000,
        splitHand: 400,
        hitDealer: 400,
        hitPlayer: 400,
        playerAction: 400,
      },
      setIntervalWaits: (intervalWaits: Partial<AutomateStore['intervalWaits']>) =>
        set(state => ({ intervalWaits: { ...state.intervalWaits, ...intervalWaits } })),
      reset: (newState = {}) => {
        localStorage.removeItem('automate-settings');
        set({
          isOn: false,
          ...newState,
          intervalWaits: {
            betweenPlays: 1000,
            shuffleDeckBeforeNextDeal: 1000,
            splitHand: 400,
            hitDealer: 400,
            hitPlayer: 400,
            playerAction: 400,
            ...(newState.intervalWaits || {}),
          },
        });
      },
    })),
    {
      name: 'automate-settings',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merge: (persistedState, currentState) => deepMerge(currentState, persistedState as any),
    },
  ),
);

export const useIsAutomateInteractivePlayer = () => useAutomationSettingsStore(state => state.isOn);
