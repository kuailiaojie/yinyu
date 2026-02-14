import { Box, TextField, Typography } from '@mui/material';
import { useDynamicTheme } from '../theme/DynamicTheme';

export default function Settings() {
  const { seed, setSeed } = useDynamicTheme();
  return (
    <Box p={2}>
      <Typography variant="h5">Settings</Typography>
      <TextField label="Theme seed hex" value={seed} onChange={(e) => setSeed(e.target.value)} />
    </Box>
  );
}
