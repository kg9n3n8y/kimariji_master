import { buildImageAssetUrls } from '@/pwa/buildImageAssetUrls';
import { STORAGE_KEYS } from '@/stores/storageKeys';

/** 画像セットが変わったらインクリメントして再プリフェッチ */
export const ASSET_PRECACHE_VERSION = '1';

const PREFETCH_CONCURRENCY = 8;

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

async function fetchAsset(url: string): Promise<void> {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`asset prefetch failed: ${url} (${response.status})`);
  }
}

export async function prefetchImageAssets(
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const urls = buildImageAssetUrls();
  const total = urls.length;
  let done = 0;

  for (let index = 0; index < urls.length; index += PREFETCH_CONCURRENCY) {
    const batch = urls.slice(index, index + PREFETCH_CONCURRENCY);
    await Promise.all(
      batch.map(async (url) => {
        await fetchAsset(url);
        done += 1;
        onProgress?.(done, total);
      }),
    );
  }
}

export async function waitForServiceWorkerReady(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  await navigator.serviceWorker.ready;
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

  await waitForServiceWorkerReady();
  await prefetchImageAssets(onProgress);
  markAssetPrecacheDone();
}
