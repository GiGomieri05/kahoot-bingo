import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref as dbRef, get, onValue } from 'firebase/database';
import { db } from '../../firebase';
import { useThemes } from '../../hooks/useThemes';
import { markItem, unmarkItem, declareBingo } from '../../hooks/useSession';
import { checkBingo, validateBingo } from '../../utils/validateBingo';
import Confetti from '../../components/Confetti';
import { playCorrect, playBingo } from '../../components/SoundEffects';
import type { Session, Player, ThemeItem } from '../../types';

export default function BingoBoard() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { themes } = useThemes();
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [cellAnim, setCellAnim] = useState<number | null>(null);
  const [bingoDeclared, setBingoDeclared] = useState(false);
  const [bingoError, setBingoError] = useState<string | null>(null);

  const playerId = localStorage.getItem('bingolive_player_id') ?? '';

  const theme = session ? themes.find((t) => t.id === session.themeId) ?? null : null;
  const currentClue: ThemeItem | null =
    theme && session && session.currentClueIndex >= 0
      ? theme.items[session.currentClueIndex] ?? null
      : null;

  // Session listener
  useEffect(() => {
    if (!code) return;
    const unsub = onValue(dbRef(db, `sessions/${code}`), (snap) => {
      if (snap.exists()) {
        const v = snap.val();
        setSession({ id: code, ...v, calledItems: v.calledItems ?? [], wonTypes: v.wonTypes ?? [] } as Session);
      }
    });
    return () => unsub();
  }, [code]);

  // Player listener
  useEffect(() => {
    if (!code || !playerId) return;
    const unsub = onValue(dbRef(db, `sessions/${code}/players/${playerId}`), (snap) => {
      if (snap.exists()) {
        const v = snap.val();
        setPlayer({ id: playerId, ...v, board: v.board ?? [], marked: v.marked ?? [] } as Player);
      }
    });
    return () => unsub();
  }, [code, playerId]);

  // Navigation on game end
  useEffect(() => {
    if (session?.status === 'finished') {
      navigate(`/player-results/${code}`);
    }
  }, [session?.status, code, navigate]);

  async function handleCellTap(boardPos: number) {
    if (!code || !player || !theme) return;
    const itemIdx = player.board[boardPos];
    const alreadyMarked = player.marked.includes(itemIdx);

    setCellAnim(boardPos);
    setTimeout(() => setCellAnim(null), 300);

    if (alreadyMarked) {
      await unmarkItem(code, playerId, itemIdx, player.score);
      return;
    }

    const isCorrect = currentClue && theme.items[itemIdx]?.word === currentClue.word;
    if (isCorrect) {
      playCorrect();
    }
    await markItem(code, playerId, itemIdx, player.score);

    // Re-fetch player to get latest marked
    const snap = await get(dbRef(db, `sessions/${code}/players/${playerId}`));
    if (!snap.exists()) return;
    const sv = snap.val();
    const updated = { id: playerId, ...sv, board: sv.board ?? [], marked: sv.marked ?? [] } as Player;

    if (!validateBingo(updated.board, updated.marked)) {
      setBingoDeclared(false);
    }
  }

  async function handleDeclareBingo() {
    if (!code || !player) return;
    setBingoError(null);
    const result = await declareBingo(code, playerId);
    if (result.success) {
      setBingoDeclared(true);
      playBingo();
      setConfetti(true);
      setTimeout(() => setConfetti(false), 5000);
    } else if (result.reason === 'already_won') {
      setBingoError('Este tipo de bingo já foi conquistado por outro jogador!');
    } else if (result.reason === 'invalid') {
      setBingoError('Seu bingo não é válido. Continue marcando!');
    }
  }

  if (!player || !theme) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0D1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8A89A0', fontSize: 20, fontWeight: 700 }}>Loading your board...</p>
      </div>
    );
  }

  const bingoResult = checkBingo(player.board, player.marked);
  const hasBingo = bingoResult.type !== null;
  const wonTypes = session?.wonTypes ?? [];
  const typeAlreadyWon = bingoResult.type ? wonTypes.includes(bingoResult.type) : false;
  const calledCount = session?.calledItems?.length ?? 0;
  const totalItems = theme.items.length;

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D1A', padding: '16px', maxWidth: 480, margin: '0 auto' }}>
      <Confetti isActive={confetti} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ color: '#E8E6F0', fontWeight: 900, fontSize: 16 }}>{player.name}</div>
          <div style={{ color: '#8A89A0', fontWeight: 700, fontSize: 12 }}>
            {calledCount}/{totalItems} called
          </div>
        </div>
        <div style={{
          background: '#1CB0F622', border: '1px solid #1CB0F644',
          borderRadius: 12, padding: '8px 16px',
          color: '#1CB0F6', fontWeight: 900, fontSize: 22,
        }}>
          {player.score} pts
        </div>
      </div>

      {/* Current Clue */}
      <div
        className="animate-slide-down"
        key={session?.currentClueIndex}
        style={{
          background: 'linear-gradient(135deg, #1a1f42, #1e2346)',
          border: '2px solid #CE82FF',
          borderRadius: 16,
          padding: '20px 16px',
          textAlign: 'center',
          marginBottom: 16,
          boxShadow: '0 0 20px rgba(206,130,255,0.2)',
        }}
      >
        {currentClue ? (
          <>
            <div style={{ color: '#8A89A0', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
              Current Clue
            </div>
            <div style={{ color: '#CE82FF', fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>
              {currentClue.clue}
            </div>
          </>
        ) : (
          <div style={{ color: '#8A89A0', fontWeight: 700 }}>Waiting for first clue...</div>
        )}
      </div>

      {/* Bingo Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        marginBottom: 16,
      }}>
        {player.board.map((itemIdx, pos) => {
          const item = theme.items[itemIdx];
          const isMarked = player.marked.includes(itemIdx);
          const isAnimating = cellAnim === pos;
          return (
            <button
              key={pos}
              onClick={() => handleCellTap(pos)}
              style={{
                background: isMarked
                  ? 'linear-gradient(135deg, #3a6600, #58CC02aa)'
                  : '#151933',
                border: isMarked ? '2px solid #58CC02' : '2px solid #2A2F52',
                borderRadius: 14,
                padding: '12px 6px',
                minHeight: 72,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                transform: isAnimating ? 'scale(0.92)' : 'scale(1)',
                transition: 'transform 0.15s, background 0.2s, border-color 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isMarked && (
                <div style={{ fontSize: 18, lineHeight: 1 }}>✓</div>
              )}
              <div style={{
                color: isMarked ? '#58CC02' : '#E8E6F0',
                fontSize: 13,
                fontWeight: 800,
                textAlign: 'center',
                lineHeight: 1.2,
                wordBreak: 'break-word',
                hyphens: 'auto',
                overflowWrap: 'break-word',
                fontFamily: 'Nunito, sans-serif',
              }}>
                {item?.word ?? '?'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bingo Button */}
      {hasBingo && !bingoDeclared && !typeAlreadyWon && (
        <button
          onClick={handleDeclareBingo}
          className="btn-3d animate-pulse-glow"
          style={{
            background: '#FFC800',
            color: '#0B0D1A',
            border: 'none',
            borderRadius: 16,
            padding: '20px 32px',
            fontSize: 24,
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 6px 0 #a88000',
            width: '100%',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          🎉 BINGO! {bingoResult.type === 'full' ? '(Cartela Cheia +100pts)' : bingoResult.type === 'corners' ? '(4 Cantos +25pts)' : '(Fileira +50pts)'}
        </button>
      )}

      {hasBingo && typeAlreadyWon && !bingoDeclared && (
        <div style={{
          background: '#FF4B4B22', border: '2px solid #FF4B4B55',
          borderRadius: 16, padding: '16px 24px',
          textAlign: 'center', color: '#FF4B4B', fontWeight: 800, fontSize: 15,
        }}>
          ⚠️ Este tipo de bingo já foi conquistado. Continue marcando!
        </div>
      )}

      {bingoError && (
        <div style={{
          background: '#FF4B4B22', border: '2px solid #FF4B4B55',
          borderRadius: 16, padding: '16px 24px',
          textAlign: 'center', color: '#FF4B4B', fontWeight: 800, fontSize: 15,
          marginTop: 8,
        }}>
          ⚠️ {bingoError}
        </div>
      )}

      {bingoDeclared && (
        <div style={{
          background: '#58CC0222', border: '2px solid #58CC02',
          borderRadius: 16, padding: '16px 24px',
          textAlign: 'center', color: '#58CC02', fontWeight: 900, fontSize: 18,
        }}>
          ✓ Bingo confirmado! +{bingoResult.points} pts
        </div>
      )}
    </div>
  );
}
