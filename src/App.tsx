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
    <Box sx={{ minHeight: '100dvh', pl: { xs: 0, md: 32 }, pb: { xs: 12, md: 2 } }}>
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
