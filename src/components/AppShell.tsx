import { Box, type BoxProps } from '@mui/material';
import { designTokens } from '../theme/designTokens';

type AppShellProps = BoxProps;

export default function AppShell({ children, sx, ...rest }: AppShellProps) {
  return (
    <Box
      sx={{
        px: { xs: designTokens.spacing.lg, md: designTokens.spacing.xl },
        py: { xs: designTokens.spacing.xl, md: 4 },
        display: 'grid',
        gap: designTokens.spacing.lg,
        maxWidth: 1180,
        mx: 'auto',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
