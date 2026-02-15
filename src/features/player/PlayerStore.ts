import { create } from 'zustand';
export type RepeatMode = 'off' | 'all' | 'one';

export type QueueTrack = {
  id: string;
  title?: string;
  artist?: string;
};

type PlayerState = {
  queue: QueueTrack[];
  currentIndex: number;
  trackId?: string;
  playing: boolean;
  progress: number;
  mode: RepeatMode;
  favorites: string[];
  setQueue: (tracks: QueueTrack[], startIndex?: number) => void;
  setTrack: (id: string) => void;
  next: () => void;
  prev: () => void;
  toggleMode: () => void;
  toggleFavorite: (trackId?: string) => void;
  play: () => void;
  pause: () => void;
  seek: (p: number) => void;
};

const MODES: RepeatMode[] = ['off', 'all', 'one'];

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  playing: false,
  progress: 0,
  mode: 'off',
  favorites: [],
  setQueue: (queue, startIndex = 0) =>
    set(() => {
      if (!queue.length) {
        return { queue: [], currentIndex: 0, trackId: undefined, progress: 0 };
      }
      const boundedIndex = Math.min(Math.max(startIndex, 0), queue.length - 1);
      return {
        queue,
        currentIndex: boundedIndex,
        trackId: queue[boundedIndex]?.id,
        progress: 0,
      };
    }),
  setTrack: (trackId) =>
    set((state) => {
      const index = state.queue.findIndex((track) => track.id === trackId);
      return { trackId, currentIndex: index >= 0 ? index : state.currentIndex, progress: 0 };
    }),
  next: () =>
    set((state) => {
      if (!state.queue.length) return {};
      if (state.mode === 'one') return { progress: 0 };
      const atLast = state.currentIndex >= state.queue.length - 1;
      if (atLast && state.mode !== 'all') return {};
      const nextIndex = atLast ? 0 : state.currentIndex + 1;
      return {
        currentIndex: nextIndex,
        trackId: state.queue[nextIndex]?.id,
        progress: 0,
      };
    }),
  prev: () =>
    set((state) => {
      if (!state.queue.length) return {};
      if (state.mode === 'one') return { progress: 0 };
      const atFirst = state.currentIndex <= 0;
      if (atFirst && state.mode !== 'all') return {};
      const prevIndex = atFirst ? state.queue.length - 1 : state.currentIndex - 1;
      return {
        currentIndex: prevIndex,
        trackId: state.queue[prevIndex]?.id,
        progress: 0,
      };
    }),
  toggleMode: () => {
    const current = get().mode;
    const idx = MODES.indexOf(current);
    set({ mode: MODES[(idx + 1) % MODES.length] });
  },
  toggleFavorite: (trackId) =>
    set((state) => {
      const id = trackId ?? state.trackId;
      if (!id) return {};
      if (state.favorites.includes(id)) {
        return { favorites: state.favorites.filter((favoriteId) => favoriteId !== id) };
      }
      return { favorites: [...state.favorites, id] };
    }),
  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  seek: (progress) => set({ progress })
}));
