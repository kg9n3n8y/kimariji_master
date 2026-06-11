const DEFAULT_LINE_WIDTH = 3;

/** 設定モーダル個別ボタン用。横に最大 lineWidth 文字で折り返す */
export function formatKimarijiButtonLabel(
  kimariji: string,
  lineWidth = DEFAULT_LINE_WIDTH,
): string {
  const text = kimariji.trim();
  if (!text) {
    return '—';
  }

  const lines: string[] = [];
  for (let i = 0; i < text.length; i += lineWidth) {
    lines.push(text.slice(i, i + lineWidth));
  }
  return lines.join('\n');
}
