import { buildImageAssetUrls } from '@/pwa/buildImageAssetUrls';
import { STORAGE_KEYS } from '@/stores/storageKeys';

/** 画像セットが変わったらインクリメントして再プリフェッチ */
export const ASSET_PRECACHE_VERSION = '2';

const PREFETCH_CONCURRENCY = 4;
const FETCH_TIMEOUT_MS = 12_000;
const SW_READY_TIMEOUT_MS = 15_000;
const OVERALL_PREFETCH_TIMEOUT_MS = 8 * 60_000;

export function isAssetPrecacheDone(): boolean {
  try {
    return (
      localStorage.getItem(STORAGE_KEYS.assetPrecacheVersion) ===
      ASSET_PRECACHE_VERSION
    );
  } catch {
    return false;
  }
}

export function markAssetPrecacheDone(): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.assetPrecacheVersion,
      ASSET_PRECACHE_VERSION,
    );
  } catch {
    // localStorage 不可時は毎回プリフェッチ
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchAssetOnce(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchAsset(url: string): Promise<boolean> {
  if (await fetchAssetOnce(url)) {
    return true;
  }
  return fetchAssetOnce(url);
}

export async function prefetchImageAssets(
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const urls = buildImageAssetUrls();
  const total = urls.length;
  let done = 0;
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (nextIndex < urls.length) {
      const index = nextIndex;
      nextIndex += 1;
      await fetchAsset(urls[index]!);
      done += 1;
      onProgress?.(done, total);
    }
  };

  const workerCount = Math.min(PREFETCH_CONCURRENCY, urls.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
}

export async function waitForServiceWorkerReady(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  await Promise.race([
    navigator.serviceWorker.ready.then(() => undefined),
    delay(SW_READY_TIMEOUT_MS),
  ]);
}

export async function ensureOfflineAssetsCached(
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  if (import.meta.env.DEV) {
    return;
  }

  if (isAssetPrecacheDone()) {
    return;
  }

  try {
    await Promise.race([
      (async () => {
        await waitForServiceWorkerReady();
        await prefetchImageAssets(onProgress);
      })(),
      delay(OVERALL_PREFETCH_TIMEOUT_MS),
    ]);
  } finally {
    markAssetPrecacheDone();
  }
}
