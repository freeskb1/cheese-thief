import { useState } from 'react';
import { colors, fonts, paperBg } from '../utils/theme';
import { setPhase, setPlayerReady } from '../firebase/room';
import { GAME_PHASE, ROLES, ROLE_LABELS } from '../utils/game';
import MouseAvatar from '../components/MouseAvatar';

// 역할 카드 확인 화면 — 모든 사람 동일 배경/카드, 차이는 카드 내부(이모티콘+글씨)만
export default function RoleReveal({ room, roomCode, playerId }) {
  const [revealed, setRevealed] = useState(false);
  const me = room.players?.[playerId];
  const role = me?.role;
  const ready = !!me?.ready;
  const isHost = room.hostId === playerId;

  // 호스트가 다음 단계로 진행
  function handleNext() {
    setPhase(roomCode, GAME_PHASE.DICE_ROLL);
  }

  // "확인했어요" 클릭 — Firebase에 ready 표시
  function handleConfirm() {
    setPlayerReady(roomCode, playerId, true);
  }

  // 모든 참가자(치즈 단말 제외)가 ready인지 체크
  const participants = Object.entries(room.players || {})
    .filter(([id]) => id !== room.cheesePlayerId);
  const readyCount = participants.filter(([, p]) => p.ready).length;
  const totalCount = participants.length;
  const allReady = readyCount === totalCount && totalCount > 0;

  if (!role) {
    return (
      <div style={{ height: '100vh', ...paperBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: colors.muted }}>잠시만요...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        ...paperBg,
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
        animation: 'fadeIn 0.5s',
      }}
    >
      <div style={{ paddingTop: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: colors.muted }}>YOUR ROLE</div>
        <div style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>아무에게도 보여주지 마세요</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            style={{
              width: '85%',
              maxWidth: 320,
              aspectRatio: '3/4',
              background: colors.paper,
              border: `1.5px solid ${colors.hint}`,
              borderRadius: 18,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 20,
              fontFamily: fonts.body,
            }}
          >
            <div style={{ fontSize: 60 }}>🎭</div>
            <div style={{ fontSize: 14, color: colors.ink, marginTop: 16, fontWeight: 700 }}>
              탭해서 역할 확인
            </div>
            <div style={{ fontSize: 11, color: colors.muted, marginTop: 8 }}>
              주변에 누가 보고 있지 않은지 확인하세요
            </div>
          </button>
        ) : (
          <div
            style={{
              width: '85%',
              maxWidth: 320,
              padding: 24,
              background: colors.paper,
              border: `1.5px solid ${colors.hint}`,
              borderRadius: 18,
              textAlign: 'center',
              animation: 'slideUp 0.4s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <MouseAvatar
                role={role}
                size={96}
                color={role === ROLES.THIEF ? colors.thief : role === ROLES.TROLL ? colors.avatarColors[1] : colors.avatarColors[0]}
              />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink, marginBottom: 10, fontFamily: fonts.display }}>
              {ROLE_LABELS[role]}
            </div>
            <div style={{ fontSize: 12, color: colors.ink, lineHeight: 1.6, padding: '0 8px' }}>
              {role === ROLES.THIEF && '당신의 시간이 호명되면 일어나 중앙의 치즈를 가져가세요.'}
              {role === ROLES.SLEEPYHEAD && '도둑을 찾아내세요. 본인 시간에 혼자라면 옆 사람 폰을 들춰볼 수 있어요.'}
              {role === ROLES.TROLL && '잠꾸러기처럼 행동하되, 의심을 자기에게 끌어모으세요. 도둑으로 지목받으면 단독 승리!'}
            </div>

            {role === ROLES.THIEF && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `0.5px solid ${colors.hint}` }}>
                <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.5 }}>
                  목격자가 있으면<br />한 명을 공범으로 만들 수 있어요
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {revealed && !ready && (
        <button
          onClick={handleConfirm}
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
          확인했어요
        </button>
      )}

      {ready && !isHost && (
        <div style={{ padding: 14, background: colors.paper, borderRadius: 12, border: `0.5px solid ${colors.hint}`, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: colors.muted }}>
            ✓ 확인 완료 · 방장이 시작할 때까지 기다려주세요
          </div>
          <div style={{ fontSize: 10, color: colors.muted, marginTop: 4 }}>
            ({readyCount}/{totalCount}명 확인)
          </div>
        </div>
      )}

      {ready && isHost && (
        <button
          onClick={handleNext}
          style={{
            padding: '14px',
            background: allReady ? colors.cheese : colors.hint,
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            color: colors.ink,
            fontFamily: fonts.body,
            opacity: allReady ? 1 : 0.7,
          }}
        >
          {allReady ? '🎲 주사위로 진행 →' : `대기 중 (${readyCount}/${totalCount}) — 강제 진행`}
        </button>
      )}
    </div>
  );
}
