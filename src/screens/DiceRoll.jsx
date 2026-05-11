import { useState, useEffect } from 'react';
import { colors, fonts, paperBg } from '../utils/theme';
import { setPhase } from '../firebase/room';
import { GAME_PHASE } from '../utils/game';
import Dice from '../components/Dice';

const HOUR_LABELS = { 1: '새벽 1시', 2: '새벽 2시', 3: '새벽 3시', 4: '새벽 4시', 5: '새벽 5시', 6: '새벽 6시' };

export default function DiceRoll({ room, roomCode, playerId }) {
  const me = room.players?.[playerId];
  const dice = me?.dice || 1;
  const [rolling, setRolling] = useState(true);
  const [shown, setShown] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const isHost = room.hostId === playerId;

  // 굴림 애니메이션 (1.5초)
  useEffect(() => {
    const t = setTimeout(() => {
      setRolling(false);
      setShown(true);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  // 호스트가 확인 완료하면 → 밤 단계로
  useEffect(() => {
    if (confirmed && isHost) {
      const t = setTimeout(() => {
        setPhase(roomCode, GAME_PHASE.NIGHT_INTRO);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [confirmed, isHost, roomCode]);

  return (
    <div style={{ height: '100vh', width: '100vw', ...paperBg, padding: 24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.ink, fontFamily: fonts.display }}>
          언제 깨어날까요?
        </div>
        <div style={{ fontSize: 11, color: colors.muted, marginTop: 6 }}>
          {rolling ? '주사위를 굴리는 중...' : '나온 숫자를 기억하세요'}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Dice value={dice} size={130} rolling={rolling} />

        {shown && (
          <div style={{ marginTop: 28, textAlign: 'center', animation: 'slideUp 0.4s' }}>
            <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>당신이 깨어날 시간</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: colors.ink, fontFamily: fonts.display }}>
              {HOUR_LABELS[dice]}
            </div>
          </div>
        )}
      </div>

      {shown && (
        <div style={{ padding: '12px 14px', background: colors.paper, borderRadius: 10, border: `0.5px solid ${colors.hint}`, textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.4 }}>
            기억하세요!<br />
            이 시간에 나레이션이 호명하면 행동하세요
          </div>
        </div>
      )}

      {shown && !confirmed && (
        <button
          onClick={() => setConfirmed(true)}
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
          기억했어요
        </button>
      )}

      {confirmed && (
        <div style={{ padding: '14px', background: colors.hint, borderRadius: 12, fontSize: 13, fontWeight: 700, color: colors.ink, textAlign: 'center', opacity: 0.6 }}>
          ✓ 기억 완료
          {isHost && <div style={{ fontSize: 10, marginTop: 4 }}>곧 밤이 시작돼요...</div>}
          {!isHost && <div style={{ fontSize: 10, marginTop: 4 }}>방장 대기 중...</div>}
        </div>
      )}
    </div>
  );
}
