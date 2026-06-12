import { fudalist } from '@/data/fudalist';
import {
  assetUrl,
  fudaImageUrl,
  fudaReverseImageUrl,
  goroSlideUrl,
  goroThumbnailUrl,
  placeholderFudaUrl,
} from '@/lib/assets';

/** fudalist からアプリ内で使う画像 URL をすべて集める */
export function buildImageAssetUrls(): string[] {
  const urls = new Set<string>();
  urls.add(placeholderFudaUrl());

  for (const fuda of fudalist) {
    urls.add(fudaImageUrl(fuda));
    urls.add(fudaReverseImageUrl(fuda));
    const goroImage = fuda.goroImage?.trim();
    if (goroImage) {
      urls.add(goroSlideUrl(goroImage));
      urls.add(goroThumbnailUrl(goroImage));
    }
  }

  urls.add(assetUrl('icon.png'));
  urls.add(assetUrl('icon-512.png'));
  urls.add(assetUrl('thumbnail.png'));

  return [...urls];
}
