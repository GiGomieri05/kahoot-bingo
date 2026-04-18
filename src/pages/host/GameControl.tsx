import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useThemes } from '../../hooks/useThemes';
import { useGameState } from '../../hooks/useGameState';
import { callNextItem, updateSessionStatus, deleteSession } from '../../hooks/useSession';
import ClueDisplay from '../../components/ClueDisplay';
import ScoreBoard from '../../components/ScoreBoard';
import Confetti from '../../components/Confetti';
import { playReveal, playBingo } from '../../components/SoundEffects';

export default function GameControl() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { themes } = useThemes();
  const [isRevealed, setIsRevealed] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const lastWonTypesLenRef = useRef<number>(0);

  const { session, players, sortedPlayers, loading } = useGameState(
    code ?? '',
    null
  );

  const themeResolved = session
    ? themes.find((t) => t.id === session.themeId) ?? null
    : null;
  const { currentClue: resolvedClue } = useGameState(code ?? '', themeResolved);

  // Auto-navigate when game finishes (full board bingo)
  useEffect(() => {
    if (session?.status === 'finished' && code) {
      deleteSession(code).then(() => navigate(`/host/results/${code}`));
    }
  }, [session?.status, code, navigate]);

  // Play sound when someone gets bingo
  useEffect(() => {
    const wonLen = session?.wonTypes?.length ?? 0;
    if (wonLen > lastWonTypesLenRef.current) {
      lastWonTypesLenRef.current = wonLen;
      setConfetti(true);
      playBingo();
      setTimeout(() => setConfetti(false), 4000);
    }
  }, [session?.wonTypes]);

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

  async function handleEndGame() {
    if (!code) return;
    await updateSessionStatus(code, 'finished');
    await deleteSession(code);
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

      {/* Bingo notification banner */}
      {(session?.wonTypes?.length ?? 0) > 0 && (
        <div style={{
          background: '#FFC80022', border: '1px solid #FFC80055',
          borderRadius: 12, padding: '10px 20px', marginBottom: 16,
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <span style={{ color: '#FFC800', fontWeight: 800, fontSize: 14 }}>🏆 Bingos confirmados:</span>
          {sortedPlayers.filter(p => p.bingo).map(p => (
            <span key={p.id} style={{
              background: '#FFC80033', borderRadius: 8, padding: '2px 10px',
              color: '#FFC800', fontWeight: 700, fontSize: 13,
            }}>
              {p.name} ({p.bingoType === 'full' ? 'Cartela Cheia' : p.bingoType === 'corners' ? '4 Cantos' : 'Fileira'})
            </span>
          ))}
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

            {/* Called items pills - only show last 5 */}
            {session && session.calledItems.length > 0 && themeResolved && (
              <div style={{ marginTop: 24 }}>
                <p style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  Últimas chamadas ({session.calledItems.length}/{themeResolved.items.length})
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[...session.calledItems].slice(-8).reverse().map((idx, i) => (
                    <span
                      key={idx}
                      style={{
                        background: i === 0 ? '#1CB0F633' : '#2A2F52',
                        border: `1px solid ${i === 0 ? '#1CB0F6' : '#3a4066'}`,
                        borderRadius: 8, padding: '4px 10px',
                        color: i === 0 ? '#1CB0F6' : '#8A89A0',
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
