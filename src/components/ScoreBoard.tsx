import type { Player } from '../types';

interface ScoreBoardProps {
  players: Player[];
  highlightId?: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#FFC800', '#8A89A0', '#FF9600'];

export default function ScoreBoard({ players, highlightId }: ScoreBoardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map((player, i) => {
        const isHighlight = player.id === highlightId;
        const isTop3 = i < 3;
        return (
          <div
            key={player.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: isHighlight ? 'rgba(28,176,246,0.15)' : '#151933',
              border: `1px solid ${isHighlight ? '#1CB0F6' : '#2A2F52'}`,
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{ fontSize: 20, minWidth: 28 }}>
              {isTop3 ? MEDALS[i] : `${i + 1}`}
            </span>
            <span
              style={{
                flex: 1,
                fontWeight: 700,
                color: isTop3 ? MEDAL_COLORS[i] : '#E8E6F0',
                fontSize: 14,
              }}
            >
              {player.name}
              {player.bingo && (
                <span style={{ marginLeft: 6, color: '#58CC02', fontSize: 12 }}>
                  ✓ {player.bingoType === 'full' ? 'Cartela Cheia' : player.bingoType === 'corners' ? '4 Cantos' : 'Fileira'}
                </span>
              )}
            </span>
            <span
              style={{
                fontWeight: 900,
                fontSize: 18,
                color: '#1CB0F6',
              }}
            >
              {player.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
