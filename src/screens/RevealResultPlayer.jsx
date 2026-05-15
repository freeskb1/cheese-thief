import { colors, fonts, paperBg } from '../utils/theme';
import { ROLES, ROLE_LABELS } from '../utils/game';
import MouseAvatar from '../components/MouseAvatar';

// 역할 정렬 우선순위: 도둑 → 트롤 → 잠꾸러기
function rolePriority(role) {
  if (role === ROLES.THIEF) return 0;
  if (role === ROLES.TROLL) return 1;
  return 2;
}

// 결과 발표 화면 (개인 폰) — 도둑/트롤을 위에 큼지막하게, 잠꾸러기는 아래에
export default function RevealResultPlayer({ room, playerId }) {
  const participants = Object.entries(room.players || {})
    .filter(([id]) => id !== room.cheesePlayerId)
    .sort(([, a], [, b]) => rolePriority(a.role) - rolePriority(b.role));

  const me = room.players?.[playerId];
  const myRole = me?.role;

  const winners = participants.filter(([, p]) => p.role === ROLES.THIEF || p.role === ROLES.TROLL);
  const sleepyheads = participants.filter(([, p]) => !p.role || p.role === ROLES.SLEEPYHEAD);

  return (
    <div style={{ height: '100vh', width: '100vw', ...paperBg, padding: 20, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ paddingTop: 16, textAlign: 'center', flex: '0 0 auto' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: colors.muted }}>THE TRUTH</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink, marginTop: 8, fontFamily: fonts.display }}>
          진실의 시간!
        </div>
      </div>

      {myRole && (
        <div style={{ marginTop: 14, padding: '10px 12px', background: colors.paper, borderRadius: 10, border: `0.5px solid ${colors.hint}`, textAlign: 'center', flex: '0 0 auto' }}>
          <div style={{ fontSize: 10, color: colors.muted }}>당신은</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.ink, marginTop: 2 }}>
            {ROLE_LABELS[myRole]} 이었어요
          </div>
        </div>
      )}

      <div style={{ flex: '1 1 auto', overflow: 'auto', marginTop: 14 }}>
        {/* 도둑/트롤 (왕처럼 큰 카드 한 줄) */}
        {winners.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: 1.5, color: colors.muted, textAlign: 'center', marginBottom: 8 }}>
              👑 의심받지 않으려 했던 자
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: winners.length === 1 ? '1fr' : 'repeat(2, 1fr)',
              gap: 10,
            }}>
              {winners.map(([pid, p]) => (
                <BigRoleCard
                  key={pid}
                  player={p}
                  isMe={pid === playerId}
                />
              ))}
            </div>
          </div>
        )}

        {/* 잠꾸러기 (게임 시작 때처럼 작은 박스) */}
        {sleepyheads.length > 0 && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: 1.5, color: colors.muted, textAlign: 'center', marginBottom: 8 }}>
              잠꾸러기들
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6 }}>
              {sleepyheads.map(([pid, p]) => (
                <SmallPlayerCard
                  key={pid}
                  player={p}
                  isMe={pid === playerId}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, padding: 12, background: colors.paper, borderRadius: 10, border: `0.5px solid ${colors.hint}`, textAlign: 'center', flex: '0 0 auto' }}>
        <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.5 }}>
          누가 맞췄을까요?<br />
          방장 폰에서 다음 단계로 이동하세요
        </div>
      </div>
    </div>
  );
}

// 큰 역할 카드 (도둑/트롤 강조)
function BigRoleCard({ player, isMe }) {
  const role = player.role;
  const isThief = role === ROLES.THIEF;
  const isTroll = role === ROLES.TROLL;
  const cardColor = isThief ? colors.cheese : colors.troll;
  const bgColor = isThief ? colors.midnight : '#FFE5F0';
  const textColor = isThief ? colors.cheese : colors.ink;

  return (
    <div
      style={{
        background: bgColor,
        border: `2px solid ${cardColor}`,
        borderRadius: 14,
        padding: '16px 8px',
        textAlign: 'center',
        animation: 'slideUp 0.5s',
        position: 'relative',
        boxShadow: `0 2px 8px ${isThief ? 'rgba(244, 208, 111, 0.2)' : 'rgba(199, 62, 92, 0.15)'}`,
      }}
    >
      {isMe && (
        <div style={{
          position: 'absolute', top: 4, right: 4,
          fontSize: 9, padding: '2px 6px',
          background: colors.cheese, color: colors.ink,
          borderRadius: 4, fontWeight: 700,
        }}>나</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <MouseAvatar role={role} color={colors.avatarColors[player.avatarIndex] || colors.avatarColors[0]} size={80} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: textColor, marginTop: 10 }}>
        {player.nickname}
      </div>
      <div style={{ fontSize: 11, color: cardColor, fontWeight: 700, marginTop: 4 }}>
        {ROLE_LABELS[role]}
      </div>
    </div>
  );
}

// 작은 플레이어 카드 (잠꾸러기, 게임 시작 때 로비 스타일과 비슷)
function SmallPlayerCard({ player, isMe }) {
  return (
    <div
      style={{
        background: colors.paper,
        borderRadius: 10,
        padding: '8px 2px',
        textAlign: 'center',
        border: `${isMe ? '1.5' : '0.5'}px solid ${isMe ? colors.cheese : colors.hint}`,
        position: 'relative',
      }}
    >
      {isMe && (
        <div style={{
          position: 'absolute', top: 2, right: 2,
          fontSize: 8, padding: '1px 4px',
          background: colors.cheese, color: colors.ink,
          borderRadius: 3, fontWeight: 700,
        }}>나</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <MouseAvatar color={colors.avatarColors[player.avatarIndex] || colors.avatarColors[0]} size={36} />
      </div>
      <div style={{ fontSize: 10, color: colors.ink, marginTop: 3 }}>
        {player.nickname}
      </div>
    </div>
  );
}
