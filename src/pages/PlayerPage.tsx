import { Box } from '@mui/material';
import LyricsView from '../components/LyricsView';
import PlayerControls from '../features/player/PlayerControls';

const mock = [
  { id: '1', t: 0, text: 'Hello world', words: [{ t: 0, word: 'Hello ' }, { t: 500, word: 'world' }] },
  { id: '2', t: 2000, text: 'Sing with me' }
];

export default function PlayerPage() {
  return (
    <Box p={2}>
      <LyricsView lines={mock} currentMs={900} />
      <PlayerControls />
    </Box>
  );
}
