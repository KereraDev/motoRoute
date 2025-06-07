import { create } from 'zustand';

export const useTabIndexStore = create<{
  index: number;
  setIndex: (index: number) => void;
}>(set => ({
  index: 0,
  setIndex: index => set({ index }),
}));
