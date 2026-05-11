import { colors, fonts, paperBg } from '../utils/theme';
import { restartGame, backToLobby, leaveRoom } from '../firebase/room';
import { ROLE_LABELS } from '../utils/game';

export default function GameOver({ room, roomCode, playerId }) {
  const isHost = room.hostId === playerId;
  const me = room.players?.[playerId];
  const myRole = me?.role;

  function handleRestart() {
    restartGame(roomCode);
  }

  function handleLobby() {
    backToLobby(roomCode);
  }

  function handleLeave() {
    leaveRoom(roomCode, playerId);
  }

  return (
    <div style={{ height: '100vh', width: '100vw', ...paperBg, padding: 24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: colors.muted }}>GAME OVER</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.ink, marginTop: 10, lineHeight: 1.3, fontFamily: fonts.display }}>
          한 판이 끝났어요
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ position: 'relative' }}>
          <svg width="160" height="140" viewBox="0 0 200 160">
            <ellipse cx="100" cy="120" rx="60" ry="8" fill="#000" opacity="0.15" />
            <ellipse cx="100" cy="115" rx="60" ry="10" fill="#8B6940" />
            <path d="M50 110 L150 110 L160 60 L40 60 Z" fill={colors.cheese} stroke={colors.cheeseDark} strokeWidth="2" />
            <path d="M50 110 L150 110 L150 118 L50 118 Z" fill="#D4A847" stroke={colors.cheeseDark} strokeWidth="2" />
            <ellipse cx="70" cy="85" rx="6" ry="5" fill={colors.cheeseDark} />
            <ellipse cx="105" cy="78" rx="5" ry="4" fill={colors.cheeseDark} />
            <ellipse cx="130" cy="92" rx="5" ry="4" fill={colors.cheeseDark} />
            <text x="40" y="40" fontSize="24" fill={colors.hint} fontWeight="700">?</text>
            <text x="155" y="35" fontSize="20" fill={colors.hint} fontWeight="700">?</text>
            <text x="20" y="80" fontSize="18" fill={colors.hint} fontWeight="700">?</text>
            <text x="170" y="80" fontSize="16" fill={colors.hint} fontWeight="700">?</text>
          </svg>
        </div>

        {myRole && (
          <div
            style={{
              marginTop: 16,
              padding: '10px 16px',
              background: colors.paper,
              borderRadius: 12,
              border: `0.5px solid ${colors.hint}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 10, color: colors.muted }}>당신의 역할</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: colors.ink, marginTop: 4 }}>{ROLE_LABELS[myRole]}</div>
          </div>
        )}

        <div style={{ marginTop: 24, fontSize: 12, color: colors.muted, textAlign: 'center', fontStyle: 'italic', lineHeight: 1.7, padding: '0 24px' }}>
          "누가 진짜 도둑이었을까요?<br />한 번 더 해볼래요?"
        </div>
      </div>

      {isHost ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleRestart}
            style={{
              padding: '14px',
              background: colors.cheese,
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              color: colors.ink,
              fontFamily: fonts.body,
            }}
          >
            🔄 다시하기 (역할 재분배)
          </button>
          <button
            onClick={handleLobby}
            style={{
              padding: '10px',
              background: 'transparent',
              border: `0.5px solid ${colors.hint}`,
              borderRadius: 10,
              fontSize: 12,
              color: colors.ink,
              fontFamily: fonts.body,
            }}
          >
            로비로 돌아가기
          </button>
        </div>
      ) : (
        <div style={{ padding: 14, background: colors.paper, borderRadius: 10, textAlign: 'center', border: `0.5px solid ${colors.hint}` }}>
          <div style={{ fontSize: 12, color: colors.muted }}>방장이 다시 시작할 때까지 기다려주세요</div>
          <button
            onClick={handleLeave}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              background: 'transparent',
              border: 'none',
              fontSize: 11,
              color: colors.muted,
              fontFamily: fonts.body,
            }}
          >
            방 나가기
          </button>
        </div>
      )}
    </div>
  );
}
