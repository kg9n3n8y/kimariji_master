/** ミリ秒を「M分SS秒」または「S秒」形式に変換 */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) {
    return '--';
  }
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}分${String(seconds).padStart(2, '0')}秒`;
  }
  return `${seconds}秒`;
}

/** v1 チェック完了アラートと同形式 */
export function formatCheckFinishMessage(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `終わりです。${minutes}分${seconds}秒でした！`;
}
