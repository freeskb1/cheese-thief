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
  // 내가 직접 굴리는 느낌: 처음엔 주사위를 눌러야 굴러감 (새로고침해도 이미 굴렸으면 결과 그대로)
  const rolledKey = `ct-rolled-${roomCode}-${playerId}-${room.gameId || ''}`;
  const already = ready || (() => { try { return sessionStorage.getItem(rolledKey) === '1'; } catch (e) { return false; } })();
  const [rolling, setRolling] = useState(false);
  const [shown, setShown] = useState(already);
  const [face, setFace] = useState(already ? dice : 1);
  const isHost = room.hostId === playerId;

  function handleRoll() {
    if (rolling || shown) return;
    setRolling(true);
    try { navigator.vibrate && navigator.vibrate([20, 40, 20, 40, 20]); } catch (e) { /* ignore */ }
    // 굴러가는 동안 면이 막 바뀌다가(점점 느리게) 내 숫자에 멈춤
    let delay = 60, elapsed = 0;
    const tick = () => {
      elapsed += delay;
      if (elapsed < 1300) {
        setFace(1 + Math.floor(Math.random() * 6));
        delay = Math.min(220, delay * 1.18);
        setTimeout(tick, delay);
      } else {
        setFace(dice);
        setRolling(false);
        setShown(true);
        try { sessionStorage.setItem(rolledKey, '1'); } catch (e) { /* ignore */ }
        try { navigator.vibrate && navigator.vibrate(60); } catch (e) { /* ignore */ }
      }
    };
    setTimeout(tick, delay);
  }
  useEffect(() => { if (shown) setFace(dice); }, [dice, shown]);

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
          {rolling ? '데굴데굴…' : shown ? '나온 숫자를 기억하세요' : '주사위를 눌러서 직접 굴려요'}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handleRoll}
          disabled={rolling || shown}
          aria-label="주사위 굴리기"
          style={{ background: 'none', border: 'none', padding: 0, cursor: shown ? 'default' : 'pointer',
            animation: rolling ? 'diceTumble 0.45s ease-in-out infinite' : shown ? 'diceLand 0.5s ease-out' : 'diceWait 1.6s ease-in-out infinite' }}
        >
          <Dice value={face} size={130} rolling={false} />
        </button>
        {!shown && !rolling && (
          <div style={{ marginTop: 18, fontSize: 15, fontWeight: 700, color: colors.ink, fontFamily: fonts.display, animation: 'pulse 1.4s infinite' }}>
            👆 주사위를 톡! 눌러 굴리기
          </div>
        )}

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
