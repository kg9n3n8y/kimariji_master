import { fudalist } from '@/data/fudalist';
import type { Fuda } from '@/types/fuda';
import type { BeginnerTestHomeState } from '@/features/beginner/types';
import {
  pickNewLearnBatch,
  pickPracticeTestBatch,
} from '@/lib/beginnerBatch';

const SESSION_KEY = 'kimariji:beginnerSession';
const HOME_RESULT_KEY = 'kimariji:beginnerTestHome';

export type BeginnerSessionMode = 'learn' | 'practice';

export type BeginnerSession = {
  batchNos: number[];
  learnIndex: number;
  viewedAll: boolean;
  mode: BeginnerSessionMode;
};

function getFudaByNo(no: number): Fuda | undefined {
  return fudalist.find((f) => f.no === no);
}

export function getBatchFuda(session: BeginnerSession): Fuda[] {
  return session.batchNos
    .map((no) => getFudaByNo(no))
    .filter((f): f is Fuda => Boolean(f));
}

export function createBeginnerSession(unlearned: readonly Fuda[]): BeginnerSession | null {
  if (unlearned.length === 0) {
    return null;
  }
  const batch = pickNewLearnBatch(unlearned);
  return {
    batchNos: batch.map((f) => f.no),
    learnIndex: 0,
    viewedAll: false,
    mode: 'learn',
  };
}

export function createPracticeSession(
  learned: readonly Fuda[],
  learnedAt: Readonly<Record<string, number>>,
): BeginnerSession | null {
  if (learned.length === 0) {
    return null;
  }
  const batch = pickPracticeTestBatch(learned, learnedAt);
  if (batch.length === 0) {
    return null;
  }
  return {
    batchNos: batch.map((f) => f.no),
    learnIndex: 0,
    viewedAll: true,
    mode: 'practice',
  };
}

export function loadBeginnerSession(): BeginnerSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as BeginnerSession;
    if (!Array.isArray(parsed.batchNos) || parsed.batchNos.length === 0) {
      return null;
    }
    return {
      ...parsed,
      mode: parsed.mode === 'practice' ? 'practice' : 'learn',
    };
  } catch {
    return null;
  }
}

export function saveBeginnerSession(session: BeginnerSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearBeginnerSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function saveTestHomeResult(result: BeginnerTestHomeState): void {
  sessionStorage.setItem(HOME_RESULT_KEY, JSON.stringify(result));
}

export function peekTestHomeResult(): BeginnerTestHomeState | null {
  try {
    const raw = sessionStorage.getItem(HOME_RESULT_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as BeginnerTestHomeState;
  } catch {
    return null;
  }
}

export function clearTestHomeResult(): void {
  sessionStorage.removeItem(HOME_RESULT_KEY);
}
