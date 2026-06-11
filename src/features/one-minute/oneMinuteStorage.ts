import { STORAGE_KEYS } from '@/stores/storageKeys';
import type {
  OneMinuteHistoryEntry,
  OneMinuteResultState,
} from '@/features/one-minute/types';

const HISTORY_LIMIT = 5;
const SESSION_KEY = 'kimariji:oneMinuteResult';

/** 1分間確認モードの解放条件（覚えた札数） */
export const ONE_MINUTE_MIN_LEARNED = 100;
export const ONE_MINUTE_DURATION_SEC = 60;

export function loadOneMinuteBest(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.oneMinuteBest);
    if (!raw) {
      return 0;
    }
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveOneMinuteBest(score: number): void {
  localStorage.setItem(STORAGE_KEYS.oneMinuteBest, String(score));
}

export function loadOneMinuteHistory(): OneMinuteHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.oneMinuteHistory);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (entry): entry is OneMinuteHistoryEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as OneMinuteHistoryEntry).score === 'number' &&
        typeof (entry as OneMinuteHistoryEntry).playedAt === 'string',
    );
  } catch {
    return [];
  }
}

function saveOneMinuteHistory(history: OneMinuteHistoryEntry[]): void {
  localStorage.setItem(
    STORAGE_KEYS.oneMinuteHistory,
    JSON.stringify(history.slice(0, HISTORY_LIMIT)),
  );
}

export function recordOneMinuteScore(score: number): OneMinuteResultState {
  const previousBest = loadOneMinuteBest();
  const isNewBest = score > previousBest;

  if (isNewBest) {
    saveOneMinuteBest(score);
  }

  const entry: OneMinuteHistoryEntry = {
    score,
    playedAt: new Date().toISOString(),
  };
  const history = [entry, ...loadOneMinuteHistory()].slice(0, HISTORY_LIMIT);
  saveOneMinuteHistory(history);

  return { score, previousBest, isNewBest };
}

export function saveOneMinuteResult(state: OneMinuteResultState): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

export function peekOneMinuteResult(): OneMinuteResultState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as OneMinuteResultState;
    if (
      typeof parsed.score !== 'number' ||
      typeof parsed.previousBest !== 'number' ||
      typeof parsed.isNewBest !== 'boolean'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearOneMinuteResult(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
