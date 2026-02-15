import HomeRounded from '@mui/icons-material/HomeRounded';
import QueryStatsRounded from '@mui/icons-material/QueryStatsRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import { Box, Button, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useLocale } from '../i18n/LocaleProvider';
import { designTokens } from '../theme/designTokens';

export default function CapsuleNav() {
  const { t } = useLocale();

  const items = [
    { label: t('navHome'), to: '/', icon: <HomeRounded fontSize="small" /> },
    { label: t('navSearch'), to: '/search', icon: <SearchRounded fontSize="small" /> },
    { label: t('navCharts'), to: '/charts', icon: <QueryStatsRounded fontSize="small" /> },
    { label: t('navSettings'), to: '/settings', icon: <SettingsRounded fontSize="small" /> },
  ] as const;

  return (
    <Box
      component="nav"
      aria-label="primary navigation"
      sx={{
        position: 'fixed',
        zIndex: 20,
        display: 'flex',
        gap: designTokens.spacing.xs,
        p: designTokens.spacing.sm,
        borderRadius: designTokens.radius.xl,
        border: '1px solid rgba(255,255,255,0.85)',
        boxShadow: designTokens.elevation.floating,
        bgcolor: 'rgba(255,255,255,0.74)',
        backdropFilter: designTokens.glass.backdropFilter,
        left: { xs: '50%', md: 16 },
        bottom: { xs: 14, md: 'auto' },
        top: { xs: 'auto', md: 16 },
        transform: { xs: 'translateX(-50%)', md: 'none' },
        flexDirection: { xs: 'row', md: 'column' },
        minWidth: { xs: 'auto', md: 228 },
      }}
    >
      <Typography variant="overline" sx={{ px: 1, color: 'rgba(58,62,80,0.55)', display: { xs: 'none', md: 'block' }, fontWeight: 700 }}>
        音愈 YINYU
      </Typography>
      {items.map(({ label, to, icon }) => (
        <Button
          key={to}
          component={NavLink}
          to={to}
          end={to === '/'}
          startIcon={icon}
          sx={{
            color: 'rgba(44,48,66,0.9)',
            justifyContent: { xs: 'center', md: 'flex-start' },
            borderRadius: designTokens.radius.pill,
            px: { xs: 1.2, md: 1.5 },
            minWidth: { xs: 0, md: 'auto' },
            fontWeight: 700,
            letterSpacing: 0.3,
            transition: `all ${designTokens.motion.duration.standard} ${designTokens.motion.easing.standard}`,
            '& .MuiButton-startIcon': {
              mr: { xs: 0, md: 0.9 },
              ml: 0,
              transition: `transform ${designTokens.motion.duration.standard} ${designTokens.motion.easing.standard}`,
            },
            '&.active': {
              bgcolor: 'rgba(246, 207, 224, 0.9)',
              color: 'rgba(60,45,56,0.95)',
              transform: 'translateX(2px)',
              boxShadow: '0 10px 18px rgba(248, 185, 211, 0.34)',
              '& .MuiButton-startIcon': {
                transform: 'scale(1.12)',
              },
            },
            '&:hover': {
              bgcolor: 'rgba(249,235,242,0.95)',
            },
            '&:focus-visible': {
              outline: '2px solid var(--md-sys-color-primary)',
              outlineOffset: 2,
              bgcolor: 'rgba(219, 237, 255, 0.8)',
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
            {label}
          </Box>
        </Button>
      ))}
    </Box>
  );
}
