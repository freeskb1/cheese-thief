import { useEffect, useState } from 'react';
import { colors, fonts, paperBg } from '../utils/theme';

// 일반 플레이어의 토론/투표 화면
export default function Discussion({ room, voting }) {
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

  if (voting) {
    return (
      <div style={{ height: '100vh', width: '100vw', ...paperBg, padding: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ paddingTop: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: colors.muted }}>VOTE TIME</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: colors.ink, marginTop: 8, fontFamily: fonts.display }}>
            투표 시간!
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ fontSize: 60 }}>👉</div>
          <div style={{ marginTop: 20, fontSize: 14, color: colors.ink, textAlign: 'center', lineHeight: 1.7 }}>
            하나, 둘, 셋을 외치면<br />
            도둑이라고 생각하는<br />
            쥐를 손가락으로<br />
            가리키세요
          </div>
        </div>

        <div style={{ padding: 12, background: colors.paper, borderRadius: 10, border: `0.5px solid ${colors.hint}`, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: colors.muted }}>모두 지목한 후 방장이<br />결과 확인 버튼을 누릅니다</div>
        </div>
      </div>
    );
  }

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
          방장이 투표 시작을<br />누를 때까지 자유 토론
        </div>
      </div>
    </div>
  );
}
