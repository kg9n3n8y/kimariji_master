import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fudalist } from '@/data/fudalist';
import {
  clearAllLearnedAt,
  clearLearnedAt,
  clearLearnedAtMany,
  markLearnedAt,
  markLearnedAtMany,
} from '@/stores/learnedAtStore';
import {
  applyLearnedToLetters,
  countLearned,
  getFudaNosForLetter,
  getLearnedFuda,
  getUnlearnedFuda,
  isLearned,
  loadLearnedState,
  saveLearnedState,
  setAllLearnedState,
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
  toggleLettersLearned: (letters: string[]) => void;
  setAllLearned: (learned: boolean) => void;
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
      if (learned) {
        markLearnedAt(fudaNo);
      } else {
        clearLearnedAt(fudaNo);
      }
    },
    [learnedState, persist],
  );

  const toggleLearned = useCallback(
    (fudaNo: number) => {
      markLearned(fudaNo, !isLearned(learnedState, fudaNo));
    },
    [learnedState, markLearned],
  );

  const toggleLettersLearned = useCallback(
    (letters: string[]) => {
      const allOn = letters.every((letter) => {
        const targets = getFudaNosForLetter(letter);
        return (
          targets.length > 0 &&
          targets.every((no) => isLearned(learnedState, no))
        );
      });
      const nextLearned = !allOn;
      const nextState = applyLearnedToLetters(
        learnedState,
        letters,
        nextLearned,
      );
      persist(nextState);

      const fudaNos = letters.flatMap((letter) => getFudaNosForLetter(letter));
      if (nextLearned) {
        markLearnedAtMany(fudaNos);
      } else {
        clearLearnedAtMany(fudaNos);
      }
    },
    [learnedState, persist],
  );

  const setAllLearned = useCallback(
    (learned: boolean) => {
      const nextState = setAllLearnedState(learnedState, learned);
      persist(nextState);
      if (learned) {
        markLearnedAtMany(fudalist.map((fuda) => fuda.no));
      } else {
        clearAllLearnedAt();
      }
    },
    [learnedState, persist],
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
      toggleLettersLearned,
      setAllLearned,
    }),
    [learnedState, markLearned, setAllLearned, toggleLearned, toggleLettersLearned],
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
