import { useSettingsStore } from './settingsStore';
import { create } from 'zustand';
import { Card, createDeck, shuffleDeck } from '../lib/deck';
import { immer } from 'zustand/middleware/immer';

type DeckStore = {
  deck: Card[];
};
type Actions = {
  shuffle: () => Card[];
  drawCard: () => Card;
};

export const useDeckStore = create(
  immer<DeckStore & Actions>((set, get) => ({
    deck: [], // To be filled with cards at game start

    shuffle: () => {
      const { numberOfDecks } = useSettingsStore.getState();
      const newDecks = new Array(numberOfDecks).fill(null).map(createDeck).flat();
      const shuffledNewDeck = shuffleDeck(newDecks);
      set({ deck: shuffledNewDeck });
      return shuffledNewDeck;
    },
    drawCard: () => {
      const { deck } = get();
      if (!deck.length) throw new Error('No cards left in deck');
      const [card, ...rest] = deck;
      set({ deck: rest });
      return card;
    },
  })),
);
