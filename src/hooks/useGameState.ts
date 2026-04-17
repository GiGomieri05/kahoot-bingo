import { useMemo } from 'react';
import { useSessionListener, usePlayersListener } from './useSession';
import { validateBingo } from '../utils/validateBingo';
import type { Theme, Player } from '../types';

export function useGameState(code: string, theme: Theme | null) {
  const { session, loading } = useSessionListener(code);
  const { players } = usePlayersListener(code);

  const currentClue = useMemo(() => {
    if (!session || !theme || session.currentClueIndex < 0) return null;
    return theme.items[session.currentClueIndex] ?? null;
  }, [session, theme]);

  const validatedWinners = useMemo(() => {
    return players.filter(
      (p: Player) => p.bingo && validateBingo(p.board, p.marked)
    );
  }, [players]);

  const isGameOver = session?.status === 'finished';
  const winner = validatedWinners[0] ?? null;

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players]
  );

  return {
    session,
    players,
    sortedPlayers,
    currentClue,
    isGameOver,
    winner,
    validatedWinners,
    loading,
  };
}
