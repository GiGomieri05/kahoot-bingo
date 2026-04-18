export type BingoType = 'line' | 'corners' | 'full' | null;

export interface BingoResult {
  type: BingoType;
  points: number;
}

export function checkBingo(board: number[], marked: number[], alreadyWon: string[] = []): BingoResult {
  if (!board?.length || !marked) return { type: null, points: 0 };
  const markedSet = new Set(marked);
  const grid: boolean[] = board.map((idx) => markedSet.has(idx));

  if (!alreadyWon.includes('full') && grid.every(Boolean)) return { type: 'full', points: 250 };

  if (!alreadyWon.includes('corners') && grid[0] && grid[3] && grid[12] && grid[15]) return { type: 'corners', points: 25 };

  const lines = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12],
  ];
  if (!alreadyWon.includes('line') && lines.some((line) => line.every((pos) => grid[pos]))) return { type: 'line', points: 50 };

  return { type: null, points: 0 };
}

export function validateBingo(board: number[], marked: number[]): boolean {
  return checkBingo(board, marked).type !== null;
}

export type NearBingoType = 'full' | 'corners' | 'line' | null;

/**
 * Returns the closest bingo type the player is 1 cell away from,
 * considering already-won types (player + session) and only uncalled cells.
 * "1 cell away" means exactly 1 position in the pattern is not yet marked.
 */
export function checkNearBingo(
  board: number[],
  marked: number[],
  calledItems: number[],
  alreadyWon: string[] = []
): NearBingoType {
  if (!board?.length || !marked) return null;
  const markedSet = new Set(marked);
  const calledSet = new Set(calledItems);
  const grid: boolean[] = board.map((idx) => markedSet.has(idx));

  const missingCount = (positions: number[]) =>
    positions.filter((pos) => !grid[pos]).length;

  const missingNotCalled = (positions: number[]) =>
    positions.filter((pos) => !grid[pos] && !calledSet.has(board[pos])).length;

  if (!alreadyWon.includes('full')) {
    const allPos = Array.from({ length: 16 }, (_, i) => i);
    if (missingCount(allPos) === 1 && missingNotCalled(allPos) <= 1) return 'full';
  }

  if (!alreadyWon.includes('corners')) {
    const corners = [0, 3, 12, 15];
    if (missingCount(corners) === 1 && missingNotCalled(corners) <= 1) return 'corners';
  }

  const lines = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
    [0, 5, 10, 15], [3, 6, 9, 12],
  ];
  if (!alreadyWon.includes('line')) {
    if (lines.some((line) => missingCount(line) === 1 && missingNotCalled(line) <= 1)) return 'line';
  }

  return null;
}
