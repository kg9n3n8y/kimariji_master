import { describe, expect, it } from 'vitest';
import { buildImageAssetUrls } from '@/pwa/buildImageAssetUrls';

describe('buildImageAssetUrls', () => {
  it('includes torifuda, goro slides, thumbnails, and icons', () => {
    const urls = buildImageAssetUrls();

    expect(urls.length).toBeGreaterThanOrEqual(400);
    expect(urls.some((url) => url.includes('/torifuda/tori_1.png'))).toBe(true);
    expect(urls.some((url) => url.includes('/goro_slide/001.png'))).toBe(true);
    expect(urls.some((url) => url.includes('/goro_thumbnail/001.png'))).toBe(
      true,
    );
    expect(new Set(urls).size).toBe(urls.length);
  });
});
