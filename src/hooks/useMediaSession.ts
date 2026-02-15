import { useEffect } from 'react';

type Args = {
  title: string;
  artist: string;
  artwork?: string;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeekTo: (seekTimeSec: number) => void;
  onSeekBy: (offsetSec: number) => void;
};

export function useMediaSession({
  title,
  artist,
  artwork,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onSeekTo,
  onSeekBy,
}: Args) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      artwork: artwork
        ? [
            { src: artwork, sizes: '96x96', type: 'image/jpeg' },
            { src: artwork, sizes: '192x192', type: 'image/jpeg' },
            { src: artwork, sizes: '512x512', type: 'image/jpeg' },
          ]
        : undefined,
    });

    navigator.mediaSession.setActionHandler('play', onPlay);
    navigator.mediaSession.setActionHandler('pause', onPause);
    navigator.mediaSession.setActionHandler('nexttrack', onNext);
    navigator.mediaSession.setActionHandler('previoustrack', onPrev);
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') onSeekTo(details.seekTime);
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => onSeekBy(details.seekOffset ?? 10));
    navigator.mediaSession.setActionHandler('seekbackward', (details) => onSeekBy(-(details.seekOffset ?? 10)));

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
    };
  }, [title, artist, artwork, onPlay, onPause, onNext, onPrev, onSeekTo, onSeekBy]);
}
