import { create } from 'zustand';
import type { MusicItem } from '../search/types';

export type RepeatMode = 'off' | 'one' | 'all';

export type QueueTrack = MusicItem;

type PlayerState = {
  queue: QueueTrack[];
  currentIndex: number;
  currentTrack?: QueueTrack;
  playing: boolean;
  durationMs: number;
  currentMs: number;
  buffered: number;
  loading: boolean;
  error?: string;
  volume: number;
  repeat: RepeatMode;
  shuffle: boolean;
  setQueue: (queue: QueueTrack[], startIndex?: number) => void;
  playTrack: (trackId: string) => void;
  next: () => void;
  prev: () => void;
  setVolume: (value: number) => void;
  setRepeat: (mode: RepeatMode) => void;
  setShuffle: (enabled: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setDurationMs: (ms: number) => void;
  setCurrentMs: (ms: number) => void;
  setBuffered: (progress: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function resolveTrack(queue: QueueTrack[], index: number): QueueTrack | undefined {
  if (index < 0 || index >= queue.length) return undefined;
  return queue[index];
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  currentTrack: undefined,
  playing: false,
  durationMs: 0,
  currentMs: 0,
  buffered: 0,
  loading: false,
  error: undefined,
  volume: 0.8,
  repeat: 'off',
  shuffle: false,
  setQueue: (queue, startIndex = 0) => {
    const index = queue.length ? clamp(startIndex, 0, queue.length - 1) : -1;
    set({
      queue,
      currentIndex: index,
      currentTrack: resolveTrack(queue, index),
      currentMs: 0,
      durationMs: 0,
      buffered: 0,
      error: undefined,
    });
  },
  playTrack: (trackId) => {
    const queue = get().queue;
    const index = queue.findIndex((track) => track.id === trackId);
    if (index < 0) return;
    set({
      currentIndex: index,
      currentTrack: queue[index],
      currentMs: 0,
      durationMs: 0,
      buffered: 0,
      error: undefined,
      playing: true,
    });
  },
  next: () => {
    const { queue, currentIndex, repeat, shuffle } = get();
    if (!queue.length) return;

    let nextIndex = currentIndex + 1;
    if (shuffle && queue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === currentIndex);
    }

    if (nextIndex >= queue.length) {
      if (repeat === 'all') nextIndex = 0;
      else if (repeat === 'one') nextIndex = currentIndex;
      else {
        set({ playing: false });
        return;
      }
    }

    set({
      currentIndex: nextIndex,
      currentTrack: queue[nextIndex],
      currentMs: 0,
      durationMs: 0,
      buffered: 0,
      error: undefined,
      playing: true,
    });
  },
  prev: () => {
    const { queue, currentIndex, repeat } = get();
    if (!queue.length) return;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeat === 'all') prevIndex = queue.length - 1;
      else prevIndex = 0;
    }

    set({
      currentIndex: prevIndex,
      currentTrack: queue[prevIndex],
      currentMs: 0,
      durationMs: 0,
      buffered: 0,
      error: undefined,
      playing: true,
    });
  },
  setVolume: (value) => set({ volume: clamp(value, 0, 1) }),
  setRepeat: (mode) => set({ repeat: mode }),
  setShuffle: (enabled) => set({ shuffle: enabled }),
  setPlaying: (playing) => set({ playing }),
  setDurationMs: (ms) => set({ durationMs: Math.max(0, ms) }),
  setCurrentMs: (ms) => set({ currentMs: Math.max(0, ms) }),
  setBuffered: (progress) => set({ buffered: clamp(progress, 0, 1) }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
