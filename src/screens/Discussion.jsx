import { useEffect, useState } from 'react';
import { colors, fonts, paperBg } from '../utils/theme';

// 일반 플레이어의 토론 화면 (단순한 안내)
export default function Discussion({ room, roomCode, playerId }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      if (room.timerEndsAt) {
        setRemaining(Math.max(0, room.timerEndsAt - Date.now()));
      }
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [room.timerEndsAt]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <div style={{ height: '100vh', width: '100vw', ...paperBg, padding: 24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: colors.muted }}>DISCUSSION</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: colors.ink, marginTop: 8, fontFamily: fonts.display }}>
          토론 시간
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: colors.ink, fontFamily: 'monospace' }}>
          {mins}:{String(secs).padStart(2, '0')}
        </div>

        <div style={{ marginTop: 32, padding: 14, background: colors.paper, borderRadius: 12, border: `0.5px solid ${colors.hint}`, maxWidth: 320 }}>
          <div style={{ fontSize: 12, color: colors.ink, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>💭 떠올려 보세요</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: colors.muted, lineHeight: 1.8 }}>
            <li>내 시간에 누가 같이 깼지?</li>
            <li>이상한 소리는 없었나?</li>
            <li>누가 거짓말 하는 거 같지?</li>
          </ul>
        </div>
      </div>

      <div style={{ padding: 12, background: 'rgba(244, 208, 111, 0.15)', borderRadius: 10, border: `0.5px dashed ${colors.hint}`, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.5 }}>
          시간이 끝나면 손가락으로<br />도둑을 가리켜요
        </div>
      </div>
    </div>
  );
}
