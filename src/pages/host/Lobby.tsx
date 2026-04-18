import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useThemes } from '../../hooks/useThemes';
import { usePlayersListener, createSession, updateSessionStatus } from '../../hooks/useSession';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { playJoin } from '../../components/SoundEffects';
import ModerationPanel from '../../components/ModerationPanel';

export default function Lobby() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { themes } = useThemes();
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const prevCountRef = useRef(0);

  const theme = themes.find((t) => t.id === themeId) ?? null;
  const { players } = usePlayersListener(sessionCode ?? '');

  useEffect(() => {
    if (!themeId) return;
    const hostId = `host-${Date.now()}`;
    createSession(themeId, hostId).then((code) => {
      setSessionCode(code);
      localStorage.setItem('bingolive_host_code', code);
    });
  }, [themeId]);

  useEffect(() => {
    if (players.length > prevCountRef.current) {
      playJoin();
    }
    prevCountRef.current = players.length;
  }, [players.length]);

  async function handleStart() {
    if (!sessionCode) return;
    setStarting(true);
    await updateSessionStatus(sessionCode, 'playing');
    navigate(`/host/game/${sessionCode}`);
  }

  const joinUrl = sessionCode
    ? `${window.location.origin}/play/${sessionCode}`
    : '';

  const BADGE_COLORS = ['#1CB0F6','#CE82FF','#58CC02','#FFC800','#FF86C8','#FF9600','#FF86C8'];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0D1A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/host/themes')}
        style={{
          position: 'absolute', top: 20, left: 20,
          background: 'none', border: 'none', color: '#8A89A0', cursor: 'pointer', fontSize: 22,
        }}
      >
        ← Back
      </button>

      {/* Moderation */}
      {sessionCode && (
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <ModerationPanel code={sessionCode} players={players} />
        </div>
      )}

      {!sessionCode ? (
        <p style={{ color: '#8A89A0', fontSize: 20, fontWeight: 700 }}>Creating session...</p>
      ) : (
        <div className="animate-fade-scale" style={{ textAlign: 'center', width: '100%', maxWidth: 700 }}>
          {/* Theme name */}
          <div style={{
            background: '#1CB0F622',
            border: '1px solid #1CB0F644',
            borderRadius: 12,
            padding: '8px 20px',
            display: 'inline-block',
            color: '#1CB0F6',
            fontWeight: 800,
            fontSize: 15,
            marginBottom: 24,
          }}>
            🎯 {theme?.name ?? 'Loading theme...'}
          </div>

          {/* Session Code */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ color: '#8A89A0', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
              Session Code
            </p>
            <div style={{
              fontSize: 'clamp(60px, 12vw, 96px)',
              fontWeight: 900,
              letterSpacing: 12,
              color: '#FFC800',
              textShadow: '0 0 32px rgba(255,200,0,0.5)',
              lineHeight: 1,
            }}>
              {sessionCode}
            </div>
          </div>

          {/* QR Code */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <QRCodeDisplay url={joinUrl} size={200} />
          </div>

          <p style={{ color: '#8A89A0', fontWeight: 600, fontSize: 14, marginBottom: 32 }}>
            Scan the QR code or go to <strong style={{ color: '#1CB0F6' }}>{window.location.host}</strong> and enter code: <strong style={{ color: '#FFC800' }}>{sessionCode}</strong>
          </p>

          {/* Players */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ color: '#8A89A0', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
              {players.length} player{players.length !== 1 ? 's' : ''} connected
            </p>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
              minHeight: 48,
            }}>
              {players.map((player, i) => (
                <div
                  key={player.id}
                  className="animate-pop-in"
                  style={{
                    background: BADGE_COLORS[i % BADGE_COLORS.length] + '22',
                    border: `1px solid ${BADGE_COLORS[i % BADGE_COLORS.length]}55`,
                    color: BADGE_COLORS[i % BADGE_COLORS.length],
                    borderRadius: 20,
                    padding: '6px 16px',
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {player.name}
                </div>
              ))}
            </div>
          </div>

          {/* Start button */}
          {players.length >= 1 && (
            <button
              onClick={handleStart}
              disabled={starting}
              className="btn-3d animate-pulse-glow"
              style={{
                background: '#58CC02',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                padding: '20px 48px',
                fontSize: 22,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 6px 0 #3a8800',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              {starting ? 'Starting...' : '🚀 Start Game!'}
            </button>
          )}
          {players.length === 0 && (
            <p style={{ color: '#8A89A0', fontWeight: 600, fontSize: 15, marginTop: 8 }}>
              Waiting for players to join...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
