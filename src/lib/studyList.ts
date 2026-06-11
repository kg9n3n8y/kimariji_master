import { fudalist } from '@/data/fudalist';
import type { Fuda } from '@/types/fuda';

export type StudyGroup = {
  label: string;
  items: Fuda[];
};

/** studyOrder 昇順に並べた全札 */
export function getStudyItemsSorted(): Fuda[] {
  return [...fudalist].sort((a, b) => a.studyOrder - b.studyOrder);
}

export function getStudyGroupLabel(fuda: Fuda): string {
  return fuda.classification?.trim() || '分類なし';
}

/** classification ごとにセクション分け（各セクション内は studyOrder 順を維持） */
export function groupStudyItems(items: readonly Fuda[]): StudyGroup[] {
  const groupMap = new Map<string, Fuda[]>();

  for (const fuda of items) {
    const label = getStudyGroupLabel(fuda);
    const group = groupMap.get(label);
    if (group) {
      group.push(fuda);
    } else {
      groupMap.set(label, [fuda]);
    }
  }

  return Array.from(groupMap.entries()).map(([label, groupItems]) => ({
    label,
    items: groupItems,
  }));
}

export function findStudyIndex(fudaNo: number): number {
  const items = getStudyItemsSorted();
  return items.findIndex((f) => f.no === fudaNo);
}

export function getStudyFudaByNo(fudaNo: number): Fuda | undefined {
  return fudalist.find((f) => f.no === fudaNo);
}
