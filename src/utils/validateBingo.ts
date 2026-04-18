export type BingoType = 'line' | 'corners' | 'full' | null;

export interface BingoResult {
  type: BingoType;
  points: number;
}

export function checkBingo(board: number[], marked: number[]): BingoResult {
  if (!board?.length || !marked) return { type: null, points: 0 };
  const markedSet = new Set(marked);
  const grid: boolean[] = board.map((idx) => markedSet.has(idx));

  if (grid.every(Boolean)) return { type: 'full', points: 250 };

  if (grid[0] && grid[3] && grid[12] && grid[15]) return { type: 'corners', points: 25 };

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
  if (lines.some((line) => line.every((pos) => grid[pos]))) return { type: 'line', points: 50 };

  return { type: null, points: 0 };
}

export function validateBingo(board: number[], marked: number[]): boolean {
  return checkBingo(board, marked).type !== null;
}
