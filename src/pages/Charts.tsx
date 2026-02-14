import { Box, Typography } from '@mui/material';

export default function Charts() {
  return (
    <Box p={2}>
      <Typography variant="h5">Charts</Typography>
      <Typography>Top list configuration comes from /api/v1/methods/:platform/toplists.</Typography>
    </Box>
  );
}
