import { useEffect, useMemo } from 'react';
import { Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import LyricsView from '../components/LyricsView';
import PlayerControls from '../features/player/PlayerControls';
import { usePlayerStore } from '../features/player/PlayerStore';

const mock = [
  { id: '1', t: 0, text: 'Hello world', words: [{ t: 0, word: 'Hello ' }, { t: 500, word: 'world' }] },
  { id: '2', t: 2000, text: 'Sing with me' },
];

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const { setTrack, play, queue, currentIndex, trackId } = usePlayerStore();

  useEffect(() => {
    if (id) {
      setTrack(id);
      play();
    }
  }, [id, setTrack, play]);

  const activeTrack = useMemo(() => {
    if (!queue.length) return undefined;
    if (trackId) {
      const byId = queue.find((track) => track.id === trackId);
      if (byId) return byId;
    }
    return queue[currentIndex];
  }, [queue, currentIndex, trackId]);

  return (
    <AppShell>
      <PageHeader
        title="Now Playing"
        subtitle={activeTrack ? `${activeTrack.title ?? '未知歌曲'} · ${activeTrack.artist ?? '未知歌手'}` : '请选择一首歌曲开始播放'}
      />
      <Stack spacing={2}>
        <SectionCard sx={{ p: 2 }}>
          <LyricsView
            lines={mock}
            currentMs={900}
          />
        </SectionCard>
        <SectionCard sx={{ p: 2 }}>
          <PlayerControls />
        </SectionCard>
      </Stack>
    </AppShell>
  );
}
