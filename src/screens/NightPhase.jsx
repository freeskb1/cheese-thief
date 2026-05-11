import { useEffect, useState, useRef } from 'react';
import { colors } from '../utils/theme';
import { GAME_PHASE } from '../utils/game';
import Dice from '../components/Dice';
import StarryNight from '../components/StarryNight';
import WoodenCup from '../components/WoodenCup';

// 개인 폰의 밤 단계 — 항상 잠든 화면 유지
// 꾹 눌러서 들춤 (떼면 닫힘) - 의도치 않은 들춤 방지를 위해 500ms hold
const HOLD_THRESHOLD = 500;

export default function NightPhase({ room, roomCode, playerId }) {
  const [peeking, setPeeking] = useState(false);
  const [pressing, setPressing] = useState(false);
  const holdTimerRef = useRef(null);
  const me = room.players?.[playerId];
  const dice = me?.dice;

  function handlePressStart(e) {
    if (e?.preventDefault) e.preventDefault();
    setPressing(true);
    holdTimerRef.current = setTimeout(() => {
      setPeeking(true);
    }, HOLD_THRESHOLD);
  }

  function handlePressEnd() {
    setPressing(false);
    setPeeking(false);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  // 모닝 단계
  if (room.phase === GAME_PHASE.MORNING) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          background: `linear-gradient(180deg, ${colors.cheeseLight} 0%, ${colors.cream} 60%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <div style={{ textAlign: 'center', animation: 'fadeIn 1s' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>☀️</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: colors.ink, lineHeight: 1.3 }}>
            아침이<br />밝았어요!
          </div>
          <div style={{ fontSize: 12, color: colors.muted, marginTop: 12, lineHeight: 1.6, fontStyle: 'italic' }}>
            치즈가 사라졌네요...
          </div>
        </div>
      </div>
    );
  }

  // 들춰진 상태 — 누르는 동안만
  if (peeking) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          background: colors.midnight,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          touchAction: 'none',
          userSelect: 'none',
        }}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
      >
        <StarryNight density="low" />
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, color: colors.midnightText, letterSpacing: 1, marginBottom: 16 }}>
            👀 누군가 보고 있어요
          </div>
          <Dice value={dice} size={160} />
          <div style={{ fontSize: 32, fontWeight: 700, color: colors.cheese, marginTop: 20, fontFamily: 'monospace' }}>
            {dice}
          </div>
          <div style={{ fontSize: 10, color: colors.midnightSub, marginTop: 8 }}>손을 떼면 다시 잠듭니다</div>
        </div>
      </div>
    );
  }

  // 평소 잠든 화면 — 꾹 누르면 들춰짐
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        background: colors.midnight,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        cursor: 'pointer',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
    >
      <StarryNight density="medium" />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <WoodenCup size={180} dark />

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontFamily: 'serif', fontStyle: 'italic', color: colors.midnightSub, letterSpacing: 4 }}>
            z<span style={{ fontSize: 14 }}>z</span><span style={{ fontSize: 11 }}>z</span>
          </div>
          <div style={{ fontSize: 12, color: colors.midnightText, marginTop: 12 }}>곤히 잠들었어요</div>
          <div style={{ fontSize: 10, color: colors.midnightSub, marginTop: 8, lineHeight: 1.5 }}>
            나레이션을 잘 듣고<br />
            본인 시간에 행동하세요
          </div>
        </div>
      </div>

      {pressing && (
        <div style={{ position: 'absolute', bottom: 24, fontSize: 10, color: colors.cheese, opacity: 0.7 }}>
          꾹 누르고 있는 중...
        </div>
      )}
    </div>
  );
}
