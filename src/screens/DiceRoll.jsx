import { useState, useEffect } from 'react';
import { colors, fonts, paperBg } from '../utils/theme';
import { setPhase, setPlayerReady } from '../firebase/room';
import { GAME_PHASE } from '../utils/game';
import Dice from '../components/Dice';

const HOUR_LABELS = { 1: '새벽 1시', 2: '새벽 2시', 3: '새벽 3시', 4: '새벽 4시', 5: '새벽 5시', 6: '새벽 6시' };

export default function DiceRoll({ room, roomCode, playerId }) {
  const me = room.players?.[playerId];
  const dice = me?.dice || 1;
  const ready = !!me?.ready;
  const [rolling, setRolling] = useState(true);
  const [shown, setShown] = useState(false);
  const isHost = room.hostId === playerId;

  // 굴림 애니메이션 (1.5초)
  useEffect(() => {
    const t = setTimeout(() => {
      setRolling(false);
      setShown(true);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  function handleConfirm() {
    setPlayerReady(roomCode, playerId, true);
  }

  function handleNext() {
    setPhase(roomCode, GAME_PHASE.NIGHT_INTRO);
  }

  // 모든 참가자 ready 체크
  const participants = Object.entries(room.players || {})
    .filter(([id]) => id !== room.cheesePlayerId);
  const readyCount = participants.filter(([, p]) => p.ready).length;
  const totalCount = participants.length;
  const allReady = readyCount === totalCount && totalCount > 0;

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

      {shown && !ready && (
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
          기억했어요
        </button>
      )}

      {ready && !isHost && (
        <div style={{ padding: 14, background: colors.paper, borderRadius: 12, border: `0.5px solid ${colors.hint}`, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: colors.muted }}>✓ 기억 완료 · 방장 대기 중</div>
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
          {allReady ? '🌙 밤을 시작 →' : `대기 중 (${readyCount}/${totalCount}) — 강제 진행`}
        </button>
      )}
    </div>
  );
}
