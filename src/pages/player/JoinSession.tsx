import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, ref } from 'firebase/database';
import { db } from '../../firebase';
import { useThemes } from '../../hooks/useThemes';
import { joinSession } from '../../hooks/useSession';
import { containsBadWord } from '../../utils/filterName';

export default function JoinSession() {
  const { code: paramCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { themes } = useThemes();

  const [code, setCode] = useState(paramCode?.toUpperCase() ?? '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleJoin() {
    setError('');
    const trimCode = code.trim().toUpperCase();
    const trimName = name.trim();
    if (trimCode.length !== 6) { triggerError('Enter a valid 6-character code.'); return; }
    if (!trimName) { triggerError('Please enter your name.'); return; }
    if (containsBadWord(trimName)) { triggerError('Nome inválido. Por favor, escolha outro nome.'); return; }
    setLoading(true);
    try {
      const snap = await get(ref(db, `sessions/${trimCode}`));
      if (!snap.exists()) { triggerError("Session not found. Check the code."); setLoading(false); return; }
      const session = snap.val();
      if (session.status !== 'waiting' && session.status !== 'playing') { triggerError("This session has already ended."); setLoading(false); return; }
      const theme = themes.find((t) => t.id === session.themeId);
      if (!theme) { triggerError("Theme not loaded. Try again."); setLoading(false); return; }
      const playerId = await joinSession(trimCode, trimName, theme);
      if (!playerId) { triggerError("Failed to join. Try again."); setLoading(false); return; }
      localStorage.setItem('bingolive_player_id', playerId);
      localStorage.setItem('bingolive_player_name', trimName);
      localStorage.setItem('bingolive_player_code', trimCode);
      if (session.status === 'playing') {
        navigate(`/board/${trimCode}`);
      } else {
        navigate(`/waiting/${trimCode}`);
      }
    } catch {
      triggerError('Connection error. Check your internet.');
      setLoading(false);
    }
  }

  function triggerError(msg: string) {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

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
      <div
        className="card animate-fade-scale"
        style={{ width: '100%', maxWidth: 420, padding: 36 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
          <h1 style={{ fontWeight: 900, fontSize: 32, color: '#E8E6F0', margin: 0 }}>BingoLive</h1>
          <p style={{ color: '#8A89A0', fontWeight: 600, fontSize: 14, marginTop: 6 }}>
            Enter the session code to join
          </p>
        </div>

        {/* Code Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
            Session Code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="ABC123"
            maxLength={6}
            inputMode="text"
            autoCapitalize="characters"
            className={shake ? 'animate-shake' : ''}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 8,
              background: '#0B0D1A',
              border: `2px solid ${error ? '#FF4B4B' : '#2A2F52'}`,
              borderRadius: 14,
              padding: '16px 20px',
              color: '#E8E6F0',
              fontSize: 28,
              fontWeight: 900,
              fontFamily: 'Nunito, sans-serif',
              textAlign: 'center',
              letterSpacing: 8,
              outline: 'none',
              minHeight: 64,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Name Input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
            Your Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Enter your nickname"
            autoComplete="nickname"
            style={{
              display: 'block',
              width: '100%',
              marginTop: 8,
              background: '#0B0D1A',
              border: '2px solid #2A2F52',
              borderRadius: 14,
              padding: '16px 20px',
              color: '#E8E6F0',
              fontSize: 18,
              fontWeight: 700,
              fontFamily: 'Nunito, sans-serif',
              outline: 'none',
              minHeight: 56,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <p style={{ color: '#FF4B4B', fontWeight: 700, fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleJoin}
          disabled={loading}
          className="btn-3d"
          style={{
            background: '#58CC02',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '18px 32px',
            fontSize: 20,
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 6px 0 #3a8800',
            width: '100%',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {loading ? 'Joining...' : '🎮 Join!'}
        </button>

        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', color: '#8A89A0',
            cursor: 'pointer', fontWeight: 700, fontSize: 14,
            marginTop: 16, width: '100%', fontFamily: 'Nunito, sans-serif',
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
