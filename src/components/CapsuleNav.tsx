import { Box, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

const items = [
  ['Home', '/'],
  ['Search', '/search'],
  ['Charts', '/charts'],
  ['Settings', '/settings']
] as const;

export default function CapsuleNav() {
  return (
    <Box
      component="nav"
      aria-label="primary navigation"
      sx={{
        position: 'fixed',
        left: '50%',
        bottom: 16,
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 1,
        p: 1,
        borderRadius: 999,
        backdropFilter: 'blur(20px)',
        bgcolor: 'rgba(20,20,20,0.35)'
      }}
    >
      {items.map(([label, to]) => (
        <Button
          key={to}
          component={NavLink}
          to={to}
          sx={{ '&:focus-visible': { outline: '2px solid var(--md-sys-color-primary)' } }}
        >
          {label}
        </Button>
      ))}
    </Box>
  );
}
