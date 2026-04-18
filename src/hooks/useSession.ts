import { useEffect, useState } from 'react';
import { ref, set, get, update, onValue, push, remove } from 'firebase/database';
import { db } from '../firebase';
import type { Session, Player, Theme } from '../types';
import { generateCode } from '../utils/generateCode';
import { generateBoard } from '../utils/generateBoard';
import { checkBingo } from '../utils/validateBingo';

export function useSessionListener(code: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    const sessionRef = ref(db, `sessions/${code}`);
    const unsub = onValue(sessionRef, (snap) => {
      const data = snap.val();
      if (data) {
        setSession({
          id: code,
          ...data,
          calledItems: data.calledItems ?? [],
          wonTypes: data.wonTypes ?? [],
          pendingBingos: data.pendingBingos ?? [],
        } as Session);
      } else {
        setSession(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [code]);

  return { session, loading };
}

export function usePlayersListener(code: string) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!code) return;
    const playersRef = ref(db, `sessions/${code}/players`);
    const unsub = onValue(playersRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list: Player[] = Object.entries(data).map(([id, val]) => {
          const v = val as Omit<Player, 'id'>;
          return {
            id,
            ...v,
            board: v.board ?? [],
            marked: v.marked ?? [],
          };
        });
        setPlayers(list.sort((a, b) => a.joinedAt - b.joinedAt));
      } else {
        setPlayers([]);
      }
    });
    return () => unsub();
  }, [code]);

  return { players };
}

export async function createSession(themeId: string, hostId: string): Promise<string> {
  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const snap = await get(ref(db, `sessions/${code}`));
    if (!snap.exists()) break;
    code = generateCode();
    attempts++;
  }
  await set(ref(db, `sessions/${code}`), {
    code,
    themeId,
    status: 'waiting',
    currentClueIndex: -1,
    calledItems: [],
    wonTypes: [],
    hostId,
    createdAt: Date.now(),
  });
  return code;
}

export async function joinSession(code: string, playerName: string, theme: Theme): Promise<string | null> {
  const snap = await get(ref(db, `sessions/${code}`));
  if (!snap.exists()) return null;
  const session = snap.val() as Session;
  if (session.status !== 'waiting' && session.status !== 'playing') return null;

  const board = generateBoard(theme.items);
  const newPlayerRef = push(ref(db, `sessions/${code}/players`));
  await set(newPlayerRef, {
    name: playerName,
    board,
    marked: [],
    score: 0,
    bingo: false,
    wonTypes: [],
    joinedAt: Date.now(),
  });
  return newPlayerRef.key;
}

export async function updateSessionStatus(
  code: string,
  status: Session['status']
): Promise<void> {
  await update(ref(db, `sessions/${code}`), { status });
}

export async function callNextItem(code: string, itemIndex: number): Promise<void> {
  const snap = await get(ref(db, `sessions/${code}/calledItems`));
  const current: number[] = snap.val() ?? [];
  const updated = [...current, itemIndex];
  await update(ref(db, `sessions/${code}`), {
    calledItems: updated,
    currentClueIndex: itemIndex,
  });
}

export async function markItem(
  code: string,
  playerId: string,
  itemIndex: number,
  currentScore: number
): Promise<void> {
  const [markedSnap, calledSnap] = await Promise.all([
    get(ref(db, `sessions/${code}/players/${playerId}/marked`)),
    get(ref(db, `sessions/${code}/calledItems`)),
  ]);
  const current: number[] = markedSnap.val() ?? [];
  if (current.includes(itemIndex)) return;
  const calledItems: number[] = calledSnap.val() ?? [];
  const wasCalled = calledItems.includes(itemIndex);
  const updated = [...current, itemIndex];
  await update(ref(db, `sessions/${code}/players/${playerId}`), {
    marked: updated,
    score: wasCalled ? currentScore + 10 : currentScore,
  });
}

export async function unmarkItem(
  code: string,
  playerId: string,
  itemIndex: number,
  currentScore: number
): Promise<void> {
  const [markedSnap, calledSnap] = await Promise.all([
    get(ref(db, `sessions/${code}/players/${playerId}/marked`)),
    get(ref(db, `sessions/${code}/calledItems`)),
  ]);
  const current: number[] = markedSnap.val() ?? [];
  if (!current.includes(itemIndex)) return;
  const calledItems: number[] = calledSnap.val() ?? [];
  const wasCalled = calledItems.includes(itemIndex);
  const updated = current.filter((i) => i !== itemIndex);
  await update(ref(db, `sessions/${code}/players/${playerId}`), {
    marked: updated,
    score: wasCalled ? Math.max(0, currentScore - 10) : currentScore,
  });
}

export async function deleteSession(code: string): Promise<void> {
  await remove(ref(db, `sessions/${code}`));
}

export async function declareBingo(
  code: string,
  playerId: string
): Promise<{ success: boolean; reason?: string }> {
  const [playerSnap, sessionSnap] = await Promise.all([
    get(ref(db, `sessions/${code}/players/${playerId}`)),
    get(ref(db, `sessions/${code}`)),
  ]);
  if (!playerSnap.exists() || !sessionSnap.exists()) return { success: false, reason: 'not_found' };

  const playerData = playerSnap.val();
  const sessionData = sessionSnap.val();

  // Firebase can return sparse arrays as objects — normalize preserving index order
  const toArray = (v: unknown): number[] => {
    if (!v) return [];
    if (Array.isArray(v)) return v as number[];
    if (typeof v === 'object') {
      const obj = v as Record<string, number>;
      return Object.keys(obj)
        .map(Number)
        .sort((a, b) => a - b)
        .map((k) => obj[k]);
    }
    return [];
  };

  const board: number[] = toArray(playerData.board);
  const marked: number[] = toArray(playerData.marked);
  const calledItems: number[] = toArray(sessionData.calledItems);
  const sessionWonTypes: string[] = Array.isArray(sessionData.wonTypes) ? sessionData.wonTypes : Object.values(sessionData.wonTypes ?? {});
  const playerWonTypes: string[] = Array.isArray(playerData.wonTypes) ? playerData.wonTypes : Object.values(playerData.wonTypes ?? {});
  const pendingBingos: { playerId: string; playerName: string; bingoType: string; points: number }[] =
    Array.isArray(sessionData.pendingBingos) ? sessionData.pendingBingos : Object.values(sessionData.pendingBingos ?? {});

  console.log('[declareBingo] board:', board, 'marked:', marked, 'calledItems:', calledItems);

  const calledSet = new Set(calledItems);
  // marked stores theme item indices (same as calledItems), not grid positions
  const validMarked = marked.filter((itemIdx) => calledSet.has(itemIdx));

  console.log('[declareBingo] validMarked:', validMarked);

  const allClosedTypes = Array.from(new Set([...playerWonTypes, ...sessionWonTypes]));
  const result = checkBingo(board, validMarked, allClosedTypes);
  console.log('[declareBingo] result:', result);
  if (!result.type) return { success: false, reason: 'invalid' };
  if (allClosedTypes.includes(result.type)) return { success: false, reason: 'already_won' };
  if (pendingBingos.some((p) => p.playerId === playerId && p.bingoType === result.type)) return { success: false, reason: 'already_pending' };

  const newScore = (playerData.score ?? 0) + result.points;
  const newPlayerWonTypes = [...playerWonTypes, result.type];
  const newPending = [
    ...pendingBingos,
    { playerId, playerName: playerData.name, bingoType: result.type, points: result.points },
  ];

  const playerUpdates: Promise<void>[] = [
    update(ref(db, `sessions/${code}/players/${playerId}`), {
      bingo: true,
      bingoType: result.type,
      wonTypes: newPlayerWonTypes,
      score: newScore,
    }),
  ];

  if (result.type === 'full') {
    const allPlayersSnap = await get(ref(db, `sessions/${code}/players`));
    if (allPlayersSnap.exists()) {
      const allPlayers = allPlayersSnap.val() as Record<string, { board: unknown; marked: unknown; wonTypes: unknown; score: number; name: string }>;
      for (const [otherId, otherData] of Object.entries(allPlayers)) {
        if (otherId === playerId) continue;
        const otherBoard = toArray(otherData.board);
        const otherMarked = toArray(otherData.marked);
        const otherWonTypes: string[] = Array.isArray(otherData.wonTypes)
          ? (otherData.wonTypes as string[])
          : Object.values(otherData.wonTypes ?? {}) as string[];
        if (otherWonTypes.includes('full')) continue;
        const otherResult = checkBingo(otherBoard, otherMarked.filter((i) => calledSet.has(i)), otherWonTypes);
        if (otherResult.type === 'full') {
          newPending.push({ playerId: otherId, playerName: otherData.name, bingoType: 'full', points: otherResult.points });
          playerUpdates.push(
            update(ref(db, `sessions/${code}/players/${otherId}`), {
              bingo: true,
              bingoType: 'full',
              wonTypes: [...otherWonTypes, 'full'],
              score: (otherData.score ?? 0) + otherResult.points,
            })
          );
        }
      }
    }
  }

  await Promise.all([
    ...playerUpdates,
    update(ref(db, `sessions/${code}`), {
      wonTypes: [...sessionWonTypes, result.type],
      pendingBingos: newPending,
      status: result.type === 'full' ? 'finished' : 'bingo_pending',
    }),
  ]);

  return { success: true };
}

export async function resumeFromBingo(code: string): Promise<void> {
  await update(ref(db, `sessions/${code}`), {
    status: 'playing',
    pendingBingos: [],
  });
}
