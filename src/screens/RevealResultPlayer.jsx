import { colors, fonts, paperBg } from '../utils/theme';
import { ROLES, ROLE_LABELS } from '../utils/game';
import MouseAvatar from '../components/MouseAvatar';

// 결과 발표 화면 (개인 폰) — 모든 사람의 역할 공개
export default function RevealResultPlayer({ room, playerId }) {
  const participants = Object.entries(room.players || {})
    .filter(([id]) => id !== room.cheesePlayerId);
  const me = room.players?.[playerId];
  const myRole = me?.role;

  return (
    <div style={{ height: '100vh', width: '100vw', ...paperBg, padding: 20, display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: colors.muted }}>THE TRUTH</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink, marginTop: 8, fontFamily: fonts.display }}>
          진실의 시간!
        </div>
      </div>

      {myRole && (
        <div style={{ marginTop: 14, padding: '10px 12px', background: colors.paper, borderRadius: 10, border: `0.5px solid ${colors.hint}`, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: colors.muted }}>당신은</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.ink, marginTop: 2 }}>
            {ROLE_LABELS[myRole]} 이었어요
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', marginTop: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {participants.map(([pid, p]) => {
            const role = p.role;
            const isThief = role === ROLES.THIEF;
            const isTroll = role === ROLES.TROLL;
            const cardColor = isThief ? colors.cheese : isTroll ? colors.troll : colors.sage;
            const bgColor = isThief ? colors.midnight : colors.paper;
            const textColor = isThief ? colors.cheese : colors.ink;
            const subTextColor = isThief ? colors.cheese : cardColor;

            return (
              <div
                key={pid}
                style={{
                  background: bgColor,
                  border: `1.5px solid ${cardColor}`,
                  borderRadius: 12,
                  padding: '12px 6px',
                  textAlign: 'center',
                  animation: 'slideUp 0.5s',
                  position: 'relative',
                }}
              >
                {pid === playerId && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    fontSize: 8, padding: '2px 5px',
                    background: colors.cheese, color: colors.ink,
                    borderRadius: 4, fontWeight: 700,
                  }}>나</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <MouseAvatar role={role} color={colors.avatarColors[p.avatarIndex] || colors.avatarColors[0]} size={48} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: textColor, marginTop: 6 }}>
                  {p.nickname}
                </div>
                <div style={{ fontSize: 10, color: subTextColor, fontWeight: 700, marginTop: 2 }}>
                  {ROLE_LABELS[role] || '잠꾸러기'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 12, background: colors.paper, borderRadius: 10, border: `0.5px solid ${colors.hint}`, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.5 }}>
          누가 맞췄을까요?<br />
          방장 폰에서 다음 단계로 이동하세요
        </div>
      </div>
    </div>
  );
}
