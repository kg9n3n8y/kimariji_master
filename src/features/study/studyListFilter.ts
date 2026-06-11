import type { StudyGroup } from '@/lib/studyList';

export type StudyFilter = 'all' | 'unlearned' | 'learned';

const FILTER_SESSION_KEY = 'kimariji:studyListFilter';

export function loadStudyFilter(): StudyFilter {
  try {
    const raw = sessionStorage.getItem(FILTER_SESSION_KEY);
    if (raw === 'all' || raw === 'unlearned' || raw === 'learned') {
      return raw;
    }
  } catch {
    // ignore
  }
  return 'all';
}

export function saveStudyFilter(filter: StudyFilter): void {
  sessionStorage.setItem(FILTER_SESSION_KEY, filter);
}

export function categorySectionId(label: string): string {
  return `study-cat-${label.replace(/\s+/g, '-')}`;
}

export function filterStudyGroups(
  groups: StudyGroup[],
  filter: StudyFilter,
  isLearned: (fudaNo: number) => boolean,
): StudyGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((fuda) => {
        if (filter === 'all') {
          return true;
        }
        return filter === 'learned' ?
            isLearned(fuda.no)
          : !isLearned(fuda.no);
      }),
    }))
    .filter((group) => group.items.length > 0);
}

export function countVisibleItems(groups: StudyGroup[]): number {
  return groups.reduce((sum, group) => sum + group.items.length, 0);
}
