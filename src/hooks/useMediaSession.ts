import { useEffect } from 'react';

type Args = {
  title: string;
  artist: string;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export function useMediaSession({ title, artist, onPlay, onPause, onNext, onPrev }: Args) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title, artist });
    navigator.mediaSession.setActionHandler('play', onPlay);
    navigator.mediaSession.setActionHandler('pause', onPause);
    navigator.mediaSession.setActionHandler('nexttrack', onNext);
    navigator.mediaSession.setActionHandler('previoustrack', onPrev);
  }, [title, artist, onPlay, onPause, onNext, onPrev]);
}
