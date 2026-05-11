import { useState, useEffect } from 'react';
import { colors, fonts } from '../utils/theme';
import { setPhase } from '../firebase/room';
import { GAME_PHASE, ROLES, ROLE_LABELS } from '../utils/game';
import MouseAvatar from '../components/MouseAvatar';

// 역할 카드 확인 화면
export default function RoleReveal({ room, roomCode, playerId }) {
  const [revealed, setRevealed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const me = room.players?.[playerId];
  const role = me?.role;
  const isHost = room.hostId === playerId;

  // 모든 플레이어 (치즈 단말 제외)가 확인 완료했는지 체크는 못 하니 호스트가 진행
  useEffect(() => {
    if (confirmed && isHost) {
      // 호스트는 모두 확인했다고 가정하고 1.5초 후 주사위로
      const t = setTimeout(() => {
        setPhase(roomCode, GAME_PHASE.DICE_ROLL);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [confirmed, isHost, roomCode]);

  if (!role) {
    return (
      <div style={{ height: '100vh', background: colors.midnight, color: colors.midnightText, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>잠시만요...</div>
      </div>
    );
  }

  const roleColor =
    role === ROLES.THIEF ? colors.cheese : role === ROLES.TROLL ? colors.troll : colors.sage;
  // 카드 뒤집기 전까지는 모두 동일한 배경 (옆사람 눈치 못 채게)
  // 카드 뒤집은 후에는 본인만 보는 상태이므로 역할별 색상 적용 가능
  const isDark = revealed && role === ROLES.THIEF;

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        background: isDark ? colors.midnight : colors.cream,
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
        animation: 'fadeIn 0.5s',
        transition: 'background 0.4s',
      }}
    >
      <div style={{ paddingTop: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: isDark ? colors.midnightText : colors.muted }}>YOUR ROLE</div>
        <div style={{ fontSize: 11, color: isDark ? colors.midnightText : colors.muted, marginTop: 4 }}>{revealed ? '아무에게도 보여주지 마세요' : '아무에게도 보여주지 마세요'}</div>
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
              background: isDark ? colors.midnightLight : colors.paper,
              border: `1.5px solid ${roleColor}`,
              borderRadius: 18,
              textAlign: 'center',
              animation: 'slideUp 0.4s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <MouseAvatar role={role} size={96} color={role === ROLES.THIEF ? colors.thief : role === ROLES.TROLL ? colors.avatarColors[1] : colors.avatarColors[0]} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: roleColor, marginBottom: 10, fontFamily: fonts.display }}>
              {ROLE_LABELS[role]}
            </div>
            <div style={{ fontSize: 12, color: isDark ? colors.midnightText : colors.ink, lineHeight: 1.6, padding: '0 8px' }}>
              {role === ROLES.THIEF && '당신의 시간이 호명되면 일어나 중앙의 치즈를 가져가세요.'}
              {role === ROLES.SLEEPYHEAD && '도둑을 찾아내세요. 본인 시간에 혼자라면 옆 사람 폰을 들춰볼 수 있어요.'}
              {role === ROLES.TROLL && '잠꾸러기처럼 행동하되, 의심을 자기에게 끌어모으세요. 도둑으로 지목받으면 단독 승리!'}
            </div>

            {role === ROLES.THIEF && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `0.5px solid ${colors.midnightBorder}` }}>
                <div style={{ fontSize: 10, color: colors.midnightText, lineHeight: 1.5 }}>
                  목격자가 있으면<br />한 명을 공범으로 만들 수 있어요
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {revealed && (
        <button
          onClick={() => setConfirmed(true)}
          disabled={confirmed}
          style={{
            padding: '14px',
            background: confirmed ? colors.hint : colors.cheese,
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            color: colors.ink,
            fontFamily: fonts.body,
            opacity: confirmed ? 0.6 : 1,
          }}
        >
          {confirmed ? '✓ 확인 완료' : '확인했어요'}
        </button>
      )}

      {confirmed && isHost && (
        <div style={{ marginTop: 8, fontSize: 10, color: isDark ? colors.midnightSub : colors.muted, textAlign: 'center' }}>
          모두 확인했다면 다음 단계로 이동합니다...
        </div>
      )}

      {confirmed && !isHost && (
        <div style={{ marginTop: 8, fontSize: 10, color: isDark ? colors.midnightSub : colors.muted, textAlign: 'center' }}>
          방장이 다음 단계로 이동시킬 거에요
        </div>
      )}
    </div>
  );
}
