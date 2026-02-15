import { Stack } from '@mui/material';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import LyricsView from '../components/LyricsView';
import PlayerControls from '../features/player/PlayerControls';

const mock = [
  { id: '1', t: 0, text: 'Hello world', words: [{ t: 0, word: 'Hello ' }, { t: 500, word: 'world' }] },
  { id: '2', t: 2000, text: 'Sing with me' },
];

export default function PlayerPage() {
  return (
    <AppShell>
      <PageHeader title="Now Playing" subtitle="歌词与播放控制采用统一卡片层级。" />
      <Stack spacing={2}>
        <SectionCard sx={{ p: 2 }}>
          <LyricsView lines={mock} currentMs={900} />
        </SectionCard>
        <SectionCard sx={{ p: 2 }}>
          <PlayerControls />
        </SectionCard>
      </Stack>
    </AppShell>
  );
}
