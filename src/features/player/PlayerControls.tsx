import { Box, Button, Stack } from '@mui/material';
import WaveProgress from '../../components/WaveProgress';
import { usePlayerStore } from './PlayerStore';

type PlayerControlsProps = {
  onSeek: (progress: number) => void;
};

export default function PlayerControls({ onSeek }: PlayerControlsProps) {
  const { playing, setPlaying, currentMs, durationMs, next, prev } = usePlayerStore();
  const progress = durationMs > 0 ? currentMs / durationMs : 0;

  return (
    <Box>
      <WaveProgress progress={progress} onSeek={onSeek} />
      <Stack direction="row" spacing={1} mt={2}>
        <Button onClick={prev}>Prev</Button>
        <Button onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</Button>
        <Button onClick={next}>Next</Button>
      </Stack>
    </Box>
  );
}
