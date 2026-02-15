import { Box, Typography, type BoxProps } from '@mui/material';
import type { ReactNode } from 'react';
import InboxRounded from '@mui/icons-material/InboxRounded';
import { designTokens } from '../theme/designTokens';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
} & BoxProps;

export default function EmptyState({ title, description, icon, sx, ...rest }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        py: designTokens.spacing.xxl,
        px: designTokens.spacing.xl,
        color: 'text.secondary',
        gap: designTokens.spacing.sm,
        ...sx,
      }}
      {...rest}
    >
      <Box aria-hidden>{icon ?? <InboxRounded color="disabled" />}</Box>
      <Typography variant="h6">{title}</Typography>
      {description ? <Typography variant="body2">{description}</Typography> : null}
    </Box>
  );
}
