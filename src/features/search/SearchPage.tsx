import { useState } from 'react';
import { Box, Chip, List, ListItemButton, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../i18n/LocaleProvider';
import { usePlayerStore } from '../player/PlayerStore';
import { searchMusic } from './api/tuneProxy';
import { dedupeMusicItems } from './utils/dedupe';
import type { GroupedMusicItem, Platform } from './types';

const platforms: Platform[] = ['netease', 'qq', 'kuwo'];

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<ReturnType<typeof dedupeMusicItems>>([]);
  const { t } = useLocale();
  const navigate = useNavigate();
  const { setQueue, playTrack } = usePlayerStore();

  const onSearch = async () => {
    if (!q.trim()) return;
    const found = await searchMusic(q, platforms);
    setItems(dedupeMusicItems(found));
  };

  const onPlayGroup = (group: GroupedMusicItem) => {
    if (!group.variants.length) return;
    setQueue(group.variants, 0);
    playTrack(group.variants[0].id);
    navigate(`/player/${group.variants[0].id}`);
  };

  return (
    <Box p={2}>
      <Typography variant="h5">{t('searchTitle')}</Typography>
      <TextField
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        fullWidth
        label={t('searchLabel')}
      />
      <List>
        {items.map((g) => (
          <ListItemButton key={g.key} onClick={() => onPlayGroup(g)}>
            <Box>
              <Typography>{g.canonical.title}</Typography>
              <Typography variant="body2">{g.canonical.artist}</Typography>
              <Box display="flex" gap={1}>
                {g.variants.map((v) => (
                  <Chip key={`${v.platform}-${v.id}`} size="small" label={v.platform} />
                ))}
              </Box>
            </Box>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
