import { Box, Button, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useLocale } from '../i18n/LocaleProvider';

export default function CapsuleNav() {
  const { t } = useLocale();

  const items = [
    [t('navHome'), '/'],
    [t('navSearch'), '/search'],
    [t('navCharts'), '/charts'],
    [t('navSettings'), '/settings'],
  ] as const;

  return (
    <Box
      component="nav"
      aria-label="primary navigation"
      sx={{
        position: 'fixed',
        zIndex: 20,
        display: 'flex',
        gap: 0.75,
        p: 1,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
        bgcolor: 'rgba(20,23,30,0.72)',
        backdropFilter: 'blur(14px)',
        left: { xs: '50%', md: 16 },
        bottom: { xs: 14, md: 'auto' },
        top: { xs: 'auto', md: 16 },
        transform: { xs: 'translateX(-50%)', md: 'none' },
        flexDirection: { xs: 'row', md: 'column' },
        minWidth: { xs: 'auto', md: 228 },
      }}
    >
      <Typography variant="overline" sx={{ px: 1, color: 'rgba(255,255,255,0.78)', display: { xs: 'none', md: 'block' } }}>
        音愈 Yinyu
      </Typography>
      {items.map(([label, to]) => (
        <Button
          key={to}
          component={NavLink}
          to={to}
          sx={{
            color: 'white',
            justifyContent: { xs: 'center', md: 'flex-start' },
            borderRadius: 2,
            px: { xs: 1.1, md: 1.5 },
            minWidth: { xs: 0, md: 'auto' },
            '&.active': {
              bgcolor: 'rgba(255,255,255,0.14)',
            },
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
            },
            '&:focus-visible': {
              outline: '2px solid var(--md-sys-color-primary)',
              outlineOffset: 2,
            },
          }}
        >
          {label}
        </Button>
      ))}
    </Box>
  );
}
