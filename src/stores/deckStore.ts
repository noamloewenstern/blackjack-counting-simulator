import { useSettingsStore } from './settingsStore';
import { create } from 'zustand';
import { type Card, createDeck, shuffleDeck } from '../lib/deck';
import { immer } from 'zustand/middleware/immer';
import { useRunningCount } from './countStore';

type DeckStore = {
  shoe: Card[];
};
type Actions = {
  shuffle: () => Card[];
  drawCard: (opts?: { visible?: boolean }) => Card;
};

export const useDeckStore = create(
  immer<DeckStore & Actions>((set, get) => ({
    shoe: [], // To be filled with cards at game start

    shuffle: () => {
      const { numberDecksInShoe: numberOfDecks } = useSettingsStore.getState();
      const newDecks = Array.from({ length: numberOfDecks }).map(createDeck).flat();
      const shuffledNewDeck = shuffleDeck(shuffleDeck(newDecks));
      set({ shoe: shuffledNewDeck });
      return shuffledNewDeck;
    },
    drawCard: ({ visible = true } = {}) => {
      const { shoe: deck } = get();
      if (!deck.length) throw new Error('No cards left in deck');
      const [card, ...rest] = deck;
      card!.isVisible = visible;
      set({ shoe: rest });
      if (visible) {
        useRunningCount.getState().updateCount(card!);
      }
      return card!;
    },
  })),
);
