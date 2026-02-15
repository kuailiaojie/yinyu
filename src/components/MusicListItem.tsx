import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import { Avatar, Box, Chip, IconButton, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { designTokens } from '../theme/designTokens';

type MusicListItemProps = {
  title: string;
  subtitle?: string;
  avatarText?: string;
  chips?: string[];
  meta?: string;
  trailingAction?: ReactNode;
  onClick?: () => void;
};

export default function MusicListItem({ title, subtitle, avatarText, chips, meta, trailingAction, onClick }: MusicListItemProps) {
  const content = (
    <>
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            boxShadow: '0 6px 12px rgba(91, 106, 196, 0.26)',
          }}
        >
          {avatarText ?? title.slice(0, 1)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={subtitle}
        primaryTypographyProps={{ fontWeight: 700 }}
        secondaryTypographyProps={{ color: 'text.secondary' }}
      />
      <Box display="grid" justifyItems="end" gap={designTokens.spacing.xs}>
        {meta ? (
          <Typography variant="caption" color="text.secondary">
            {meta}
          </Typography>
        ) : null}
        <Box display="flex" gap={designTokens.spacing.xs} flexWrap="wrap" justifyContent="flex-end">
          {chips?.map((chip) => (
            <Chip key={`${title}-${chip}`} size="small" label={chip} />
          ))}
          {trailingAction ?? (
            <IconButton
              size="small"
              aria-label="play"
              sx={{ bgcolor: 'rgba(0,0,0,0.08)', '&:hover': { bgcolor: 'rgba(0,0,0,0.14)' } }}
            >
              <PlayArrowRounded fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </>
  );

  if (onClick) {
    return (
      <ListItem disablePadding>
        <ListItemButton
          sx={{ borderRadius: designTokens.radius.pill, px: 1.2, py: 0.6, transition: 'all 220ms', '&:hover': { transform: 'translateY(-1px)' } }}
          onClick={onClick}
        >
          {content}
        </ListItemButton>
      </ListItem>
    );
  }

  return <ListItem sx={{ px: designTokens.spacing.sm, borderRadius: designTokens.radius.pill }}>{content}</ListItem>;
}
