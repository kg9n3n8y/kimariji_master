import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { UpdatePrompt } from '@/components/UpdatePrompt';
import { LearnedProvider } from '@/stores/LearnedContext';
import { HomePage } from '@/features/home/HomePage';
import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function App() {
  return (
    <LearnedProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/beginner"
            element={
              <PlaceholderPage
                title="初心者モード"
                description="5首ずつ学習して4択テスト（実装予定）"
              />
            }
          />
          <Route
            path="/one-minute"
            element={
              <PlaceholderPage
                title="1分間確認モード"
                description="60秒チャレンジ（実装予定）"
              />
            }
          />
          <Route
            path="/check"
            element={
              <PlaceholderPage
                title="決まり字チェック"
                description="v1 継承モード（実装予定）"
              />
            }
          />
          <Route
            path="/study"
            element={
              <PlaceholderPage
                title="一覧で学ぶ"
                description="分類別学習（実装予定）"
              />
            }
          />
        </Routes>
        <UpdatePrompt />
      </AppShell>
    </LearnedProvider>
  );
}
