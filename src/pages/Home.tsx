import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded';
import PetsRounded from '@mui/icons-material/PetsRounded';
import { Box, Chip, Divider, List, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AppShell from '../components/AppShell';
import GlassPanel from '../components/GlassPanel';
import MusicListItem from '../components/MusicListItem';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { useLocale } from '../i18n/LocaleProvider';
import { designTokens } from '../theme/designTokens';

const recentTracks = [
  { title: '晴天', artist: '周杰伦', time: '今天 09:21' },
  { title: '夜曲', artist: '周杰伦', time: '昨天 22:03' },
  { title: 'Shape of You', artist: 'Ed Sheeran', time: '昨天 18:30' },
  { title: '海阔天空', artist: 'Beyond', time: '周二 07:45' },
];

const recommendedPlaylists = [
  { name: '华语通勤精选', desc: '适合上班路上的轻快流行集合', tags: ['流行', '轻松', '早高峰'], cover: '#f59ab2' },
  { name: '夜间电子氛围', desc: '低饱和电子与氛围感节奏', tags: ['电子', 'Chill', '深夜'], cover: '#89b6d1' },
  { name: '经典港乐回忆', desc: '80-00 年代粤语金曲回顾', tags: ['粤语', '经典', '90s'], cover: '#f2bf86' },
];

export default function Home() {
  const { t } = useLocale();

  return (
    <AppShell>
      <GlassPanel
        sx={{
          p: { xs: 2.5, md: 3 },
          background: 'linear-gradient(135deg, rgba(232,237,255,0.86) 0%, rgba(255,255,255,0.74) 55%, rgba(255,241,188,0.5) 100%)',
          color: 'rgba(18, 20, 30, 0.92)',
        }}
      >
        <PageHeader title={t('appTitle')} subtitle={`${t('appSubtitle')} 🐰`} action={<PetsRounded />} />
      </GlassPanel>

      <Grid container spacing={designTokens.spacing.lg}>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard sx={{ p: 1 }}>
            <Box px={2.5} pt={2.5}>
              <Typography variant="h6">{t('recentHistory')}</Typography>
            </Box>
            <List sx={{ px: 1.2, pb: 1.8 }}>
              {recentTracks.map((track, index) => (
                <Box key={`${track.title}-${track.time}`}>
                  <MusicListItem
                    title={`${track.title} · ${track.artist}`}
                    subtitle={`${t('continueListening')} · ${track.time}`}
                    avatarText={track.title.slice(0, 1)}
                    trailingAction={<FavoriteBorderRounded color="error" fontSize="small" />}
                  />
                  {index < recentTracks.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(101,112,137,0.1)' }} />}
                </Box>
              ))}
            </List>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6">{t('recommendedPlaylists')}</Typography>
            <Grid container spacing={1.5} mt={0.5}>
              {recommendedPlaylists.map((playlist) => (
                <Grid key={playlist.name} size={{ xs: 12, sm: 4, md: 12 }}>
                  <Box sx={{ border: '1px solid', borderColor: 'rgba(255,255,255,0.9)', borderRadius: 3, p: 1.2, bgcolor: 'rgba(255,255,255,0.58)' }}>
                    <Box sx={{ borderRadius: 2.5, height: 120, background: `linear-gradient(160deg, ${playlist.cover}, #ffffff)`, mb: 1.2 }} />
                    <Typography fontWeight={700}>{playlist.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {playlist.desc}
                    </Typography>
                    <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                      {playlist.tags.map((tag) => (
                        <Chip key={`${playlist.name}-${tag}`} size="small" label={tag} sx={{ bgcolor: 'rgba(0,0,0,0.06)' }} />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>
    </AppShell>
  );
}
