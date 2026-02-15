import { useEffect } from 'react';
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
  const { setTrack, play } = usePlayerStore();

  useEffect(() => {
    if (id) {
      setTrack(id);
      play();
    }
  }, [id, setTrack, play]);


  return (
    <AppShell>
      <PageHeader title="Now Playing" subtitle="歌词与播放控制采用统一卡片层级。" />
      <Stack spacing={2}>
        <SectionCard sx={{ p: 2 }}>
          <LyricsView
            lines={mock}
            currentMs={900}
            title={activeTrack?.title ?? '未选择歌曲'}
            artist={activeTrack?.artist ?? '请选择一首歌曲开始播放'}
          />
        </SectionCard>
        <SectionCard sx={{ p: 2 }}>
          <PlayerControls />
        </SectionCard>
      </Stack>
    </AppShell>
  );
}
