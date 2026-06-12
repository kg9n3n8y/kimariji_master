import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ASSET_PRECACHE_VERSION,
  isAssetPrecacheDone,
  markAssetPrecacheDone,
  prefetchImageAssets,
} from '@/pwa/precacheAssets';
import { STORAGE_KEYS } from '@/stores/storageKeys';

vi.mock('@/pwa/buildImageAssetUrls', () => ({
  buildImageAssetUrls: () => [
    '/kimariji_master/torifuda/tori_1.png',
    '/kimariji_master/torifuda/tori_2.png',
    '/kimariji_master/torifuda/tori_3.png',
  ],
}));

function createLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe('precacheAssets', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('marks precache done with current version', () => {
    markAssetPrecacheDone();
    expect(localStorage.getItem(STORAGE_KEYS.assetPrecacheVersion)).toBe(
      ASSET_PRECACHE_VERSION,
    );
    expect(isAssetPrecacheDone()).toBe(true);
  });

  it('finishes prefetch even when some asset fetches fail or hang', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        if (url.includes('tori_2.png')) {
          return new Promise<Response>((_, reject) => {
            init?.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          });
        }
        if (url.includes('tori_3.png')) {
          return Promise.resolve(new Response(null, { status: 404 }));
        }
        return Promise.resolve(new Response(null, { status: 200 }));
      }),
    );

    const progress: Array<[number, number]> = [];
    await prefetchImageAssets((done, total) => {
      progress.push([done, total]);
    });

    expect(progress.at(-1)).toEqual([3, 3]);
  }, 35_000);
});
