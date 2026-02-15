import { Box, MenuItem, TextField, Typography } from '@mui/material';
import { useDynamicTheme } from '../theme/DynamicTheme';
import { useLocale } from '../i18n/LocaleProvider';

export default function Settings() {
  const { seed, setSeed } = useDynamicTheme();
  const { locale, setLocale, t } = useLocale();

  return (
    <Box p={2} display="grid" gap={2} maxWidth={420}>
      <Typography variant="h5">{t('settingsTitle')}</Typography>

      <TextField select label={t('language')} value={locale} onChange={(e) => setLocale(e.target.value as 'zh-CN' | 'en-US')}>
        <MenuItem value="zh-CN">中文（简体）</MenuItem>
        <MenuItem value="en-US">English</MenuItem>
      </TextField>

      <TextField label={t('themeSeed')} value={seed} onChange={(e) => setSeed(e.target.value)} />
    </Box>
  );
}
