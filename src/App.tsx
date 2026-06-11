import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { UpdatePrompt } from '@/components/UpdatePrompt';
import { LearnedProvider } from '@/stores/LearnedContext';
import { HomePage } from '@/features/home/HomePage';
import { BeginnerRoutes } from '@/features/beginner/BeginnerRoutes';
import { CheckRoutes } from '@/features/check/CheckRoutes';
import { OneMinuteRoutes } from '@/features/one-minute/OneMinuteRoutes';
import { StudyRoutes } from '@/features/study/StudyRoutes';

export default function App() {
  return (
    <LearnedProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/beginner/*" element={<BeginnerRoutes />} />
          <Route path="/one-minute/*" element={<OneMinuteRoutes />} />
          <Route path="/check/*" element={<CheckRoutes />} />
          <Route path="/study/*" element={<StudyRoutes />} />
        </Routes>
        <PwaInstallPrompt />
        <UpdatePrompt />
      </AppShell>
    </LearnedProvider>
  );
}
