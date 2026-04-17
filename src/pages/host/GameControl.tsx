import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useThemes } from '../../hooks/useThemes';
import { useGameState } from '../../hooks/useGameState';
import { callNextItem, updateSessionStatus, invalidateBingo } from '../../hooks/useSession';
import { validateBingo } from '../../utils/validateBingo';
import ClueDisplay from '../../components/ClueDisplay';
import ScoreBoard from '../../components/ScoreBoard';
import Confetti from '../../components/Confetti';
import { playReveal, playBingo, playWrong } from '../../components/SoundEffects';
import type { Player } from '../../types';

export default function GameControl() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { themes } = useThemes();
  const [isRevealed, setIsRevealed] = useState(false);
  const [showBingoAlert, setShowBingoAlert] = useState<Player | null>(null);
  const [confetti, setConfetti] = useState(false);
  const lastBingoIdRef = useRef<string | null>(null);

  const theme = code
    ? themes.find((t) =>
        t.id === (JSON.parse(localStorage.getItem('bingolive_host_code') ?? '{}')?.themeId ?? ''))
    : null;

  const { session, players, sortedPlayers, loading } = useGameState(
    code ?? '',
    theme ?? null
  );

  const themeResolved = session
    ? themes.find((t) => t.id === session.themeId) ?? null
    : null;
  const { currentClue: resolvedClue } = useGameState(code ?? '', themeResolved);

  useEffect(() => {
    const pending = players.find((p) => p.bingo);
    if (pending && pending.id !== lastBingoIdRef.current) {
      lastBingoIdRef.current = pending.id;
      const p = pending;
      setTimeout(() => setShowBingoAlert(p), 0);
    }
  }, [players]);

  async function handleNextClue() {
    if (!code || !themeResolved || !session) return;
    const available = themeResolved.items
      .map((_, i) => i)
      .filter((i) => !session.calledItems.includes(i));
    if (available.length === 0) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    await callNextItem(code, pick);
    setIsRevealed(false);
    playReveal();
  }

  function handleReveal() {
    setIsRevealed(true);
  }

  async function handleValidateBingo() {
    if (!showBingoAlert || !code) return;
    const player = showBingoAlert;
    const valid = validateBingo(player.board, player.marked);
    if (valid) {
      setConfetti(true);
      playBingo();
      setTimeout(() => setConfetti(false), 5000);
    } else {
      playWrong();
      await invalidateBingo(code, player.id);
    }
    setShowBingoAlert(null);
  }

  async function handleEndGame() {
    if (!code) return;
    await updateSessionStatus(code, 'finished');
    navigate(`/host/results/${code}`);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0D1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8A89A0', fontSize: 20, fontWeight: 700 }}>Loading game...</p>
      </div>
    );
  }

  const calledCount = session?.calledItems?.length ?? 0;
  const totalItems = themeResolved?.items.length ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D1A', padding: '24px 16px' }}>
      <Confetti isActive={confetti} />

      {/* Bingo Alert Overlay */}
      {showBingoAlert && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24,
        }}>
          <div className="card animate-pop-in" style={{ padding: 48, textAlign: 'center', maxWidth: 440 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ color: '#FFC800', fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
              {showBingoAlert.name} declared BINGO!
            </h2>
            <p style={{ color: '#8A89A0', fontWeight: 600, marginBottom: 32 }}>
              Validate their card?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={handleValidateBingo}
                className="btn-3d"
                style={{
                  background: '#58CC02', color: '#fff', border: 'none',
                  borderRadius: 14, padding: '14px 28px', fontSize: 16, fontWeight: 800,
                  cursor: 'pointer', boxShadow: '0 5px 0 #3a8800', fontFamily: 'Nunito, sans-serif',
                }}
              >
                ✓ Validate
              </button>
              <button
                onClick={() => setShowBingoAlert(null)}
                style={{
                  background: '#2A2F52', color: '#8A89A0', border: '1px solid #3a4066',
                  borderRadius: 14, padding: '14px 28px', fontSize: 16, fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            background: '#1CB0F622', border: '1px solid #1CB0F644',
            borderRadius: 10, padding: '6px 14px', color: '#1CB0F6', fontWeight: 800, fontSize: 13,
          }}>
            🎯 {themeResolved?.name}
          </div>
          <div style={{ color: '#8A89A0', fontWeight: 700, fontSize: 13 }}>
            Clue {calledCount} of {totalItems}
          </div>
          <div style={{ color: '#8A89A0', fontWeight: 700, fontSize: 13 }}>
            · {players.length} players
          </div>
          <div style={{ color: '#8A89A0', fontWeight: 700, fontSize: 13 }}>
            · Code: <strong style={{ color: '#FFC800' }}>{code}</strong>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleEndGame}
            style={{
              background: '#FF4B4B22', border: '1px solid #FF4B4B55',
              color: '#FF4B4B', borderRadius: 10, padding: '8px 16px',
              fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
            }}
          >
            End Game
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          {/* Main area */}
          <div>
            <ClueDisplay
              clue={resolvedClue}
              isRevealed={isRevealed}
              onReveal={handleReveal}
              large
            />

            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={handleNextClue}
                className="btn-3d"
                style={{
                  background: '#1CB0F6', color: '#fff', border: 'none',
                  borderRadius: 14, padding: '18px 40px', fontSize: 20, fontWeight: 900,
                  cursor: 'pointer', boxShadow: '0 6px 0 #0a7ab8', fontFamily: 'Nunito, sans-serif',
                }}
              >
                Next Clue 🎲
              </button>
            </div>

            {/* Called items pills */}
            {session && session.calledItems.length > 0 && themeResolved && (
              <div style={{ marginTop: 24 }}>
                <p style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  Already called
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {session.calledItems.map((idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#2A2F52', border: '1px solid #3a4066',
                        borderRadius: 8, padding: '4px 10px', color: '#8A89A0',
                        fontSize: 12, fontWeight: 700,
                      }}
                    >
                      {themeResolved.items[idx]?.word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scoreboard */}
          <div>
            <p style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Live Ranking
            </p>
            <ScoreBoard players={sortedPlayers} />
          </div>
        </div>
      </div>
    </div>
  );
}
