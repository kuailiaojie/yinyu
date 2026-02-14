import { Box, Button } from '@mui/material';
import WaveProgress from '../../components/WaveProgress';
import { usePlayerStore } from './PlayerStore';

export default function PlayerControls() {
  const { playing, play, pause, progress, seek } = usePlayerStore();
  return (
    <Box>
      <WaveProgress progress={progress} onSeek={seek} />
      <Button onClick={() => (playing ? pause() : play())}>{playing ? 'Pause' : 'Play'}</Button>
    </Box>
  );
}
