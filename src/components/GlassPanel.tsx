import { Box, type BoxProps } from '@mui/material';
import { designTokens } from '../theme/designTokens';

export default function GlassPanel({ children, sx, ...rest }: BoxProps) {
  return (
    <Box
      sx={{
        borderRadius: designTokens.radius.xl,
        border: designTokens.glass.border,
        background: designTokens.glass.background,
        color: 'inherit',
        backdropFilter: designTokens.glass.backdropFilter,
        boxShadow: designTokens.elevation.overlay,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
