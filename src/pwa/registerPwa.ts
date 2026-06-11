import { registerSW } from 'virtual:pwa-register';

let updateSw: ((reloadPage?: boolean) => Promise<void>) | undefined;

export function registerPwa(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  updateSw = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new Event('pwa-need-refresh'));
    },
    onRegistered(registration) {
      if (!registration) {
        return;
      }

      const check = () => registration.update().catch(() => undefined);
      window.addEventListener('focus', check);
      setInterval(check, 60 * 60 * 1000);
    },
  });
}

export async function applyPwaUpdate(): Promise<void> {
  if (updateSw) {
    await updateSw(true);
  }
}
