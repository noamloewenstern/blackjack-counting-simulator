import { create, useStore } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type ColorPickerState = {
  color: string;
  setColor: (color: string) => void;
};

// const createColorStore = createStore<
//   ColorPickerState,
//   [['zustand/immer', never], ['zustand/subscribeWithSelector', never]]
// >(
// const createColorStore = () => createStore<
//   ColorPickerState,
//   [['zustand/immer', never], ['zustand/subscribeWithSelector', never]]
// >(
const createColorStore = () =>
  create<ColorPickerState, [['zustand/immer', never], ['zustand/subscribeWithSelector', never]]>(
    immer(
      subscribeWithSelector(set => ({
        color: 'red',
        setColor: (color: string) => set({ color }),
      })),
    ),
  );

type ColorStore = ReturnType<typeof createColorStore>;
type ColorKeyType = string;
const stores: Record<ColorKeyType, ColorStore> = {};

const getStore = (key: ColorKeyType) => {
  let store = stores[key];
  if (!store) {
    store = stores[key] = createColorStore();
  }
  return store;
};

const useColorStore = (key: ColorKeyType) => {
  return useStore(getStore(key));
};

export default useColorStore;
