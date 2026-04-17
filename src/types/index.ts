export interface ThemeItem {
  word: string;
  clue: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  items: ThemeItem[];
  createdAt: number;
}

export interface Session {
  id: string;
  code: string;
  themeId: string;
  status: 'waiting' | 'playing' | 'finished';
  currentClueIndex: number;
  calledItems: number[];
  hostId: string;
  createdAt: number;
}

export interface Player {
  id: string;
  name: string;
  board: number[];
  marked: number[];
  score: number;
  bingo: boolean;
  joinedAt: number;
}
