import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionListener, usePlayersListener } from '../../hooks/useSession';
import { useThemes } from '../../hooks/useThemes';

export default function WaitingRoom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { session } = useSessionListener(code ?? '');
  const { players } = usePlayersListener(code ?? '');
  const { themes } = useThemes();
  const myName = localStorage.getItem('bingolive_player_name') ?? '';
  const theme = session ? themes.find((t) => t.id === session.themeId) : null;

  useEffect(() => {
    if (session?.status === 'playing') {
      navigate(`/board/${code}`);
    }
    if (session?.status === 'finished') {
      navigate(`/player-results/${code}`);
    }
  }, [session?.status, code, navigate]);

  const BADGE_COLORS = ['#1CB0F6','#CE82FF','#58CC02','#FFC800','#FF86C8','#FF9600'];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0D1A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div className="card animate-fade-scale" style={{ width: '100%', maxWidth: 420, padding: 36, textAlign: 'center' }}>
        {/* Rocket animation */}
        <div className="animate-float" style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>

        <h2 style={{ fontWeight: 900, fontSize: 26, color: '#E8E6F0', marginBottom: 8 }}>
          You're in, {myName}!
        </h2>
        <p style={{ color: '#8A89A0', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
          Waiting for the host to start...
        </p>
        {theme && (
          <div style={{
            background: '#1CB0F622', border: '1px solid #1CB0F644',
            borderRadius: 10, padding: '6px 14px', display: 'inline-block',
            color: '#1CB0F6', fontWeight: 800, fontSize: 13, marginTop: 8, marginBottom: 24,
          }}>
            🎯 {theme.name}
          </div>
        )}

        {/* Pulsing dots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 12, height: 12, borderRadius: '50%', background: '#1CB0F6',
                animation: `pulse-glow 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Players */}
        <p style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          {players.length} player{players.length !== 1 ? 's' : ''} in lobby
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {players.map((player, i) => (
            <div
              key={player.id}
              style={{
                background: BADGE_COLORS[i % BADGE_COLORS.length] + '22',
                border: `1px solid ${BADGE_COLORS[i % BADGE_COLORS.length]}55`,
                color: BADGE_COLORS[i % BADGE_COLORS.length],
                borderRadius: 20,
                padding: '5px 14px',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {player.name} {player.name === myName ? '(you)' : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
