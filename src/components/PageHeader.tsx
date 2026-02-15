import { Box, Stack, Typography, type StackProps } from '@mui/material';
import type { ReactNode } from 'react';
import { designTokens } from '../theme/designTokens';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
} & StackProps;

export default function PageHeader({ title, subtitle, action, sx, ...rest }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      gap={designTokens.spacing.md}
      sx={sx}
      {...rest}
    >
      <Box>
        <Typography variant="h4" fontWeight={800}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body1" color="text.secondary" sx={{ mt: designTokens.spacing.xs }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box>{action}</Box> : null}
    </Stack>
  );
}
