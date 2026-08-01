import { NUMBER_LETTERS, getNumberColumn } from '../utils/numberTheme';
import type { ThemeItem } from '../types';

interface CalledStonesProps {
  calledItems: number[];
  items: ThemeItem[];
}

const COLUMN_COLORS = ['#1CB0F6', '#CE82FF', '#58CC02', '#FFC800', '#FF86C8'];

export default function CalledStones({ calledItems, items }: CalledStonesProps) {
  const numbers = calledItems
    .map((idx) => Number(items[idx]?.word))
    .filter((n) => !Number.isNaN(n));

  const byColumn: Record<string, number[]> = {};
  for (const n of numbers) {
    const letter = getNumberColumn(n);
    if (!letter) continue;
    if (!byColumn[letter]) byColumn[letter] = [];
    byColumn[letter].push(n);
  }

  NUMBER_LETTERS.forEach((letter) => {
    if (byColumn[letter]) {
      byColumn[letter].sort((a, b) => a - b);
    } else {
      byColumn[letter] = [];
    }
  });

  return (
    <div style={{ marginTop: 24 }}>
      <p style={{
        color: '#8A89A0', fontSize: 12, fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
      }}>
        Pedras chamadas
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 10,
      }}>
        {NUMBER_LETTERS.map((letter, i) => (
          <div key={letter} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 22, fontWeight: 900,
              color: COLUMN_COLORS[i],
              marginBottom: 10,
            }}>
              {letter}
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              justifyContent: 'center',
              alignContent: 'flex-start',
            }}>
              {byColumn[letter].map((n) => (
                <div
                  key={n}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: COLUMN_COLORS[i],
                    color: '#0B0D1A',
                    fontWeight: 900,
                    fontSize: 15,
                    fontFamily: 'Nunito, sans-serif',
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
