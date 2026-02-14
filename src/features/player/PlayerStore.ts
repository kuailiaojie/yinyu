import { create } from 'zustand';

type PlayerState = {
  trackId?: string;
  playing: boolean;
  progress: number;
  setTrack: (id: string) => void;
  play: () => void;
  pause: () => void;
  seek: (p: number) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  playing: false,
  progress: 0,
  setTrack: (trackId) => set({ trackId }),
  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  seek: (progress) => set({ progress })
}));
