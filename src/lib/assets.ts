/** public/ 配下のアセット URL（GitHub Pages の base パス対応） */
export function assetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\.\//, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}

export function fudaImageUrl(fuda: { normal: string }): string {
  return assetUrl(fuda.normal);
}

export function fudaReverseImageUrl(fuda: { reverse: string }): string {
  return assetUrl(fuda.reverse);
}

export function placeholderFudaUrl(): string {
  return assetUrl('torifuda/tori_0.png');
}

export function goroSlideUrl(goroImage: string): string {
  return assetUrl(`goro_slide/${goroImage}`);
}

export function goroThumbnailUrl(goroImage: string): string {
  return assetUrl(`goro_thumbnail/${goroImage}`);
}
