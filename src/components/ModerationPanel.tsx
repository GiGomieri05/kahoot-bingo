import { useState } from 'react';
import { kickPlayer } from '../hooks/useSession';
import { containsBadWord } from '../utils/filterName';
import type { Player } from '../types';

interface ModerationPanelProps {
  code: string;
  players: Player[];
}

export default function ModerationPanel({ code, players }: ModerationPanelProps) {
  const [open, setOpen] = useState(false);
  const [kicking, setKicking] = useState<string | null>(null);
  const [kicked, setKicked] = useState<Set<string>>(new Set());

  const flagged = players.filter((p) => containsBadWord(p.name));
  const hasFlags = flagged.length > 0;

  async function handleKick(playerId: string) {
    setKicking(playerId);
    await kickPlayer(code, playerId);
    setKicked((prev) => new Set(prev).add(playerId));
    setKicking(null);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: hasFlags ? '#FF4B4B22' : '#2A2F5288',
          border: `1px solid ${hasFlags ? '#FF4B4B88' : '#3a4066'}`,
          color: hasFlags ? '#FF4B4B' : '#8A89A0',
          borderRadius: 10,
          padding: '8px 14px',
          fontWeight: 800,
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        🛡️ Moderação
        {hasFlags && (
          <span style={{
            background: '#FF4B4B',
            color: '#fff',
            borderRadius: '50%',
            width: 18,
            height: 18,
            fontSize: 11,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {flagged.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '110%',
          right: 0,
          background: '#151933',
          border: '1px solid #2A2F52',
          borderRadius: 14,
          padding: 20,
          minWidth: 320,
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: '#E8E6F0', fontWeight: 900, fontSize: 15 }}>🛡️ Painel de Moderação</span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#8A89A0', cursor: 'pointer', fontSize: 18 }}
            >✕</button>
          </div>

          {players.length === 0 ? (
            <p style={{ color: '#8A89A0', fontSize: 13, fontWeight: 600 }}>Nenhum jogador conectado.</p>
          ) : (
            <>
              {hasFlags && (
                <div style={{
                  background: '#FF4B4B11', border: '1px solid #FF4B4B44',
                  borderRadius: 10, padding: '8px 12px', marginBottom: 12,
                  color: '#FF4B4B', fontSize: 12, fontWeight: 700,
                }}>
                  ⚠️ {flagged.length} nome(s) com conteúdo impróprio detectado(s)
                </div>
              )}

              <p style={{ color: '#8A89A0', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Todos os jogadores
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {players.map((p) => {
                  const isFlagged = containsBadWord(p.name);
                  const wasKicked = kicked.has(p.id);
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: isFlagged ? '#FF4B4B11' : '#0B0D1A',
                        border: `1px solid ${isFlagged ? '#FF4B4B44' : '#2A2F52'}`,
                        borderRadius: 10,
                        padding: '8px 12px',
                      }}
                    >
                      <span style={{
                        flex: 1,
                        fontWeight: 700,
                        fontSize: 14,
                        color: isFlagged ? '#FF4B4B' : '#E8E6F0',
                        wordBreak: 'break-all',
                      }}>
                        {isFlagged && '⚠️ '}{p.name}
                      </span>
                      <span style={{ color: '#8A89A0', fontSize: 12, fontWeight: 600 }}>
                        {p.score}pts
                      </span>
                      <button
                        onClick={() => handleKick(p.id)}
                        disabled={kicking === p.id || wasKicked}
                        style={{
                          background: wasKicked ? '#2A2F52' : '#FF4B4B22',
                          border: `1px solid ${wasKicked ? '#3a4066' : '#FF4B4B66'}`,
                          color: wasKicked ? '#8A89A0' : '#FF4B4B',
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: wasKicked ? 'default' : 'pointer',
                          fontFamily: 'Nunito, sans-serif',
                        }}
                      >
                        {wasKicked ? '✓ Removido' : kicking === p.id ? '...' : 'Remover'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
