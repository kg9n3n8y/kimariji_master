import { fudalist } from '@/data/fudalist';
import { STORAGE_KEYS } from '@/stores/storageKeys';

function defaultLearnedState(): Record<string, boolean> {
  const defaults: Record<string, boolean> = {};
  for (const fuda of fudalist) {
    defaults[String(fuda.no)] = false;
  }
  return defaults;
}

function letterToFudaNos(letter: string): string[] {
  return fudalist
    .filter((f) => (f.kimariji || '').charAt(0) === letter)
    .map((f) => String(f.no));
}

export function loadLearnedState(): Record<string, boolean> {
  const defaults = defaultLearnedState();

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.learned);
    if (!raw) {
      return defaults;
    }

    const stored = JSON.parse(raw) as Record<string, unknown>;
    if (!stored || typeof stored !== 'object') {
      return defaults;
    }

    const keys = Object.keys(stored);
    const hasNumericKeys = keys.some((key) => key in defaults);

    if (hasNumericKeys) {
      for (const key of keys) {
        if (key in defaults && typeof stored[key] === 'boolean') {
          defaults[key] = stored[key];
        }
      }
      return defaults;
    }

    // v1 文字キー形式からのマイグレーション
    for (const letter of keys) {
      if (typeof stored[letter] !== 'boolean') {
        continue;
      }
      for (const fudaNo of letterToFudaNos(letter)) {
        defaults[fudaNo] = stored[letter] as boolean;
      }
    }

    saveLearnedState(defaults);
    return defaults;
  } catch {
    return defaults;
  }
}

export function saveLearnedState(state: Record<string, boolean>): void {
  localStorage.setItem(STORAGE_KEYS.learned, JSON.stringify(state));
}

export function isLearned(
  state: Record<string, boolean>,
  fudaNo: number,
): boolean {
  return state[String(fudaNo)] === true;
}

export function setLearned(
  state: Record<string, boolean>,
  fudaNo: number,
  learned: boolean,
): Record<string, boolean> {
  return { ...state, [String(fudaNo)]: learned };
}

export function countLearned(state: Record<string, boolean>): number {
  return fudalist.filter((f) => isLearned(state, f.no)).length;
}

export function getLearnedFuda(state: Record<string, boolean>) {
  return fudalist.filter((f) => isLearned(state, f.no));
}

export function getUnlearnedFuda(state: Record<string, boolean>) {
  return fudalist.filter((f) => !isLearned(state, f.no));
}
