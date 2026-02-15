import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LyricsView from '../components/LyricsView';
import PlayerControls from '../features/player/PlayerControls';
import { usePlayerStore } from '../features/player/PlayerStore';

function parseLrc(lyrics: string): LyricLine[] {
  return lyrics
    .split(/\r?\n/)
    .map((line, idx) => {
      const matched = line.match(/^\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\](.*)$/);
      if (!matched) return null;
      const minute = Number(matched[1]);
      const second = Number(matched[2]);
      const msRaw = matched[3] ?? '0';
      const ms = Number(msRaw.padEnd(3, '0'));
      const text = matched[4].trim();
      return { id: `${minute}-${second}-${idx}`, t: minute * 60_000 + second * 1_000 + ms, text };
    })
    .filter((line): line is LyricLine => Boolean(line))
    .sort((a, b) => a.t - b.t);
}

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
