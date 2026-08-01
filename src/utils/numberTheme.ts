import type { Theme } from '../types';

export const NUMBER_RANGES: [number, number][] = [
  [1, 15],   // B
  [16, 30],  // I
  [31, 45],  // N
  [46, 60],  // G
  [61, 75],  // O
];

export const NUMBER_LETTERS = ['B', 'I', 'N', 'G', 'O'];

export function getNumberColumn(num: number): string {
  for (let i = 0; i < NUMBER_RANGES.length; i++) {
    const [min, max] = NUMBER_RANGES[i];
    if (num >= min && num <= max) return NUMBER_LETTERS[i];
  }
  return '';
}

export function isNumberTheme(themeId?: string | null): boolean {
  return themeId === 'numbers';
}

export const NUMBER_THEME: Theme = {
  id: 'numbers',
  name: 'Bingo de Números',
  description: 'Números de 1 a 75',
  createdAt: 0,
  items: Array.from({ length: 75 }, (_, i) => {
    const n = String(i + 1);
    return { word: n, clue: n };
  }),
};
