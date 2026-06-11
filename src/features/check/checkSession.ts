export type CheckCompleteState = {
  timeMs: number;
  cards: number;
};

const SESSION_KEY = 'kimariji:checkComplete';

export function saveCheckCompleteResult(state: CheckCompleteState): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

export function peekCheckCompleteResult(): CheckCompleteState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CheckCompleteState;
    if (
      typeof parsed.timeMs !== 'number' ||
      typeof parsed.cards !== 'number'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearCheckCompleteResult(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
