import { FREE_SPACE_INDEX, BOARD_SIZE } from './validateBingo';
import type { ThemeItem } from '../types';

const EMPTY_CELL = -2;

export function generateBoard(items: ThemeItem[]): number[] {
  const indices = items.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const wordCount = BOARD_SIZE - 1;
  const selected = indices.slice(0, Math.min(wordCount, indices.length));
  const freeSpacePos = Math.floor(BOARD_SIZE / 2);
  const board: number[] = Array(BOARD_SIZE).fill(EMPTY_CELL);
  board[freeSpacePos] = FREE_SPACE_INDEX;
  for (let i = 0; i < selected.length; i++) {
    board[i >= freeSpacePos ? i + 1 : i] = selected[i];
  }
  return board;
}
