import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayersListener, useSessionListener, deleteSession } from '../../hooks/useSession';
import { useThemes } from '../../hooks/useThemes';
import Confetti from '../../components/Confetti';
import type { Player } from '../../types';

export default function Results() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { themes } = useThemes();
  const { session } = useSessionListener(code ?? '');
  const { players } = usePlayersListener(code ?? '');
  const [revealed, setRevealed] = useState(0);

  // Apagar sessão quando host sair desta tela
  useEffect(() => {
    const codeAtMount = code;
    return () => {
      if (codeAtMount) deleteSession(codeAtMount);
    };
  }, [code]);

  const theme = useMemo(
    () => themes.find((t) => t.id === session?.themeId) ?? null,
    [themes, session?.themeId]
  );
  const sorted = useMemo(
    () => [...players].sort((a: Player, b: Player) => b.score - a.score),
    [players]
  );
  const totalClues = session?.calledItems?.length ?? 0;

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(3), 600);
    return () => clearTimeout(timer);
  }, []);

  const podium = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const MEDAL = ['🥇', '🥈', '🥉'];
  const MEDAL_COLOR = ['#FFC800', '#8A89A0', '#FF9600'];
  const PODIUM_HEIGHT = [120, 90, 70];

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D1A', padding: '40px 16px' }}>
      <Confetti isActive={revealed >= 3} duration={6000} />

      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(36px, 8vw, 64px)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #FFC800, #FF86C8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 8,
        }}>
          Game Over!
        </h1>
        <p style={{ color: '#8A89A0', fontWeight: 600, marginBottom: 40 }}>
          {theme?.name} · {totalClues} clues called · {players.length} players
        </p>

        {/* Podium */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 16,
          marginBottom: 48,
        }}>
          {[1, 0, 2].map((rank) => {
            const player = podium[rank];
            if (!player) return <div key={rank} style={{ width: 160 }} />;
            return (
              <div
                key={player.id}
                className="animate-pop-in"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: rank === 0 ? 180 : 150,
                }}
              >
                <div style={{ fontSize: rank === 0 ? 40 : 32 }}>{MEDAL[rank]}</div>
                <div style={{
                  fontWeight: 900,
                  fontSize: rank === 0 ? 20 : 16,
                  color: MEDAL_COLOR[rank],
                  marginBottom: 4,
                  maxWidth: 140,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {player.name}
                </div>
                <div style={{ color: '#E8E6F0', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
                  {player.score} pts
                </div>
                <div style={{
                  width: '100%',
                  height: PODIUM_HEIGHT[rank],
                  background: `linear-gradient(180deg, ${MEDAL_COLOR[rank]}44, ${MEDAL_COLOR[rank]}22)`,
                  border: `2px solid ${MEDAL_COLOR[rank]}66`,
                  borderRadius: '12px 12px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 900,
                  color: MEDAL_COLOR[rank],
                }}>
                  {rank + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rest of ranking */}
        {rest.length > 0 && (
          <div className="card" style={{ padding: 24, marginBottom: 32, textAlign: 'left' }}>
            <p style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Full Ranking
            </p>
            {rest.map((player, i) => (
              <div
                key={player.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: '1px solid #2A2F52',
                }}
              >
                <span style={{ color: '#8A89A0', fontWeight: 700, minWidth: 28 }}>{i + 4}.</span>
                <span style={{ flex: 1, fontWeight: 700, color: '#E8E6F0' }}>{player.name}</span>
                <span style={{ fontWeight: 900, color: '#1CB0F6' }}>{player.score} pts</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/host/lobby/${session?.themeId}`)}
            className="btn-3d"
            style={{
              background: '#1CB0F6', color: '#fff', border: 'none',
              borderRadius: 14, padding: '14px 28px', fontSize: 16, fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 5px 0 #0a7ab8', fontFamily: 'Nunito, sans-serif',
            }}
          >
            🔄 Play Again
          </button>
          <button
            onClick={() => navigate('/host/themes')}
            className="btn-3d"
            style={{
              background: '#CE82FF', color: '#fff', border: 'none',
              borderRadius: 14, padding: '14px 28px', fontSize: 16, fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 5px 0 #8a44cc', fontFamily: 'Nunito, sans-serif',
            }}
          >
            📚 New Session
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#2A2F52', color: '#8A89A0', border: '1px solid #3a4066',
              borderRadius: 14, padding: '14px 28px', fontSize: 16, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
            }}
          >
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}
