import { Box, Typography } from '@mui/material';
import { useLocale } from '../i18n/LocaleProvider';

export default function Charts() {
  const { t } = useLocale();

  return (
    <Box p={2}>
      <Typography variant="h5">{t('chartsTitle')}</Typography>
      <Typography>{t('chartsTip')}</Typography>
    </Box>
  );
}
