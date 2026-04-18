import { useParams, useNavigate, useEffect, useState } from 'react';
import { usePlayersListener, useSessionListener } from '../../hooks/useSession';
import { useThemes } from '../../hooks/useThemes';
import Confetti from '../../components/Confetti';

function getPersonalMessage(rank: number, total: number): string {
  if (rank === 1) return '🏆 Champion! You won!';
  if (rank <= 3) return '🥈 Amazing! Almost there!';
  if (rank <= Math.ceil(total / 2)) return '⭐ Great job!';
  return '🚀 Keep practicing!';
}

export default function PlayerResults() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { session } = useSessionListener(code ?? '');
  const { players } = usePlayersListener(code ?? '');
  const { themes } = useThemes();

  const playerId = localStorage.getItem('bingolive_player_id') ?? '';
  const myName = localStorage.getItem('bingolive_player_name') ?? '';
  const theme = session ? themes.find((t) => t.id === session.themeId) : null;

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const myPlayer = players.find((p) => p.id === playerId);
  const myRank = sorted.findIndex((p) => p.id === playerId) + 1;
  const message = getPersonalMessage(myRank, players.length);
  const isWinner = myRank === 1;

  if (!myPlayer) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0D1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8A89A0', fontSize: 18, fontWeight: 700 }}>Loading results...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D1A', padding: '32px 16px' }}>
      <Confetti isActive={isWinner} duration={5000} />

      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        {/* Message */}
        <div className="animate-pop-in" style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{message.split(' ')[0]}</div>
          <h1 style={{ fontWeight: 900, fontSize: 28, color: '#E8E6F0', margin: '0 0 8px' }}>
            {message.substring(message.indexOf(' ') + 1)}
          </h1>
          <p style={{ color: '#8A89A0', fontWeight: 600, fontSize: 15 }}>
            {myName} · {theme?.name}
          </p>
        </div>

        {/* Score + Rank card */}
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <div style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                Final Score
              </div>
              <div style={{ color: '#1CB0F6', fontSize: 40, fontWeight: 900 }}>{myPlayer.score}</div>
            </div>
            <div>
              <div style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                Rank
              </div>
              <div style={{ color: '#FFC800', fontSize: 40, fontWeight: 900 }}>
                #{myRank}
              </div>
            </div>
            <div>
              <div style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                Marked
              </div>
              <div style={{ color: '#58CC02', fontSize: 40, fontWeight: 900 }}>
                {myPlayer.marked.length}
              </div>
            </div>
          </div>
        </div>

        {/* Board Review */}
        {theme && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ color: '#8A89A0', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Your Board
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 6,
            }}>
              {myPlayer.board.map((itemIdx, pos) => {
                const item = theme.items[itemIdx];
                const isMarked = myPlayer.marked.includes(itemIdx);
                const wasCalled = session?.calledItems?.includes(itemIdx);
                const isCorrect = isMarked && wasCalled;
                return (
                  <div
                    key={pos}
                    style={{
                      background: isCorrect
                        ? '#58CC0222'
                        : isMarked
                        ? '#FF4B4B22'
                        : '#151933',
                      border: `1px solid ${isCorrect ? '#58CC02' : isMarked ? '#FF4B4B' : '#2A2F52'}`,
                      borderRadius: 10,
                      padding: '8px 4px',
                      textAlign: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                      color: isCorrect ? '#58CC02' : isMarked ? '#FF4B4B' : '#8A89A0',
                      minHeight: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item?.word ?? '?'}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/play')}
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
