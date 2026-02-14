export type Locale = 'zh-CN' | 'en-US';

export const messages = {
  'zh-CN': {
    navHome: '首页 Home',
    navSearch: '搜索 Search',
    navCharts: '榜单 Charts',
    navSettings: '设置 Settings',
    appTitle: '音愈 Yinyu',
    appSubtitle: '跨平台音乐体验，支持 Web 与桌面端。',
    recentHistory: '最近听过',
    recommendedPlaylists: '推荐歌单',
    continueListening: '继续收听',
    chartsTitle: '热门榜单',
    chartsTip: '榜单配置来自 /api/v1/methods/:platform/toplists。',
    settingsTitle: '设置',
    language: '语言',
    themeSeed: '主题种子色',
    searchTitle: '聚合搜索',
    searchLabel: '搜索歌曲',
  },
  'en-US': {
    navHome: 'Home 首页',
    navSearch: 'Search 搜索',
    navCharts: 'Charts 榜单',
    navSettings: 'Settings 设置',
    appTitle: 'Yinyu 音愈',
    appSubtitle: 'Cross-platform music experience for web and desktop.',
    recentHistory: 'Recently Played',
    recommendedPlaylists: 'Recommended Playlists',
    continueListening: 'Continue Listening',
    chartsTitle: 'Charts',
    chartsTip: 'Top list configuration comes from /api/v1/methods/:platform/toplists.',
    settingsTitle: 'Settings',
    language: 'Language',
    themeSeed: 'Theme seed hex',
    searchTitle: 'Aggregated Search',
    searchLabel: 'Search music',
  },
} as const;

export type MessageKey = keyof typeof messages['zh-CN'];
