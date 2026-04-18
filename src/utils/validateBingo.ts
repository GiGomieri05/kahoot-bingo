export function validateBingo(board: number[], marked: number[]): boolean {
  if (!board?.length || !marked) return false;
  const markedSet = new Set(marked);
  const grid: boolean[] = board.map((idx) => markedSet.has(idx));

  const rows = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
  ];
  const cols = [
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
  ];
  const diags = [
    [0, 5, 10, 15],
    [3, 6, 9, 12],
  ];

  const lines = [...rows, ...cols, ...diags];
  return lines.some((line) => line.every((pos) => grid[pos]));
}
