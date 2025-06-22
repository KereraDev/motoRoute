import { create } from 'zustand';

export type User = {
  nombreVisible: string;
  avatar: string;
  uid: string;
  fotoPerfilURL?: string;
};

type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserStore>(set => ({
  user: null,
  setUser: user => set({ user }),
}));
