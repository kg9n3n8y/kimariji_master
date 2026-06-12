import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLearned } from '@/stores/LearnedContext';
import {
  clearBeginnerSession,
  createBeginnerSession,
  createPracticeSession,
  getBatchFuda,
  loadBeginnerSession,
  saveBeginnerSession,
  type BeginnerSession,
} from '@/features/beginner/beginnerSession';
import { loadLearnedAt } from '@/stores/learnedAtStore';

type BeginnerSessionContextValue = {
  session: BeginnerSession | null;
  batch: ReturnType<typeof getBatchFuda>;
  startNewSession: () => boolean;
  startPracticeSession: () => boolean;
  restoreSession: () => BeginnerSession | null;
  clearSession: () => void;
  setLearnIndex: (index: number) => void;
  markViewedAll: () => void;
  goNext: () => void;
  goPrev: () => void;
  clearPendingPhaseIntro: () => void;
};

const BeginnerSessionContext = createContext<BeginnerSessionContextValue | null>(
  null,
);

export function BeginnerSessionProvider({ children }: { children: ReactNode }) {
  const { unlearnedFuda, learnedFuda } = useLearned();
  const [session, setSession] = useState<BeginnerSession | null>(null);

  const persist = useCallback((next: BeginnerSession) => {
    setSession(next);
    saveBeginnerSession(next);
  }, []);

  const startNewSession = useCallback(() => {
    const created = createBeginnerSession(unlearnedFuda);
    if (!created) {
      setSession(null);
      clearBeginnerSession();
      return false;
    }
    persist(created);
    return true;
  }, [persist, unlearnedFuda]);

  const startPracticeSession = useCallback(() => {
    const created = createPracticeSession(learnedFuda, loadLearnedAt());
    if (!created) {
      setSession(null);
      clearBeginnerSession();
      return false;
    }
    persist(created);
    return true;
  }, [learnedFuda, persist]);

  const restoreSession = useCallback(() => {
    const stored = loadBeginnerSession();
    if (!stored) {
      return null;
    }
    setSession(stored);
    return stored;
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    clearBeginnerSession();
  }, []);

  const setLearnIndex = useCallback(
    (index: number) => {
      if (!session) {
        return;
      }
      const max = session.batchNos.length - 1;
      const clamped = Math.max(0, Math.min(index, max));
      persist({ ...session, learnIndex: clamped });
    },
    [persist, session],
  );

  const markViewedAll = useCallback(() => {
    if (!session) {
      return;
    }
    persist({ ...session, viewedAll: true });
  }, [persist, session]);

  const goNext = useCallback(() => {
    if (!session) {
      return;
    }
    const isLast = session.learnIndex >= session.batchNos.length - 1;
    if (isLast) {
      persist({ ...session, viewedAll: true });
      return;
    }
    persist({ ...session, learnIndex: session.learnIndex + 1 });
  }, [persist, session]);

  const goPrev = useCallback(() => {
    if (!session) {
      return;
    }
    setLearnIndex(session.learnIndex - 1);
  }, [session, setLearnIndex]);

  const clearPendingPhaseIntro = useCallback(() => {
    if (!session?.pendingPhaseIntro) {
      return;
    }
    const { pendingPhaseIntro: _removed, ...rest } = session;
    persist(rest);
  }, [persist, session]);

  const batch = useMemo(
    () => (session ? getBatchFuda(session) : []),
    [session],
  );

  const value = useMemo(
    () => ({
      session,
      batch,
      startNewSession,
      startPracticeSession,
      restoreSession,
      clearSession,
      setLearnIndex,
      markViewedAll,
      goNext,
      goPrev,
      clearPendingPhaseIntro,
    }),
    [
      batch,
      clearPendingPhaseIntro,
      clearSession,
      goNext,
      goPrev,
      markViewedAll,
      restoreSession,
      session,
      setLearnIndex,
      startNewSession,
      startPracticeSession,
    ],
  );

  return (
    <BeginnerSessionContext.Provider value={value}>
      {children}
    </BeginnerSessionContext.Provider>
  );
}

export function useBeginnerSession(): BeginnerSessionContextValue {
  const ctx = useContext(BeginnerSessionContext);
  if (!ctx) {
    throw new Error(
      'useBeginnerSession must be used within BeginnerSessionProvider',
    );
  }
  return ctx;
}
