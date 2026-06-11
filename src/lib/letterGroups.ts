export type LetterGroup = {
  id: string;
  title: string;
  letters: string[];
  mode: 'bundle' | 'single';
  description?: string;
};

/** 競技かるたの決まり字枚数分類（v1 `LETTER_GROUPS` 継承） */
export const LETTER_GROUPS: LetterGroup[] = [
  {
    id: 'one',
    title: '1枚札',
    letters: ['む', 'す', 'め', 'ふ', 'さ', 'ほ', 'せ'],
    mode: 'bundle',
    description: 'むすめふさほせ',
  },
  {
    id: 'two',
    title: '2枚札',
    letters: ['う', 'つ', 'し', 'も', 'ゆ'],
    mode: 'single',
  },
  {
    id: 'three',
    title: '3枚札',
    letters: ['い', 'ち', 'ひ', 'き'],
    mode: 'single',
  },
  {
    id: 'four',
    title: '4枚札',
    letters: ['は', 'や', 'よ', 'か'],
    mode: 'single',
  },
  { id: 'five', title: '5枚札', letters: ['み'], mode: 'single' },
  { id: 'six', title: '6枚札', letters: ['た', 'こ'], mode: 'single' },
  { id: 'seven', title: '7枚札', letters: ['お', 'わ'], mode: 'single' },
  { id: 'eight', title: '8枚札', letters: ['な'], mode: 'single' },
  { id: 'sixteen', title: '16枚札', letters: ['あ'], mode: 'single' },
];
