/** public/ 配下のアセット URL（GitHub Pages の base パス対応） */
export function assetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\.\//, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}

export function fudaImageUrl(fuda: { normal: string }): string {
  return assetUrl(fuda.normal);
}

export function goroSlideUrl(goroImage: string): string {
  return assetUrl(`goro_slide/${goroImage}`);
}

export function goroThumbnailUrl(goroImage: string): string {
  return assetUrl(`goro_thumbnail/${goroImage}`);
}
