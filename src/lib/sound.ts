import { STORAGE_KEYS } from '@/stores/storageKeys';

type ToneKind = 'correct' | 'incorrect';

let audioContext: AudioContext | null = null;
let unlocked = false;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!audioContext) {
    const Ctx = window.AudioContext
      ?? (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) {
      return null;
    }
    audioContext = new Ctx();
  }
  return audioContext;
}

export function isSoundEnabled(): boolean {
  const stored = localStorage.getItem(STORAGE_KEYS.soundEnabled);
  if (stored === null) {
    return true;
  }
  return stored === 'true';
}

export function unlockAudio(): void {
  const ctx = getContext();
  if (!ctx || unlocked) {
    return;
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  unlocked = true;
}

function playTone(kind: ToneKind): void {
  if (!isSoundEnabled()) {
    return;
  }

  const ctx = getContext();
  if (!ctx) {
    return;
  }

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  if (kind === 'correct') {
    oscillator.frequency.setValueAtTime(660, now);
    oscillator.frequency.setValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    oscillator.start(now);
    oscillator.stop(now + 0.25);
  } else {
    oscillator.frequency.setValueAtTime(220, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    oscillator.start(now);
    oscillator.stop(now + 0.35);
  }

  oscillator.type = 'sine';
}

export function playCorrectSound(): void {
  playTone('correct');
}

export function playIncorrectSound(): void {
  playTone('incorrect');
}
