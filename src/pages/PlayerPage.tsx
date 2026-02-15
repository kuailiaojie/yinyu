import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LyricsView from '../components/LyricsView';
import PlayerControls from '../features/player/PlayerControls';
import { usePlayerStore } from '../features/player/PlayerStore';

const mock = [
  { id: '1', t: 0, text: 'Hello world', words: [{ t: 0, word: 'Hello ' }, { t: 500, word: 'world' }] },
  { id: '2', t: 2000, text: 'Sing with me' }
];

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const { queue, trackId, setTrack, play } = usePlayerStore();

  useEffect(() => {
    if (id) {
      setTrack(id);
      play();
    }
  }, [id, setTrack, play]);

  const activeTrack = queue.find((track) => track.id === (trackId ?? id));

  return (
    <Box p={2}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {activeTrack ? `${activeTrack.title ?? 'Unknown'} · ${activeTrack.artist ?? 'Unknown'}` : `Now playing: ${trackId ?? id ?? 'N/A'}`}
      </Typography>
      <LyricsView lines={mock} currentMs={900} />
      <PlayerControls />
    </Box>
  );
}
