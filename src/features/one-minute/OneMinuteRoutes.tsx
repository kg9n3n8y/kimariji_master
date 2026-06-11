import { Navigate, Route, Routes } from 'react-router-dom';
import { OneMinutePlayPage } from '@/features/one-minute/OneMinutePlayPage';
import { OneMinuteResultPage } from '@/features/one-minute/OneMinuteResultPage';

export function OneMinuteRoutes() {
  return (
    <Routes>
      <Route index element={<OneMinutePlayPage />} />
      <Route path="play" element={<Navigate to="/one-minute" replace />} />
      <Route path="result" element={<OneMinuteResultPage />} />
    </Routes>
  );
}
