import { useMemo } from 'react';
import { useSessionListener, usePlayersListener } from './useSession';
import { validateBingo, checkNearBingo } from '../utils/validateBingo';
import type { NearBingoType } from '../utils/validateBingo';
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

  const nearBingoPlayers = useMemo((): Array<{ player: Player; nearType: NearBingoType }> => {
    if (!session) return [];
    const calledItems: number[] = Array.isArray(session.calledItems)
      ? session.calledItems
      : Object.values(session.calledItems ?? {});
    const calledSet = new Set(calledItems);

    return players
      .filter((p) => !p.wonTypes?.includes('full'))
      .flatMap((p) => {
        const board: number[] = Array.isArray(p.board) ? p.board : Object.values(p.board ?? {});
        const allMarked: number[] = Array.isArray(p.marked) ? p.marked : Object.values(p.marked ?? {});
        const marked = allMarked.filter((idx) => calledSet.has(idx));
        const playerWonTypes: string[] = Array.isArray(p.wonTypes) ? p.wonTypes : Object.values(p.wonTypes ?? {});
        const nearType = checkNearBingo(board, marked, calledItems, playerWonTypes);
        return nearType ? [{ player: p, nearType }] : [];
      });
  }, [players, session]);

  return {
    session,
    players,
    sortedPlayers,
    currentClue,
    isGameOver,
    winner,
    validatedWinners,
    nearBingoPlayers,
    loading,
  };
}
