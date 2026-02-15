import { Avatar, Box, Card, CardContent, Chip, Divider, List, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useLocale } from '../i18n/LocaleProvider';

const recentTracks = [
  { title: '晴天', artist: '周杰伦', time: '今天 09:21' },
  { title: '夜曲', artist: '周杰伦', time: '昨天 22:03' },
  { title: 'Shape of You', artist: 'Ed Sheeran', time: '昨天 18:30' },
  { title: '海阔天空', artist: 'Beyond', time: '周二 07:45' },
];

const recommendedPlaylists = [
  { name: '华语通勤精选', desc: '早高峰轻快节奏，告别犯困', tags: ['流行', '轻松', '早高峰'] },
  { name: '夜间电子氛围', desc: '适合深夜写代码和独处时刻', tags: ['电子', 'Chill', '深夜'] },
  { name: '经典港乐回忆', desc: '80/90 年代必听粤语金曲', tags: ['粤语', '经典', '90s'] },
];

export default function Home() {
  const { t } = useLocale();

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Card
        sx={{
          mb: 2,
          borderRadius: 4,
          color: '#fff',
          background: 'linear-gradient(120deg, #6750A4 0%, #8A72D7 45%, #4A3D9E 100%)',
        }}
      >
        <CardContent sx={{ py: 3 }}>
          <Typography variant="h4" fontWeight={800}>
            {t('appTitle')}
          </Typography>
          <Typography sx={{ opacity: 0.88 }}>{t('appSubtitle')}</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                {t('recentHistory')}
              </Typography>
              <List disablePadding>
                {recentTracks.map((track, index) => (
                  <Box key={`${track.title}-${track.time}`}>
                    <ListItem disableGutters>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>{track.title[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={`${track.title} · ${track.artist}`} secondary={`${t('continueListening')} · ${track.time}`} />
                    </ListItem>
                    {index < recentTracks.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                {t('recommendedPlaylists')}
              </Typography>
              <Stack spacing={1.2}>
                {recommendedPlaylists.map((playlist) => (
                  <Box key={playlist.name} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: 1.5 }}>
                    <Typography fontWeight={700}>{playlist.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {playlist.desc}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {playlist.tags.map((tag) => (
                        <Chip key={`${playlist.name}-${tag}`} size="small" label={tag} variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
