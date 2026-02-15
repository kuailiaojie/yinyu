import { List } from '@mui/material';
import BarChartRounded from '@mui/icons-material/BarChartRounded';
import AppShell from '../components/AppShell';
import EmptyState from '../components/EmptyState';
import MusicListItem from '../components/MusicListItem';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { useLocale } from '../i18n/LocaleProvider';

const chartTracks = [
  { title: 'APT.', artist: 'ROSÉ · Bruno Mars', change: '+4' },
  { title: '七里香', artist: '周杰伦', change: '+2' },
  { title: 'Blinding Lights', artist: 'The Weeknd', change: '-1' },
];

export default function Charts() {
  const { t } = useLocale();

  return (
    <AppShell>
      <PageHeader title={t('chartsTitle')} subtitle={t('chartsTip')} />
      <SectionCard>
        <List sx={{ px: 1.5, py: 1.5 }}>
          {chartTracks.map((item) => (
            <MusicListItem
              key={item.title}
              title={item.title}
              subtitle={item.artist}
              chips={[`排名 ${item.change}`]}
              avatarText={item.title.slice(0, 1)}
            />
          ))}
        </List>
      </SectionCard>
      <SectionCard>
        <EmptyState title="更多榜单即将上线" description="后续将支持平台榜单拉取与分区筛选。" icon={<BarChartRounded color="disabled" />} />
      </SectionCard>
    </AppShell>
  );
}
