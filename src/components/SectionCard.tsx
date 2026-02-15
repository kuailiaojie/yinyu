import { Card, type CardProps } from '@mui/material';
import { designTokens } from '../theme/designTokens';

export default function SectionCard({ children, sx, ...rest }: CardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: designTokens.radius.xl,
        boxShadow: designTokens.elevation.surface,
        borderColor: 'rgba(255, 255, 255, 0.74)',
        bgcolor: 'rgba(255,255,255,0.68)',
        backdropFilter: designTokens.glass.backdropFilter,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Card>
  );
}
