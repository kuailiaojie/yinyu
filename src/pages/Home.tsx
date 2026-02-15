import { Avatar, Box, Card, Chip, Divider, List, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useLocale } from '../i18n/LocaleProvider';

const recentTracks = [
  { title: '晴天', artist: '周杰伦', time: '今天 09:21' },
  { title: '夜曲', artist: '周杰伦', time: '昨天 22:03' },
  { title: 'Shape of You', artist: 'Ed Sheeran', time: '昨天 18:30' },
  { title: '海阔天空', artist: 'Beyond', time: '周二 07:45' },
];

const recommendedPlaylists = [
  { name: '华语通勤精选', desc: '适合上班路上的轻快流行集合', tags: ['流行', '轻松', '早高峰'] },
  { name: '夜间电子氛围', desc: '低饱和电子与氛围感节奏', tags: ['电子', 'Chill', '深夜'] },
  { name: '经典港乐回忆', desc: '80-00 年代粤语金曲回顾', tags: ['粤语', '经典', '90s'] },
];

export default function Home() {
  const { t } = useLocale();

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Card
        sx={{
          p: { xs: 2, md: 3 },
          mb: 2,
          borderRadius: 4,
          color: 'white',
          background: 'linear-gradient(135deg, #6f5ce7 0%, #4a7ff5 45%, #22a6f2 100%)',
          boxShadow: '0 20px 40px rgba(37,79,185,0.28)',
        }}
      >
        <Typography variant="h4" fontWeight={800}>
          {t('appTitle')}
        </Typography>
        <Typography sx={{ opacity: 0.92, mt: 0.8 }}>{t('appSubtitle')}</Typography>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <Box px={2} pt={2}>
              <Typography variant="h6" fontWeight={700}>
                {t('recentHistory')}
              </Typography>
            </Box>
            <List sx={{ px: 1.5, pb: 1.5 }}>
              {recentTracks.map((track, index) => (
                <Box key={`${track.title}-${track.time}`}>
                  <ListItem disableGutters sx={{ px: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#5e6ad2' }}>{track.title.slice(0, 1)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`${track.title} · ${track.artist}`} secondary={`${t('continueListening')} · ${track.time}`} />
                  </ListItem>
                  {index < recentTracks.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <Box px={2} pt={2}>
              <Typography variant="h6" fontWeight={700}>
                {t('recommendedPlaylists')}
              </Typography>
            </Box>
            <Stack spacing={1.25} sx={{ p: 2 }}>
              {recommendedPlaylists.map((playlist) => (
                <Box key={playlist.name} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: 1.5 }}>
                  <Typography fontWeight={700}>{playlist.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                    {playlist.desc}
                  </Typography>
                  <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                    {playlist.tags.map((tag) => (
                      <Chip key={`${playlist.name}-${tag}`} size="small" label={tag} />
                    ))}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
