import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#1CB0F6','#CE82FF','#58CC02','#FFC800','#FF86C8'];
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  width: 4 + (i * 17 % 6),
  height: 4 + (i * 13 % 6),
  color: COLORS[i % 5],
  opacity: 0.3 + (i % 4) * 0.1,
  left: `${(i * 5 + 3) % 100}%`,
  top: `${(i * 7 + 11) % 100}%`,
  duration: `${3 + (i % 4)}s`,
  delay: `${(i % 3) * 0.5}s`,
}));

export default function Home() {
  const navigate = useNavigate();
  const particles = useMemo(() => PARTICLES, []);

  return (
    <div
      className="animate-fade-scale"
      style={{
        minHeight: '100vh',
        background: '#0B0D1A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: p.width,
              height: p.height,
              borderRadius: '50%',
              background: p.color,
              opacity: p.opacity,
              left: p.left,
              top: p.top,
              animation: `float ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48, zIndex: 1 }}>
        <div
          className="animate-float"
          style={{
            fontSize: 64,
            marginBottom: 8,
          }}
        >
          🎯
        </div>
        <h1
          style={{
            fontSize: 'clamp(48px, 10vw, 96px)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #1CB0F6, #CE82FF, #FF86C8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 4s ease infinite',
            lineHeight: 1,
            margin: 0,
          }}
        >
          BingoLive
        </h1>
        <p style={{
          color: '#8A89A0',
          fontSize: 18,
          fontWeight: 600,
          marginTop: 12,
        }}>
          Interactive classroom bingo — real time
        </p>
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
        maxWidth: 380,
        zIndex: 1,
      }}>
        <button
          className="btn-3d"
          onClick={() => navigate('/host/themes')}
          style={{
            background: '#1CB0F6',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '20px 32px',
            fontSize: 20,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 6px 0 #0a7ab8, 0 0 24px rgba(28,176,246,0.3)',
            fontFamily: 'Nunito, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          🎤 Host a Game
        </button>

        <button
          className="btn-3d"
          onClick={() => navigate('/play')}
          style={{
            background: '#58CC02',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '20px 32px',
            fontSize: 20,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 6px 0 #3a8800, 0 0 24px rgba(88,204,2,0.3)',
            fontFamily: 'Nunito, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          🎮 Join a Game
        </button>
      </div>

      {/* Footer */}
      <p style={{
        position: 'absolute',
        bottom: 24,
        color: '#8A89A0',
        fontSize: 14,
        fontWeight: 600,
        zIndex: 1,
      }}>
        Made for the classroom 🏫
      </p>
    </div>
  );
}
