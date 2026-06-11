import { Route, Routes } from 'react-router-dom';
import { BeginnerSessionProvider } from '@/features/beginner/BeginnerSessionContext';
import { BeginnerEntryPage } from '@/features/beginner/BeginnerEntryPage';
import { BeginnerLearnPage } from '@/features/beginner/BeginnerLearnPage';
import { BeginnerQuizPage } from '@/features/beginner/BeginnerQuizPage';
import { BeginnerResultPage } from '@/features/beginner/BeginnerResultPage';

export function BeginnerRoutes() {
  return (
    <BeginnerSessionProvider>
      <Routes>
        <Route index element={<BeginnerEntryPage />} />
        <Route path="learn" element={<BeginnerLearnPage />} />
        <Route path="quiz" element={<BeginnerQuizPage />} />
        <Route path="result" element={<BeginnerResultPage />} />
      </Routes>
    </BeginnerSessionProvider>
  );
}
