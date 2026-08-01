export type BingoType = 'line' | 'corners' | 'full' | null;

export interface BingoResult {
  type: BingoType;
  points: number;
}

export const FREE_SPACE_INDEX = -1;
export const EMPTY_CELL = -2;
export const BOARD_SIZE = 25;
export const COLS = 5;
export const ROWS = 5;

export function isFreeSpace(board: number[], pos: number): boolean {
  return board[pos] === FREE_SPACE_INDEX;
}

export function checkBingo(board: number[], marked: number[], alreadyWon: string[] = []): BingoResult {
  if (!board?.length || !marked) return { type: null, points: 0 };
  const markedSet = new Set(marked);
  const grid: boolean[] = board.map((idx, pos) => isFreeSpace(board, pos) || markedSet.has(idx));

  if (!alreadyWon.includes('full') && grid.length === BOARD_SIZE && grid.every(Boolean)) {
    return { type: 'full', points: 250 };
  }

  if (!alreadyWon.includes('corners') && grid[0] && grid[4] && grid[20] && grid[24]) {
    return { type: 'corners', points: 25 };
  }

  const lines = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ];
  if (!alreadyWon.includes('line') && lines.some((line) => line.every((pos) => grid[pos]))) {
    return { type: 'line', points: 50 };
  }

  return { type: null, points: 0 };
}

export function validateBingo(board: number[], marked: number[]): boolean {
  return checkBingo(board, marked).type !== null;
}

export type NearBingoType = 'full' | 'corners' | 'line' | null;

export function checkNearBingo(
  board: number[],
  marked: number[],
  calledItems: number[],
  alreadyWon: string[] = []
): NearBingoType {
  if (!board?.length || !marked) return null;
  const markedSet = new Set(marked);
  const calledSet = new Set(calledItems);
  const grid: boolean[] = board.map((idx, pos) => isFreeSpace(board, pos) || markedSet.has(idx));

  const missingCount = (positions: number[]) =>
    positions.filter((pos) => !grid[pos]).length;

  const missingNotCalled = (positions: number[]) =>
    positions.filter((pos) => !grid[pos] && !calledSet.has(board[pos])).length;

  if (!alreadyWon.includes('full')) {
    const allPos = Array.from({ length: BOARD_SIZE }, (_, i) => i);
    if (missingCount(allPos) === 1 && missingNotCalled(allPos) <= 1) return 'full';
  }

  if (!alreadyWon.includes('corners')) {
    const corners = [0, 4, 20, 24];
    if (missingCount(corners) === 1 && missingNotCalled(corners) <= 1) return 'corners';
  }

  const lines = [
    [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
  ];
  if (!alreadyWon.includes('line')) {
    if (lines.some((line) => missingCount(line) === 1 && missingNotCalled(line) <= 1)) return 'line';
  }

  return null;
}
