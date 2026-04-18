import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useThemes } from '../../hooks/useThemes';
import { useGameState } from '../../hooks/useGameState';
import { callNextItem, updateSessionStatus, resumeFromBingo } from '../../hooks/useSession';
import ClueDisplay from '../../components/ClueDisplay';
import ScoreBoard from '../../components/ScoreBoard';
import Confetti from '../../components/Confetti';
import { playReveal, playBingo } from '../../components/SoundEffects';
import ModerationPanel from '../../components/ModerationPanel';

export default function GameControl() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { themes } = useThemes();
  const [isRevealed, setIsRevealed] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [showCalledWords, setShowCalledWords] = useState(false);
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
      navigate(`/host/results/${code}`);
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
    setIsRevealed(false);
    setShowCalledWords(false);
    await callNextItem(code, pick);
    playReveal();
  }

  function handleReveal() {
    setIsRevealed(true);
  }

  function handleHide() {
    setIsRevealed(false);
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
  const isBingoPending = session?.status === 'bingo_pending';
  const pendingBingos = session?.pendingBingos?.map((pb) => ({ ...pb })) ?? [];

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D1A', padding: '24px 16px' }}>
      <Confetti isActive={confetti} />

      {/* Bingo Pending Overlay */}
      {isBingoPending && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24,
        }}>
          <div className="card animate-pop-in" style={{ padding: 40, textAlign: 'center', maxWidth: 500, width: '100%' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <h2 style={{ color: '#FFC800', fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
              BINGO!
            </h2>
            <p style={{ color: '#8A89A0', fontWeight: 600, marginBottom: 24, fontSize: 15 }}>
              {pendingBingos.length === 1
                ? `${pendingBingos[0].playerName} cantou bingo!`
                : `${pendingBingos.length} jogadores cantaram bingo ao mesmo tempo!`}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {pendingBingos.map((pb) => (
                <div key={pb.playerId} style={{
                  background: '#FFC80022', border: '1px solid #FFC80055',
                  borderRadius: 12, padding: '12px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: '#E8E6F0', fontWeight: 800, fontSize: 16 }}>{pb.playerName}</span>
                  <span style={{ color: '#FFC800', fontWeight: 700, fontSize: 13 }}>
                    {pb.bingoType === 'full' ? 'Cartela Cheia' : pb.bingoType === 'corners' ? '4 Cantos' : 'Fileira'} · +{pb.points}pts
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => code && resumeFromBingo(code)}
              className="btn-3d"
              style={{
                background: '#58CC02', color: '#fff', border: 'none',
                borderRadius: 14, padding: '16px 40px', fontSize: 18, fontWeight: 900,
                cursor: 'pointer', boxShadow: '0 5px 0 #3a8800', fontFamily: 'Nunito, sans-serif',
                width: '100%',
              }}
            >
              ▶ Continuar Jogo
            </button>
          </div>
        </div>
      )}

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
          {code && <ModerationPanel code={code} players={players} />}
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
              key={session?.currentClueIndex ?? -1}
              clue={resolvedClue}
              isRevealed={isRevealed}
              onReveal={handleReveal}
              onHide={handleHide}
              large
            />

            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={handleNextClue}
                disabled={isBingoPending}
                className="btn-3d"
                style={{
                  background: isBingoPending ? '#2A2F52' : '#1CB0F6',
                  color: isBingoPending ? '#8A89A0' : '#fff',
                  border: 'none',
                  borderRadius: 14, padding: '18px 40px', fontSize: 20, fontWeight: 900,
                  cursor: isBingoPending ? 'not-allowed' : 'pointer',
                  boxShadow: isBingoPending ? 'none' : '0 6px 0 #0a7ab8',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                Next Clue 🎲
              </button>
            </div>

            {/* Called items pills - only show last 8 */}
            {session && session.calledItems.length > 0 && themeResolved && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <p style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
                    Últimas chamadas ({session.calledItems.length}/{themeResolved.items.length})
                  </p>
                  <button
                    onClick={() => setShowCalledWords(v => !v)}
                    style={{
                      background: '#2A2F5288', border: '1px solid #3a4066',
                      color: '#8A89A0', cursor: 'pointer',
                      fontSize: 11, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
                      padding: '2px 8px', borderRadius: 6,
                    }}
                  >
                    {showCalledWords ? '🙈 Ocultar' : '👁️ Mostrar'}
                  </button>
                </div>
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
                        filter: showCalledWords ? 'none' : 'blur(4px)',
                        userSelect: showCalledWords ? 'auto' : 'none',
                        transition: 'filter 0.2s',
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
