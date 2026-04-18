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
  status: 'waiting' | 'playing' | 'bingo_pending' | 'finished';
  currentClueIndex: number;
  calledItems: number[];
  hostId: string;
  createdAt: number;
  wonTypes: string[];
  pendingBingos?: { playerId: string; playerName: string; bingoType: string; points: number }[];
}

export interface Player {
  id: string;
  name: string;
  board: number[];
  marked: number[];
  score: number;
  bingo: boolean;
  bingoType: string | null;
  wonTypes: string[];
  joinedAt: number;
}
