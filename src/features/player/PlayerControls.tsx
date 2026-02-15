import { Box, Button } from '@mui/material';
import WaveProgress from '../../components/WaveProgress';
import { usePlayerStore } from './PlayerStore';

export default function PlayerControls() {
  const {
    playing,
    play,
    pause,
    progress,
    seek,
    next,
    prev,
    mode,
    toggleMode,
    favorites,
    trackId,
    toggleFavorite,
  } = usePlayerStore();

  const isFavorite = trackId ? favorites.includes(trackId) : false;

  return (
    <Box display="grid" gap={1.5}>
      <WaveProgress progress={progress} onSeek={seek} />
      <Box display="flex" gap={1} flexWrap="wrap">
        <Button onClick={prev} aria-label="previous track">
          Prev
        </Button>
        <Button onClick={() => (playing ? pause() : play())}>{playing ? 'Pause' : 'Play'}</Button>
        <Button onClick={next} aria-label="next track">
          Next
        </Button>
        <Button onClick={toggleMode} aria-label="repeat mode">
          Mode: {mode}
        </Button>
        <Button onClick={() => toggleFavorite()} aria-label="favorite track">
          {isFavorite ? 'Unfavorite' : 'Favorite'}
        </Button>
      </Box>
    </Box>
  );
}
