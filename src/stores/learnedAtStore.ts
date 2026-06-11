import { STORAGE_KEYS } from '@/stores/storageKeys';

export function loadLearnedAt(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.learnedAt);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    const result: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function saveLearnedAt(state: Record<string, number>): void {
  localStorage.setItem(STORAGE_KEYS.learnedAt, JSON.stringify(state));
}

export function getLearnedAt(fudaNo: number): number | null {
  const value = loadLearnedAt()[String(fudaNo)];
  return value ?? null;
}

export function markLearnedAt(fudaNo: number, at: number = Date.now()): void {
  const state = loadLearnedAt();
  state[String(fudaNo)] = at;
  saveLearnedAt(state);
}

export function clearLearnedAt(fudaNo: number): void {
  const state = loadLearnedAt();
  delete state[String(fudaNo)];
  saveLearnedAt(state);
}

export function markLearnedAtMany(
  fudaNos: number[],
  at: number = Date.now(),
): void {
  if (fudaNos.length === 0) {
    return;
  }
  const state = loadLearnedAt();
  for (const fudaNo of fudaNos) {
    state[String(fudaNo)] = at;
  }
  saveLearnedAt(state);
}

export function clearLearnedAtMany(fudaNos: number[]): void {
  if (fudaNos.length === 0) {
    return;
  }
  const state = loadLearnedAt();
  for (const fudaNo of fudaNos) {
    delete state[String(fudaNo)];
  }
  saveLearnedAt(state);
}

export function clearAllLearnedAt(): void {
  saveLearnedAt({});
}
