import type { CheckHistoryEntry } from '@/types/fuda';
import { STORAGE_KEYS } from '@/stores/storageKeys';

const HISTORY_LIMIT = 3;

export function loadCheckHistory(): CheckHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.checkHistory);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(
        (entry): entry is CheckHistoryEntry =>
          typeof entry === 'object' &&
          entry !== null &&
          Number.isFinite((entry as CheckHistoryEntry).timeMs) &&
          Number.isFinite((entry as CheckHistoryEntry).cards),
      )
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function saveCheckHistory(history: CheckHistoryEntry[]): void {
  localStorage.setItem(
    STORAGE_KEYS.checkHistory,
    JSON.stringify(history.slice(0, HISTORY_LIMIT)),
  );
}

export function addCheckHistoryEntry(timeMs: number, cards: number): void {
  const entry: CheckHistoryEntry = {
    timeMs,
    cards,
    recordedAt: Date.now(),
  };
  const history = [entry, ...loadCheckHistory()].slice(0, HISTORY_LIMIT);
  saveCheckHistory(history);
}
