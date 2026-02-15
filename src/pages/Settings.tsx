import { MenuItem, Stack, TextField } from '@mui/material';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { useLocale } from '../i18n/LocaleProvider';
import { useDynamicTheme } from '../theme/DynamicTheme';

export default function Settings() {
  const { seed, setSeed } = useDynamicTheme();
  const { locale, setLocale, t } = useLocale();

  return (
    <AppShell sx={{ maxWidth: 760 }}>
      <PageHeader title={t('settingsTitle')} subtitle="统一语言、主题与界面风格参数。" />
      <SectionCard sx={{ p: 2.5 }}>
        <Stack spacing={2} maxWidth={420}>
          <TextField select label={t('language')} value={locale} onChange={(e) => setLocale(e.target.value as 'zh-CN' | 'en-US')}>
            <MenuItem value="zh-CN">中文（简体）</MenuItem>
            <MenuItem value="en-US">English</MenuItem>
          </TextField>

          <TextField label={t('themeSeed')} value={seed} onChange={(e) => setSeed(e.target.value)} />
        </Stack>
      </SectionCard>
    </AppShell>
  );
}
