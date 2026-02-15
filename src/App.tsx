import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import CapsuleNav from './components/CapsuleNav';

const Home = lazy(() => import('./pages/Home'));
const Charts = lazy(() => import('./pages/Charts'));
const Settings = lazy(() => import('./pages/Settings'));
const SearchPage = lazy(() => import('./features/search/SearchPage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));

const Loading = () => (
  <Box display="grid" sx={{ minHeight: '100dvh', placeItems: 'center' }}>
    <CircularProgress aria-label="loading" />
  </Box>
);

export default function App() {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        pl: { xs: 0, md: 34 },
        pb: { xs: 12, md: 3 },
        background:
          'radial-gradient(circle at 8% 94%, rgba(255, 191, 214, 0.34) 0, rgba(255,191,214,0) 34%), radial-gradient(circle at 82% 88%, rgba(153, 228, 244, 0.34) 0, rgba(153,228,244,0) 30%), radial-gradient(circle at 86% 8%, rgba(254, 238, 168, 0.28) 0, rgba(254,238,168,0) 26%), #f7f8fa',
      }}
    >
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/player/:id" element={<PlayerPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      <CapsuleNav />
    </Box>
  );
}
