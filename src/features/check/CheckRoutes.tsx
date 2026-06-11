import { Navigate, Route, Routes } from 'react-router-dom';
import { CheckPlayPage } from '@/features/check/CheckPlayPage';
import { CheckResultPage } from '@/features/check/CheckResultPage';

export function CheckRoutes() {
  return (
    <Routes>
      <Route index element={<CheckPlayPage />} />
      <Route path="result" element={<CheckResultPage />} />
      <Route path="play" element={<Navigate to="/check" replace />} />
    </Routes>
  );
}
