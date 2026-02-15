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
        gap: 1,
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        backdropFilter: 'blur(16px)',
        bgcolor: 'rgba(255,255,255,0.72)',
        borderRadius: { xs: 999, md: 3 },
        left: { xs: '50%', md: 20 },
        bottom: { xs: 12, md: 'auto' },
        top: { xs: 'auto', md: 20 },
        transform: { xs: 'translateX(-50%)', md: 'none' },
        flexDirection: { xs: 'row', md: 'column' },
        minWidth: { xs: 'auto', md: 240 },
      }}
    >
      <Typography variant="overline" sx={{ px: 1.5, color: 'text.secondary', display: { xs: 'none', md: 'block' } }}>
        Yinyu Music
      </Typography>
      {items.map(([label, to]) => (
        <Button
          key={to}
          component={NavLink}
          to={to}
          sx={{
            justifyContent: { xs: 'center', md: 'flex-start' },
            px: { xs: 1.2, md: 1.6 },
            borderRadius: 2,
            textTransform: 'none',
            '&.active': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark' },
            },
            '&:focus-visible': { outline: '2px solid var(--md-sys-color-primary)' },
          }}
        >
          {label}
        </Button>
      ))}
    </Box>
  );
}
