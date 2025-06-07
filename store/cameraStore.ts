import { create } from 'zustand';

type CameraStore = {
  photoUri: string | null;
  setPhotoUri: (uri: string) => void;
  clearPhoto: () => void;
};

export const useCameraStore = create<CameraStore>(set => ({
  photoUri: null,
  setPhotoUri: uri => set({ photoUri: uri }),
  clearPhoto: () => set({ photoUri: null }),
}));
