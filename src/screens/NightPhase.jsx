import { useState, useEffect } from 'react';
import { colors } from '../utils/theme';
import { GAME_PHASE } from '../utils/game';
import Dice from '../components/Dice';
import StarryNight from '../components/StarryNight';
import WoodenCup from '../components/WoodenCup';

// 개인 폰의 밤 단계 — 항상 잠든 화면 유지
// 꾹 누르고 있는 동안만 컵이 들려서 주사위가 보이고, 손을 떼면 자동으로 다시 덮임
// (혼자 깬 잠꾸러기가 옆 사람 폰을 들춰볼 때도 같은 화면)
export default function NightPhase({ room, playerId }) {
  const [peeking, setPeeking] = useState(false);
  const me = room.players?.[playerId];
  const dice = me?.dice;

  const lift = (e) => {
    if (e && e.cancelable) e.preventDefault();
    if (!peeking) { try { navigator.vibrate && navigator.vibrate(15); } catch (er) { /* ignore */ } }
    setPeeking(true);
  };
  const drop = () => setPeeking(false);
  // 화면 밖에서 손을 떼거나 앱이 가려져도 덮이게
  useEffect(() => {
    const off = () => setPeeking(false);
    window.addEventListener('blur', off);
    document.addEventListener('visibilitychange', off);
    return () => { window.removeEventListener('blur', off); document.removeEventListener('visibilitychange', off); };
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

  // 잠든 화면 — 꾹 누르는 동안 컵이 들림
  return (
    <div
      onPointerDown={lift}
      onPointerUp={drop}
      onPointerCancel={drop}
      onPointerLeave={drop}
      onContextMenu={(e) => e.preventDefault()}
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
        WebkitTouchCallout: 'none',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <StarryNight density="medium" />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
        {/* 컵 아래 주사위: 누르면 컵이 위로 들리며 기울어짐 */}
        <div style={{ position: 'relative', width: 200, height: 230, marginTop: 40 }}>
          <div style={{
            position: 'absolute', left: '50%', bottom: 18, transform: `translateX(-50%) scale(${peeking ? 1 : 0.9})`,
            opacity: peeking ? 1 : 0, transition: 'opacity 0.15s, transform 0.25s',
          }}>
            <Dice value={dice} size={110} />
          </div>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            transformOrigin: '85% 100%',
            transform: peeking ? 'translate(34px, -118px) rotate(24deg)' : 'none',
            transition: peeking ? 'transform 0.28s cubic-bezier(.2,1.4,.4,1)' : 'transform 0.2s ease-in',
            filter: peeking ? 'drop-shadow(0 18px 14px rgba(0,0,0,0.45))' : 'none',
          }}>
            <WoodenCup size={200} dark />
          </div>
        </div>

        <div style={{ marginTop: 18, textAlign: 'center', minHeight: 96 }}>
          {peeking ? (
            <>
              <div style={{ fontSize: 34, fontWeight: 700, color: colors.cheese, fontFamily: 'monospace' }}>{dice}</div>
              <div style={{ fontSize: 14, color: colors.midnightText, marginTop: 6 }}>손을 떼면 다시 덮여요</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 18, fontFamily: 'serif', fontStyle: 'italic', color: colors.midnightSub, letterSpacing: 4 }}>
                z<span style={{ fontSize: 14 }}>z</span><span style={{ fontSize: 11 }}>z</span>
              </div>
              <div style={{ fontSize: 16, color: colors.midnightText, marginTop: 10 }}>곤히 잠들었어요</div>
              <div style={{ fontSize: 14, color: colors.midnightSub, marginTop: 8, lineHeight: 1.6 }}>
                나레이션을 잘 듣고<br />
                본인 시간에 행동하세요<br />
                <span style={{ color: colors.midnightText }}>컵을 꾹 누르고 있으면 몰래 볼 수 있어요</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
