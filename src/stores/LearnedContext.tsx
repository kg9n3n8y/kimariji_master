import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  countLearned,
  getLearnedFuda,
  getUnlearnedFuda,
  isLearned,
  loadLearnedState,
  saveLearnedState,
  setLearned,
} from '@/stores/learnedStore';

type LearnedContextValue = {
  learnedState: Record<string, boolean>;
  learnedCount: number;
  learnedFuda: ReturnType<typeof getLearnedFuda>;
  unlearnedFuda: ReturnType<typeof getUnlearnedFuda>;
  isFudaLearned: (fudaNo: number) => boolean;
  toggleLearned: (fudaNo: number) => void;
  markLearned: (fudaNo: number, learned: boolean) => void;
};

const LearnedContext = createContext<LearnedContextValue | null>(null);

export function LearnedProvider({ children }: { children: ReactNode }) {
  const [learnedState, setLearnedState] = useState(loadLearnedState);

  const persist = useCallback((next: Record<string, boolean>) => {
    setLearnedState(next);
    saveLearnedState(next);
  }, []);

  const markLearned = useCallback(
    (fudaNo: number, learned: boolean) => {
      persist(setLearned(learnedState, fudaNo, learned));
    },
    [learnedState, persist],
  );

  const toggleLearned = useCallback(
    (fudaNo: number) => {
      markLearned(fudaNo, !isLearned(learnedState, fudaNo));
    },
    [learnedState, markLearned],
  );

  const value = useMemo<LearnedContextValue>(
    () => ({
      learnedState,
      learnedCount: countLearned(learnedState),
      learnedFuda: getLearnedFuda(learnedState),
      unlearnedFuda: getUnlearnedFuda(learnedState),
      isFudaLearned: (fudaNo) => isLearned(learnedState, fudaNo),
      toggleLearned,
      markLearned,
    }),
    [learnedState, markLearned, toggleLearned],
  );

  return (
    <LearnedContext.Provider value={value}>{children}</LearnedContext.Provider>
  );
}

export function useLearned(): LearnedContextValue {
  const ctx = useContext(LearnedContext);
  if (!ctx) {
    throw new Error('useLearned must be used within LearnedProvider');
  }
  return ctx;
}
