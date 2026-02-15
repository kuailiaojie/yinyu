import { useState } from 'react';
import { List, TextField } from '@mui/material';
import AppShell from '../../components/AppShell';
import EmptyState from '../../components/EmptyState';
import MusicListItem from '../../components/MusicListItem';
import PageHeader from '../../components/PageHeader';
import SectionCard from '../../components/SectionCard';
import { useLocale } from '../../i18n/LocaleProvider';
import { usePlayerStore } from '../player/PlayerStore';
import { searchMusic } from './api/tuneProxy';
import type { Platform } from './types';
import { dedupeMusicItems } from './utils/dedupe';

const platforms: Platform[] = ['netease', 'qq', 'kuwo'];

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<ReturnType<typeof dedupeMusicItems>>([]);
  const { t } = useLocale();
  const navigate = useNavigate();
  const setQueue = usePlayerStore((state) => state.setQueue);

  const onSearch = async () => {
    if (!q.trim()) return;
    const found = await searchMusic(q, platforms);
    setItems(dedupeMusicItems(found));
  };

  const onPickGroup = (groupKey: string) => {
    const queue = items.map((group) => ({
      id: group.canonical.id,
      title: group.canonical.title,
      artist: group.canonical.artist,
    }));
    const selectedIndex = items.findIndex((group) => group.key === groupKey);
    setQueue(queue, selectedIndex >= 0 ? selectedIndex : 0);
    const selectedTrackId = items[selectedIndex]?.canonical.id;
    if (selectedTrackId) {
      navigate(`/player/${selectedTrackId}`);
    }
  };

  return (
    <AppShell>
      <PageHeader title={t('searchTitle')} subtitle="跨平台聚合结果，统一去重展示。" />
      <SectionCard sx={{ p: 2.5 }}>
        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          fullWidth
          label={t('searchLabel')}
        />
      </SectionCard>

      <SectionCard>
        {items.length === 0 ? (
          <EmptyState title="输入关键词开始搜索" description="支持网易云 / QQ 音乐 / 酷我聚合检索。" />
        ) : (
          <List sx={{ px: 1.5, py: 1.5 }}>
            {items.map((g) => (
              <MusicListItem
                key={g.key}
                title={g.canonical.title}
                subtitle={g.canonical.artist}
                chips={g.variants.map((v) => v.platform)}
                onClick={() => undefined}
              />
            ))}
          </List>
        )}
      </SectionCard>
    </AppShell>
  );
}
