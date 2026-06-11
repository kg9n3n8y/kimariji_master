import { describe, expect, it } from 'vitest';
import { groupStudyItems, getStudyItemsSorted } from '@/lib/studyList';
import { filterStudyGroups } from '@/features/study/studyListFilter';

describe('filterStudyGroups', () => {
  const items = getStudyItemsSorted().slice(0, 20);
  const groups = groupStudyItems(items);
  const learnedNos = new Set([items[0]!.no, items[1]!.no]);
  const isLearned = (no: number) => learnedNos.has(no);

  it('filters unlearned items', () => {
    const filtered = filterStudyGroups(groups, 'unlearned', isLearned);
    const total = filtered.reduce((sum, g) => sum + g.items.length, 0);
    expect(total).toBe(18);
  });

  it('filters learned items', () => {
    const filtered = filterStudyGroups(groups, 'learned', isLearned);
    const total = filtered.reduce((sum, g) => sum + g.items.length, 0);
    expect(total).toBe(2);
  });
});
