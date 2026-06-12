export async function preloadImages(urls: readonly string[]): Promise<void> {
  const unique = [...new Set(urls)];
  await Promise.all(
    unique.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          const done = () => resolve();
          image.onload = done;
          image.onerror = done;
          image.src = url;
        }),
    ),
  );
}
