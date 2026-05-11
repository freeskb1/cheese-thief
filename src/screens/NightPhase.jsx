import { useEffect, useState } from 'react';
import { colors } from '../utils/theme';
import { GAME_PHASE } from '../utils/game';
import Dice from '../components/Dice';
import StarryNight from '../components/StarryNight';
import WoodenCup from '../components/WoodenCup';

// 개인 폰의 밤 단계 — 항상 잠든 화면 유지
// C 상태: 누가 내 컵을 두 번 탭하면 주사위 노출 (3초)
export default function NightPhase({ room, roomCode, playerId }) {
  const [peeked, setPeeked] = useState(false);
  const me = room.players?.[playerId];
  const dice = me?.dice;
  const [tapCount, setTapCount] = useState(0);

  // 두 번 탭으로 들춤 (한 번은 우연 방지)
  useEffect(() => {
    if (tapCount >= 2) {
      setPeeked(true);
      const t = setTimeout(() => {
        setPeeked(false);
        setTapCount(0);
      }, 3000);
      return () => clearTimeout(t);
    }
    if (tapCount === 1) {
      const reset = setTimeout(() => setTapCount(0), 1500);
      return () => clearTimeout(reset);
    }
  }, [tapCount]);

  function handleTap() {
    if (!peeked) {
      setTapCount((c) => c + 1);
    }
  }

  // 모닝 단계 — 밝은 화면으로 전환 (잠시 보여줌)
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

  // C 상태: 들춰진 상태 (밤 톤 유지, 주사위만 노출)
  if (peeked) {
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
        }}
        onClick={handleTap}
      >
        <StarryNight density="low" />
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, color: colors.midnightText, letterSpacing: 1, marginBottom: 16 }}>
            누군가 보고 있어요
          </div>
          <Dice value={dice} size={160} />
          <div style={{ fontSize: 32, fontWeight: 700, color: colors.cheese, marginTop: 20, fontFamily: 'monospace' }}>
            {dice}
          </div>
          <div style={{ fontSize: 10, color: colors.midnightSub, marginTop: 8 }}>3초 후 다시 잠듭니다</div>
        </div>
      </div>
    );
  }

  // A/B/D 상태: 항상 같은 잠든 화면
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
      }}
      onClick={handleTap}
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

      {tapCount === 1 && (
        <div style={{ position: 'absolute', bottom: 24, fontSize: 9, color: colors.midnightSub, opacity: 0.4 }}>
          한 번 더 탭하면 들춰져요
        </div>
      )}
    </div>
  );
}
