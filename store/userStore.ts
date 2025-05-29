import { create } from 'zustand';

type User = {
  username: string;
  avatar: string;
};

type UserStore = {
  user: User;
  setUser: (user: User) => void;
};

export const useUserStore = create<UserStore>(set => ({
  user: {
    username: 'Mario',
    avatar:
      'https://preview.redd.it/one-piece-icons-by-me-v0-qweam8vkaxv91.jpg?width=640&crop=smart&auto=webp&s=9b7bdc3f934afe5a90f906d0d694c26ea83ff196', // imagen simulada
  },
  setUser: user => set({ user }),
}));
