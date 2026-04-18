import type { ThemeItem } from '../types';

interface ClueDisplayProps {
  clue: ThemeItem | null;
  isRevealed: boolean;
  onReveal?: () => void;
  onHide?: () => void;
  large?: boolean;
}

export default function ClueDisplay({ clue, isRevealed, onReveal, onHide, large }: ClueDisplayProps) {

  if (!clue) {
    return (
      <div
        style={{
          padding: '32px 24px',
          borderRadius: 16,
          background: '#151933',
          border: '1px solid #2A2F52',
          textAlign: 'center',
          color: '#8A89A0',
          fontSize: large ? 24 : 18,
          fontWeight: 700,
        }}
      >
        Waiting for first clue...
      </div>
    );
  }

  function handleReveal() {
    onReveal?.();
  }

  function handleHide() {
    onHide?.();
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        className="animate-slide-down"
        style={{
          padding: large ? '40px 32px' : '24px 20px',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #1a1f42, #1e2346)',
          border: '2px solid #1CB0F6',
          boxShadow: '0 0 24px 4px rgba(28,176,246,0.2)',
          marginBottom: 16,
        }}
      >
        <div style={{ color: '#8A89A0', fontSize: large ? 16 : 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 2 }}>
          CLUE
        </div>
        <div
          style={{
            color: '#CE82FF',
            fontSize: large ? 42 : 22,
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          {clue.clue}
        </div>
      </div>

      {isRevealed ? (
        <div style={{ position: 'relative' }}>
          <div
            className="animate-pop-in"
            style={{
              padding: large ? '28px 32px' : '16px 20px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #0d1f0d, #1a3a1a)',
              border: '2px solid #58CC02',
              boxShadow: '0 0 20px 4px rgba(88,204,2,0.2)',
            }}
          >
            <div style={{ color: '#8A89A0', fontSize: large ? 14 : 12, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 2 }}>
              ANSWER
            </div>
            <div style={{ color: '#58CC02', fontSize: large ? 48 : 28, fontWeight: 900 }}>
              {clue.word}
            </div>
          </div>
          <button
            onClick={handleHide}
            style={{
              position: 'absolute', top: 10, right: 12,
              background: 'none', border: 'none',
              color: '#8A89A0', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
            }}
          >
            🙈 Ocultar
          </button>
        </div>
      ) : (
        <button
          onClick={handleReveal}
          className="btn-3d"
          style={{
            background: '#2A2F52',
            border: '1px solid #3a4066',
            color: '#8A89A0',
            fontSize: large ? 16 : 14,
            fontWeight: 700,
            padding: '12px 28px',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          Reveal Answer
        </button>
      )}
    </div>
  );
}
