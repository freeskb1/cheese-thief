import { useState } from 'react';
import { colors } from '../utils/theme';
import { GAME_PHASE } from '../utils/game';
import Dice from '../components/Dice';
import StarryNight from '../components/StarryNight';
import WoodenCup from '../components/WoodenCup';

// 개인 폰의 밤 단계 — 항상 잠든 화면 유지
// 탭으로 열고/닫기 (모바일 안정성을 위한 단순 토글)
export default function NightPhase({ room, playerId }) {
  const [peeking, setPeeking] = useState(false);
  const me = room.players?.[playerId];
  const dice = me?.dice;

  function togglePeek() {
    setPeeking((p) => !p);
  }

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

  // 들춰진 상태 — 화면 어디든 탭하면 닫힘
  if (peeking) {
    return (
      <div
        onClick={togglePeek}
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
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
        }}
      >
        <StarryNight density="low" />
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, color: colors.midnightText, letterSpacing: 1, marginBottom: 16 }}>
            👀 누군가 보고 있어요
          </div>
          <Dice value={dice} size={160} />
          <div style={{ fontSize: 32, fontWeight: 700, color: colors.cheese, marginTop: 20, fontFamily: 'monospace' }}>
            {dice}
          </div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 12,
          color: colors.cheese,
          pointerEvents: 'none',
        }}>
          탭하면 다시 잠듭니다
        </div>
      </div>
    );
  }

  // 평소 잠든 화면 — 화면 어디든 탭하면 들춰짐
  return (
    <div
      onClick={togglePeek}
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
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      <StarryNight density="medium" />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
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
    </div>
  );
}
