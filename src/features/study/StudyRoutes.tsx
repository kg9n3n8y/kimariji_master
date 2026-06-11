import { Route, Routes } from 'react-router-dom';
import { StudyDetailPage } from '@/features/study/StudyDetailPage';
import { StudyListPage } from '@/features/study/StudyListPage';

export function StudyRoutes() {
  return (
    <Routes>
      <Route index element={<StudyListPage />} />
      <Route path=":fudaNo" element={<StudyDetailPage />} />
    </Routes>
  );
}
