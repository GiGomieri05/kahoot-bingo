import { FREE_SPACE_INDEX, BOARD_SIZE, COLS, ROWS } from './validateBingo';
import type { ThemeItem } from '../types';

const EMPTY_CELL = -2;

// 75-ball BINGO: column ranges and cell counts (N has 4 + free center)
const COLUMN_RANGES: [number, number][] = [
  [1, 15],   // B
  [16, 30],  // I
  [31, 45],  // N
  [46, 60],  // G
  [61, 75],  // O
];

const COLUMN_COUNTS = [5, 5, 4, 5, 5];

function parseNumberWord(item: ThemeItem): number | null {
  const n = Number(item.word);
  return Number.isNaN(n) ? null : n;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateBoard(items: ThemeItem[]): number[] {
  const board: number[] = Array(BOARD_SIZE).fill(EMPTY_CELL);
  const freeSpacePos = Math.floor(BOARD_SIZE / 2); // 12
  board[freeSpacePos] = FREE_SPACE_INDEX;

  const usedIndices = new Set<number>();
  const usedNumbers = new Set<number>();

  for (let col = 0; col < COLS; col++) {
    const [min, max] = COLUMN_RANGES[col];
    const count = COLUMN_COUNTS[col];

    const candidates = items
      .map((item, idx) => ({ idx, num: parseNumberWord(item) }))
      .filter(
        ({ num, idx }) =>
          num !== null &&
          num >= min &&
          num <= max &&
          !usedIndices.has(idx) &&
          !usedNumbers.has(num)
      );

    const selected = shuffle(candidates).slice(0, count);

    let selectedIdx = 0;
    for (let row = 0; row < ROWS; row++) {
      const pos = row * COLS + col;
      if (pos === freeSpacePos) continue;

      const candidate = selected[selectedIdx++];
      if (candidate) {
        board[pos] = candidate.idx;
        usedIndices.add(candidate.idx);
        usedNumbers.add(candidate.num!);
      }
    }
  }

  return board;
}
