import { describe, expect, it } from 'vitest';
import { fudalist } from '@/data/fudalist';
import {
  findStudyIndex,
  getStudyItemsSorted,
  groupStudyItems,
} from '@/lib/studyList';

describe('getStudyItemsSorted', () => {
  it('sorts by studyOrder ascending', () => {
    const items = getStudyItemsSorted();
    expect(items).toHaveLength(fudalist.length);
    for (let i = 1; i < items.length; i += 1) {
      expect(items[i]!.studyOrder).toBeGreaterThanOrEqual(items[i - 1]!.studyOrder);
    }
  });
});

describe('groupStudyItems', () => {
  it('groups by classification', () => {
    const items = getStudyItemsSorted().slice(0, 10);
    const groups = groupStudyItems(items);
    const total = groups.reduce((sum, g) => sum + g.items.length, 0);
    expect(total).toBe(10);
    for (const group of groups) {
      expect(group.label.length).toBeGreaterThan(0);
      for (const fuda of group.items) {
        expect(fuda.classification || '分類なし').toBe(group.label);
      }
    }
  });
});

describe('findStudyIndex', () => {
  it('finds index by fuda number', () => {
    const items = getStudyItemsSorted();
    const index = findStudyIndex(items[3]!.no);
    expect(index).toBe(3);
  });
});
