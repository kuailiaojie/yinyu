import { useState } from 'react';
import { Box, Chip, List, ListItemButton, TextField, Typography } from '@mui/material';
import { searchMusic } from './api/tuneProxy';
import { dedupeMusic } from './utils/dedupe';
import type { Platform } from './types';

const platforms: Platform[] = ['netease', 'qq', 'kuwo'];

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<ReturnType<typeof dedupeMusic>>([]);

  const onSearch = async () => {
    if (!q.trim()) return;
    const found = await searchMusic(q, platforms);
    setItems(dedupeMusic(found));
  };

  return (
    <Box p={2}>
      <Typography variant="h5">Aggregated Search</Typography>
      <TextField
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        fullWidth
        label="Search music"
      />
      <List>
        {items.map((g) => (
          <ListItemButton key={g.key}>
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
