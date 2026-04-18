import { useEffect, useState } from 'react';
import { ref, set, get, update, onValue, push } from 'firebase/database';
import { db } from '../firebase';
import type { Session, Player, Theme } from '../types';
import { generateCode } from '../utils/generateCode';
import { generateBoard } from '../utils/generateBoard';

export function useSessionListener(code: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    const sessionRef = ref(db, `sessions/${code}`);
    const unsub = onValue(sessionRef, (snap) => {
      const data = snap.val();
      if (data) {
        setSession({ id: code, ...data, calledItems: data.calledItems ?? [] } as Session);
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
    hostId,
    createdAt: Date.now(),
  });
  return code;
}

export async function joinSession(code: string, playerName: string, theme: Theme): Promise<string | null> {
  const snap = await get(ref(db, `sessions/${code}`));
  if (!snap.exists()) return null;
  const session = snap.val() as Session;
  if (session.status !== 'waiting') return null;

  const board = generateBoard(theme.items);
  const newPlayerRef = push(ref(db, `sessions/${code}/players`));
  await set(newPlayerRef, {
    name: playerName,
    board,
    marked: [],
    score: 0,
    bingo: false,
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
  const snap = await get(ref(db, `sessions/${code}/players/${playerId}/marked`));
  const current: number[] = snap.val() ?? [];
  if (current.includes(itemIndex)) return;
  const updated = [...current, itemIndex];
  await update(ref(db, `sessions/${code}/players/${playerId}`), {
    marked: updated,
    score: currentScore + 10,
  });
}

export async function unmarkItem(
  code: string,
  playerId: string,
  itemIndex: number,
  currentScore: number
): Promise<void> {
  const snap = await get(ref(db, `sessions/${code}/players/${playerId}/marked`));
  const current: number[] = snap.val() ?? [];
  if (!current.includes(itemIndex)) return;
  const updated = current.filter((i) => i !== itemIndex);
  await update(ref(db, `sessions/${code}/players/${playerId}`), {
    marked: updated,
    score: Math.max(0, currentScore - 10),
  });
}

export async function declareBingo(code: string, playerId: string): Promise<void> {
  await update(ref(db, `sessions/${code}/players/${playerId}`), { bingo: true });
}

export async function invalidateBingo(code: string, playerId: string): Promise<void> {
  await update(ref(db, `sessions/${code}/players/${playerId}`), { bingo: false });
}
