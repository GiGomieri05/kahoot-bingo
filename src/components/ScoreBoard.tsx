import type { Player } from '../types';
import type { NearBingoType } from '../utils/validateBingo';

interface ScoreBoardProps {
  players: Player[];
  highlightId?: string;
  nearBingoMap?: Map<string, NearBingoType>;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#FFC800', '#8A89A0', '#FF9600'];

const NEAR_LABEL: Record<string, string> = {
  full: '🃏 Full',
  corners: '⬛ Corners',
  line: '➡️ Line',
};

const NEAR_COLOR: Record<string, string> = {
  full:    '#FF86C8',
  corners: '#FF9600',
  line:    '#CE82FF',
};

export default function ScoreBoard({ players, highlightId, nearBingoMap }: ScoreBoardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map((player, i) => {
        const isHighlight = player.id === highlightId;
        const nearType = nearBingoMap?.get(player.id) ?? null;
        const isTop3 = i < 3;
        const accentColor = nearType ? NEAR_COLOR[nearType] : isHighlight ? '#1CB0F6' : null;
        return (
          <div
            key={player.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: nearType
                ? `${NEAR_COLOR[nearType]}18`
                : isHighlight ? 'rgba(28,176,246,0.15)' : '#151933',
              border: `1px solid ${accentColor ?? '#2A2F52'}`,
              transition: 'all 0.3s ease',
              boxShadow: nearType ? `0 0 10px 1px ${NEAR_COLOR[nearType]}44` : undefined,
            }}
          >
            <span style={{ fontSize: 20, minWidth: 28 }}>
              {isTop3 ? MEDALS[i] : `${i + 1}`}
            </span>
            <span
              style={{
                flex: 1,
                fontWeight: 700,
                color: nearType ? NEAR_COLOR[nearType] : isTop3 ? MEDAL_COLORS[i] : '#E8E6F0',
                fontSize: 14,
              }}
            >
              {player.name}
              {player.bingo && (
                <span style={{ marginLeft: 6, color: '#58CC02', fontSize: 12 }}>
                  ✓ {player.bingoType === 'full' ? 'Full Card' : player.bingoType === 'corners' ? '4 Corners' : 'Line'}
                </span>
              )}
              {nearType && !player.bingo && (
                <span style={{
                  marginLeft: 6, fontSize: 11, fontWeight: 900,
                  color: NEAR_COLOR[nearType],
                  background: `${NEAR_COLOR[nearType]}22`,
                  border: `1px solid ${NEAR_COLOR[nearType]}55`,
                  borderRadius: 6, padding: '1px 6px',
                }}>
                  {NEAR_LABEL[nearType]} ⚡
                </span>
              )}
            </span>
            <span
              style={{
                fontWeight: 900,
                fontSize: 18,
                color: nearType ? NEAR_COLOR[nearType] : '#1CB0F6',
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
