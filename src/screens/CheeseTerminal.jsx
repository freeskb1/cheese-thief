import { useEffect, useState, useRef } from 'react';
import { colors, fonts } from '../utils/theme';
import {
  setPhase,
  setCurrentHour,
  stealCheese,
  startDiscussionTimer,
  endGame,
} from '../firebase/room';
import { GAME_PHASE, ROLES, ROLE_LABELS } from '../utils/game';
import { speak, stopSpeaking, unlockTTS } from '../utils/tts';
import BigCheese from '../components/BigCheese';
import EmptyPlate from '../components/EmptyPlate';
import StarryNight from '../components/StarryNight';
import MouseAvatar from '../components/MouseAvatar';

// 시간 길이는 옵션에 따라 동적 계산 (NightHours 내부에서)

// 중앙 폰 — 게임 진행 전체를 주도
export default function CheeseTerminal({ room, roomCode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  return (
    <div style={{
      height: '100dvh',
      width: '100vw',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {renderPhase(room, roomCode)}

      {/* 전체화면 토글 버튼 (우상단 고정) */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white',
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
        }}
        title={isFullscreen ? '전체화면 끄기' : '전체화면'}
      >
        {isFullscreen ? '⛶' : '⛶'}
      </button>
    </div>
  );
}

function renderPhase(room, roomCode) {
  switch (room.phase) {
    case GAME_PHASE.ROLE_REVEAL:
    case GAME_PHASE.DICE_ROLL:
      return <SetupWaiting phase={room.phase} />;
    case GAME_PHASE.NIGHT_INTRO:
      return <NightIntro room={room} roomCode={roomCode} />;
    case GAME_PHASE.NIGHT_HOUR:
      return <NightHours room={room} roomCode={roomCode} />;
    case GAME_PHASE.HAND_OUT:
      return <HandOut room={room} roomCode={roomCode} />;
    case GAME_PHASE.MORNING:
      return <Morning room={room} roomCode={roomCode} />;
    case GAME_PHASE.DISCUSSION:
      return <DiscussionScreen room={room} roomCode={roomCode} />;
    case GAME_PHASE.VOTING:
      return <VotingScreen room={room} roomCode={roomCode} />;
    case GAME_PHASE.REVEAL_RESULT:
      return <RevealResultScreen room={room} roomCode={roomCode} />;
    case GAME_PHASE.ENDED:
      return <EndedTerminalScreen room={room} />;
    default:
      return null;
  }
}

// 게임 종료 후 중앙 폰 (호스트가 다시하기/로비복귀를 다른 폰에서)
function EndedTerminalScreen({ room }) {
  return (
    <div
      style={{
        height: '100%',
        background: colors.cream,
        backgroundImage: 'radial-gradient(circle at 1px 1px, #E8DDC0 1px, transparent 0)',
        backgroundSize: '6px 6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: 2, color: colors.muted }}>GAME OVER</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: colors.ink, marginTop: 12, fontFamily: fonts.display }}>
        한 판이 끝났어요
      </div>
      <div style={{ fontSize: 12, color: colors.muted, marginTop: 16, lineHeight: 1.6 }}>
        방장 폰에서<br />
        다시하기 또는 로비 복귀를<br />
        선택해주세요
      </div>
    </div>
  );
}

// 셋업 대기 화면
function SetupWaiting({ phase }) {
  return (
    <div
      style={{
        height: '100%',
        background: colors.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: 2, color: colors.muted }}>CENTER · 치즈 단말</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: colors.ink, marginTop: 12, fontFamily: fonts.display }}>
        {phase === GAME_PHASE.ROLE_REVEAL ? '역할 확인 중...' : '주사위 굴리는 중...'}
      </div>
      <div style={{ fontSize: 11, color: colors.muted, marginTop: 10 }}>
        모든 쥐들이 준비하면 자동으로 다음으로 넘어가요
      </div>
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            display: 'inline-flex',
            gap: 6,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: colors.cheese,
                animation: `pulse 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 밤 인트로 — 사용자 탭으로 시작 (TTS 자동재생 정책 회피)
function NightIntro({ room, roomCode }) {
  const [started, setStarted] = useState(false);
  const followerRuleVariant = !!room.options?.followerRuleVariant;
  const participantCount = Object.keys(room.players || {}).filter((id) => id !== room.cheesePlayerId).length;
  const needHandOut = !followerRuleVariant && participantCount >= 6 && participantCount <= 8;

  function handleStart() {
    if (started) return;
    setStarted(true);
    unlockTTS();
    if (followerRuleVariant) {
      // 변형 룰 — "변형 룰" 단어 없이 공범 안내만
      speak('모두 눈을 감고 잠드세요. 곧 밤이 깊어집니다. 치즈 도둑은 자기 시간에 깨면, 함께 깬 잠꾸러기 한 명을 손가락으로 가리켜 공범으로 만드세요.');
      setTimeout(() => {
        setCurrentHour(roomCode, 1);
        setPhase(roomCode, GAME_PHASE.NIGHT_HOUR);
      }, 12000);
    } else if (needHandOut) {
      // 원작 룰 + 6~8인 — 손 뻗기 단계가 끝에 있음
      speak('모두 눈을 감고 잠드세요. 곧 밤이 깊어집니다. 6시가 지나면 손 뻗기 시간이 있을 거예요.');
      setTimeout(() => {
        setCurrentHour(roomCode, 1);
        setPhase(roomCode, GAME_PHASE.NIGHT_HOUR);
      }, 9000);
    } else {
      // 원작 룰 + 4~5인 / 9~10인 — 손 뻗기 없음
      speak('모두 눈을 감고 잠드세요. 곧 밤이 깊어집니다.');
      setTimeout(() => {
        setCurrentHour(roomCode, 1);
        setPhase(roomCode, GAME_PHASE.NIGHT_HOUR);
      }, 5500);
    }
  }

  return (
    <div
      onClick={handleStart}
      style={{
        height: '100%',
        background: colors.midnight,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        textAlign: 'center',
        cursor: started ? 'default' : 'pointer',
      }}
    >
      <StarryNight density="high" />
      <div style={{ position: 'relative', zIndex: 1, animation: 'fadeIn 1s' }}>
        <svg width="80" height="80" viewBox="0 0 100 100">
          <path d="M65 20 Q35 25 35 55 Q35 80 65 80 Q50 75 45 60 Q40 45 45 30 Q50 20 65 20 Z" fill={colors.cheese} opacity="0.9" />
        </svg>

        {!started ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors.cheese, marginTop: 24, lineHeight: 1.4, fontFamily: fonts.display }}>
              밤을 시작하려면<br />화면을 탭하세요
            </div>
            <div style={{ fontSize: 11, color: colors.midnightText, marginTop: 14, lineHeight: 1.6 }}>
              모두 준비되면 방장이 탭
            </div>
            <div style={{
              marginTop: 24,
              padding: '12px 24px',
              background: colors.cheese,
              color: colors.ink,
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              display: 'inline-block',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              탭해서 시작 🌙
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors.cheese, marginTop: 24, lineHeight: 1.4, fontFamily: fonts.display }}>
              깊은 밤이<br />찾아왔어요
            </div>
            <div style={{ fontSize: 12, color: colors.midnightText, marginTop: 14, fontStyle: 'italic', lineHeight: 1.6 }}>
              "쉿... 모두 눈을 감고<br />잠드세요"
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 밤 진행 (1~6시) — 치즈 풀스크린 유지
function NightHours({ room, roomCode }) {
  const hour = room.currentHour || 1;
  const stolen = !!room.cheeseStolen;
  const followerRuleVariant = !!room.options?.followerRuleVariant;
  const fastMode = !!room.options?.fastMode;
  const countNarration = !!room.options?.countNarration;
  const participantCount = Object.keys(room.players || {}).filter((id) => id !== room.cheesePlayerId).length;
  const lastHourRef = useRef(null);
  const transitioningRef = useRef(false);

  // 행동 시간 (눈 뜨세요 끝난 후 ~ 잠드세요 멘트 시작 전)
  const ACTION_SEC = fastMode ? 7 : 10;
  // 호명 발화 시간 (TTS가 끝날 때까지 대기) — 약 3.5초
  const ANNOUNCE_MS = 3500;
  // 호명 후 카운트 시작 전까지 여유 (자연스럽게 들리도록)
  const COUNT_START_GAP_MS = 1000;
  // "잠드세요" 발화 시간 - 약 2.5초
  const SLEEP_ANNOUNCE_MS = 2500;
  // 총 시간 = 호명 + (카운트 시작 갭) + 행동 + 잠드세요
  const HOUR_DURATION_MS = ANNOUNCE_MS + COUNT_START_GAP_MS + ACTION_SEC * 1000 + SLEEP_ANNOUNCE_MS;

  // 시간이 바뀔 때마다 나레이션
  useEffect(() => {
    if (lastHourRef.current === hour) return;
    lastHourRef.current = hour;
    transitioningRef.current = false;

    const hourLabel = hourToKorean(hour);
    // 1. 호명
    speak(`${hourLabel}. ${hourLabel}에 깨어난 쥐는 눈을 뜨세요.`);

    const timers = [];

    // 2. 초세기 나레이션 (옵션) — 호명 끝나고 1초 쉰 후 카운트다운 시작
    if (countNarration) {
      // 카운트는 ACTION_SEC, ACTION_SEC-1, ..., 1 순서로
      for (let i = 0; i < ACTION_SEC; i++) {
        const remaining = ACTION_SEC - i;
        const at = ANNOUNCE_MS + COUNT_START_GAP_MS + i * 1000;
        timers.push(setTimeout(() => {
          speak(String(remaining), { rate: 1.1 });
        }, at));
      }
    }

    // 3. "잠드세요" 안내 (행동 시간 다 지난 후)
    const sleepAt = ANNOUNCE_MS + COUNT_START_GAP_MS + ACTION_SEC * 1000;
    timers.push(setTimeout(() => {
      speak(`${hourLabel}의 쥐는 다시 잠드세요.`);
    }, sleepAt));

    // 4. 다음 시간 진행
    const nextAt = HOUR_DURATION_MS;
    timers.push(setTimeout(() => {
      if (transitioningRef.current) return;
      transitioningRef.current = true;
      if (hour < 6) {
        setCurrentHour(roomCode, hour + 1);
      } else {
        const needHandOut = !followerRuleVariant && participantCount >= 6 && participantCount <= 8;
        if (needHandOut) {
          setPhase(roomCode, GAME_PHASE.HAND_OUT);
        } else {
          setPhase(roomCode, GAME_PHASE.MORNING);
        }
      }
    }, nextAt));

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [hour, roomCode, followerRuleVariant, participantCount, fastMode, countNarration, ACTION_SEC, HOUR_DURATION_MS]);

  function handleCheeseTap() {
    if (stolen) return;
    stealCheese(roomCode);
  }

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        background: colors.midnight,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <StarryNight density="low" />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        {stolen ? (
          <EmptyPlate size={Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6)} />
        ) : (
          <BigCheese
            size={Math.min(window.innerWidth * 0.9, window.innerHeight * 0.7)}
            onClick={handleCheeseTap}
          />
        )}
      </div>
    </div>
  );
}

// 손 뻗기 단계
function HandOut({ room, roomCode }) {
  const said = useRef(false);
  const participantCount = Object.keys(room.players || {}).filter((id) => id !== room.cheesePlayerId).length;
  const numFollowers = participantCount === 6 ? 1 : 2;

  useEffect(() => {
    if (said.current) return;
    said.current = true;

    const sequence = async () => {
      await new Promise((r) => setTimeout(r, 600));
      speak('아침이 밝기 전, 한 가지 더 남았어요.');
      await new Promise((r) => setTimeout(r, 3500));
      speak('모두 오른손을 가운데로 뻗어주세요.');
      await new Promise((r) => setTimeout(r, 3500));

      if (numFollowers === 1) {
        speak('치즈 도둑은 살며시 눈을 떠서, 한 명의 손을 톡 쳐서 공범으로 만드세요.');
      } else {
        speak('치즈 도둑은 살며시 눈을 떠서, 두 명의 손을 톡 톡 쳐서 공범으로 만드세요.');
      }
      await new Promise((r) => setTimeout(r, 6000));
      speak('치즈 도둑은 다시 눈을 감으세요.');
      await new Promise((r) => setTimeout(r, 2500));
      speak('5... 4... 3... 2... 1...');
      await new Promise((r) => setTimeout(r, 5000));

      if (participantCount === 6) {
        speak('공범이 된 쥐는 살며시 눈을 떠서 도둑을 확인하세요.');
      } else if (participantCount === 7) {
        speak('공범이 된 두 쥐는 살며시 눈을 떠서 서로를 확인하세요. 도둑이 누군지는 알 수 없답니다.');
      } else {
        speak('치즈 도둑과 두 공범, 셋이 모두 눈을 떠서 서로를 확인하세요.');
      }
      await new Promise((r) => setTimeout(r, 5000));
      speak('모두 다시 잠드세요.');
      await new Promise((r) => setTimeout(r, 2500));

      setPhase(roomCode, GAME_PHASE.MORNING);
    };
    sequence();
  }, [participantCount, numFollowers, roomCode]);

  return (
    <div
      style={{
        height: '100%',
        background: colors.midnight,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <StarryNight density="low" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: colors.midnightText }}>EXTRA PHASE</div>
        <div style={{ fontSize: 10, color: colors.midnightSub, marginTop: 4 }}>원작 룰 · {participantCount}인</div>

        <div style={{ marginTop: 36, marginBottom: 36 }}>
          <svg width="180" height="160" viewBox="0 0 200 160">
            <circle cx="100" cy="80" r="40" fill={colors.cheese} opacity="0.1" />
            <circle cx="100" cy="80" r="26" fill={colors.cheese} opacity="0.18" />
            <g fill="#D9C8B0" stroke="#8B6940" strokeWidth="1">
              <path d="M85 5 Q85 30 90 50 Q92 55 100 55 Q108 55 110 50 Q115 30 115 5 Z" />
              <circle cx="100" cy="58" r="6" />
              <g transform="rotate(180 100 80)">
                <path d="M85 5 Q85 30 90 50 Q92 55 100 55 Q108 55 110 50 Q115 30 115 5 Z" />
                <circle cx="100" cy="58" r="6" />
              </g>
              <path d="M5 65 Q30 65 50 70 Q55 72 55 80 Q55 88 50 90 Q30 95 5 95 Z" />
              <circle cx="58" cy="80" r="6" />
              <path d="M195 65 Q170 65 150 70 Q145 72 145 80 Q145 88 150 90 Q170 95 195 95 Z" />
              <circle cx="142" cy="80" r="6" />
            </g>
            <circle cx="100" cy="80" r="10" fill={colors.cheese} stroke={colors.cheeseDark} strokeWidth="1" />
          </svg>
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: colors.cheese }}>손을 가운데로</div>
        <div style={{ fontSize: 11, color: colors.midnightText, marginTop: 12, lineHeight: 1.6, fontStyle: 'italic', padding: '0 8px' }}>
          "모두 오른손을 가운데로 뻗어주세요~<br />
          도둑은 {numFollowers === 1 ? '한 명' : '두 명'}의 손을<br />
          톡{numFollowers === 2 ? ', 톡' : ''} 쳐주세요"
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
        <div style={{ padding: 10, background: colors.midnightLight, borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: colors.midnightText }}>실제로 손을 뻗고 진행하세요</div>
        </div>
      </div>
    </div>
  );
}

// 아침 화면 — 호스트가 토론 시작 버튼 누르기 전까지 대기
function Morning({ room, roomCode }) {
  const said = useRef(false);
  useEffect(() => {
    if (said.current) return;
    said.current = true;
    speak('아침이 밝았어요. 모두 눈을 뜨세요. 치즈가 사라졌네요. 누가 훔쳐갔을까요?');
  }, []);

  function handleStartDiscussion() {
    startDiscussionTimer(roomCode);
  }

  return (
    <div
      style={{
        height: '100%',
        background: `linear-gradient(180deg, ${colors.cheese} 0%, ${colors.cream} 60%)`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 24px 32px',
        textAlign: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: '0 0 auto', marginTop: 8 }}>
        <svg width="70" height="70" viewBox="0 0 120 120" style={{ animation: 'float 3s ease-in-out infinite' }}>
          <circle cx="60" cy="60" r="28" fill={colors.cheese} />
          <g stroke={colors.cheese} strokeWidth="3" strokeLinecap="round">
            <line x1="60" y1="20" x2="60" y2="10" />
            <line x1="60" y1="100" x2="60" y2="110" />
            <line x1="20" y1="60" x2="10" y2="60" />
            <line x1="100" y1="60" x2="110" y2="60" />
            <line x1="32" y1="32" x2="25" y2="25" />
            <line x1="88" y1="88" x2="95" y2="95" />
            <line x1="88" y1="32" x2="95" y2="25" />
            <line x1="32" y1="88" x2="25" y2="95" />
          </g>
        </svg>
      </div>

      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'slideUp 0.6s', minHeight: 0 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: colors.ink, lineHeight: 1.3, fontFamily: fonts.display }}>
          아침이 밝았어요!
        </div>
        <div style={{ fontSize: 13, color: colors.cheeseDark, marginTop: 16, fontStyle: 'italic', lineHeight: 1.7 }}>
          "어머나, 치즈가 사라졌네요...<br />누가 훔쳐갔을까요?"
        </div>
      </div>

      <button
        onClick={handleStartDiscussion}
        style={{
          flex: '0 0 auto',
          width: '100%',
          maxWidth: 400,
          padding: '16px',
          background: colors.ink,
          border: 'none',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          color: colors.cheeseLight,
          fontFamily: fonts.body,
          marginBottom: 16,
        }}
      >
        💬 토론 시작 (3분)
      </button>
    </div>
  );
}

// 토론 단계 — 호스트가 "투표 시작" 버튼 누르기 전까지 진행 안 됨
function DiscussionScreen({ room, roomCode }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      if (room.timerEndsAt) {
        const r = Math.max(0, room.timerEndsAt - Date.now());
        setRemaining(r);
        // 타이머 0이 되어도 자동 종료 X — 안내만 표시
      }
    };
    update();
    const id = setInterval(update, 200);
    return () => clearInterval(id);
  }, [room.timerEndsAt, roomCode]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const totalMs = 3 * 60 * 1000;
  const progress = remaining / totalMs;
  const circumference = 2 * Math.PI * 84;

  function handleStartVoting() {
    setPhase(roomCode, GAME_PHASE.VOTING);
  }

  return (
    <div
      style={{
        height: '100%',
        background: colors.cream,
        backgroundImage: 'radial-gradient(circle at 1px 1px, #E8DDC0 1px, transparent 0)',
        backgroundSize: '6px 6px',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 24px 24px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: colors.muted }}>DISCUSSION</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.ink, marginTop: 6, fontFamily: fonts.display }}>
          누가 훔쳐갔을까요?
        </div>
      </div>

      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="84" fill={colors.paper} stroke="#E8DDC0" strokeWidth="10" />
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke={colors.cheese}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 0.2s linear' }}
            />
            <text x="100" y="100" fontSize="44" fontWeight="700" fill={colors.ink} textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
              {mins}:{String(secs).padStart(2, '0')}
            </text>
            <text x="100" y="128" fontSize="11" fill={colors.muted} textAnchor="middle">
              {remaining === 0 ? '시간 종료' : '남은 시간'}
            </text>
          </svg>
        </div>

        <div style={{ marginTop: 20, fontSize: 12, color: colors.muted, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.7, padding: '0 16px' }}>
          "자유롭게 이야기 나누세요.<br />
          본 것을 말해도 되고, 거짓말을 해도 됩니다."
        </div>
      </div>

      <button
        onClick={handleStartVoting}
        style={{
          flex: '0 0 auto',
          padding: '16px',
          background: colors.cheese,
          border: 'none',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          color: colors.ink,
          fontFamily: fonts.body,
          marginBottom: 8,
        }}
      >
        👉 투표 시작
      </button>
    </div>
  );
}

// 투표 안내 화면 (치즈 단말용) — 손가락 지목 안내
function VotingScreen({ room, roomCode }) {
  const said = useRef(false);
  useEffect(() => {
    if (said.current) return;
    said.current = true;
    speak('자, 이제 투표 시간입니다. 하나, 둘, 셋을 세면 도둑이라고 생각하는 쥐를 손가락으로 가리키세요.');
  }, []);

  function handleReveal() {
    setPhase(roomCode, GAME_PHASE.REVEAL_RESULT);
  }

  return (
    <div
      style={{
        height: '100%',
        background: colors.cream,
        backgroundImage: 'radial-gradient(circle at 1px 1px, #E8DDC0 1px, transparent 0)',
        backgroundSize: '6px 6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 24px 24px',
        textAlign: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: '0 0 auto' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: colors.muted }}>VOTE TIME</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: colors.ink, marginTop: 8, lineHeight: 1.3, fontFamily: fonts.display }}>
          투표 시간이에요!
        </div>
      </div>

      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <svg width="100" height="100" viewBox="0 0 120 120">
          <g transform="translate(60, 60)">
            <ellipse cx="0" cy="20" rx="25" ry="20" fill="#E8B5A0" stroke="#8B6940" strokeWidth="2" />
            <rect x="-5" y="-30" width="10" height="40" rx="5" fill="#E8B5A0" stroke="#8B6940" strokeWidth="2" />
            <ellipse cx="-15" cy="15" rx="5" ry="8" fill="#E8B5A0" stroke="#8B6940" strokeWidth="1.5" />
            <ellipse cx="15" cy="15" rx="5" ry="8" fill="#E8B5A0" stroke="#8B6940" strokeWidth="1.5" />
            <ellipse cx="-22" cy="22" rx="4" ry="6" fill="#E8B5A0" stroke="#8B6940" strokeWidth="1.5" />
            <ellipse cx="22" cy="22" rx="4" ry="6" fill="#E8B5A0" stroke="#8B6940" strokeWidth="1.5" />
          </g>
        </svg>

        <div style={{ marginTop: 20, fontSize: 14, color: colors.ink, lineHeight: 1.7 }}>
          하나, 둘, 셋을 세면<br />
          손가락으로 도둑이라고<br />
          생각하는 쥐를 가리키세요
        </div>
      </div>

      <button
        onClick={handleReveal}
        style={{
          flex: '0 0 auto',
          width: '100%',
          maxWidth: 400,
          padding: '16px',
          background: colors.cheese,
          border: 'none',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          color: colors.ink,
          fontFamily: fonts.body,
        }}
      >
        🎭 결과 확인 (역할 공개)
      </button>
      <div style={{ flex: '0 0 auto', fontSize: 10, color: colors.muted, marginTop: 8, marginBottom: 4 }}>
        모두 지목한 후 누르세요
      </div>
    </div>
  );
}

// 결과 발표 화면 (치즈 단말용) — 역할 공개
function RevealResultScreen({ room, roomCode }) {
  const said = useRef(false);
  useEffect(() => {
    if (said.current) return;
    said.current = true;
    speak('자, 이제 진실의 시간입니다. 모두의 정체를 공개합니다.');
  }, []);

  function handleEnd() {
    endGame(roomCode);
  }

  const participants = Object.entries(room.players || {})
    .filter(([id]) => id !== room.cheesePlayerId);

  // 도둑/트롤을 상단으로, 잠꾸러기는 하단으로
  const villains = participants.filter(([, p]) => p.role === ROLES.THIEF || p.role === ROLES.TROLL);
  const sleepyheads = participants.filter(([, p]) => p.role === ROLES.SLEEPYHEAD || !p.role);

  return (
    <div
      style={{
        height: '100%',
        background: colors.cream,
        backgroundImage: 'radial-gradient(circle at 1px 1px, #E8DDC0 1px, transparent 0)',
        backgroundSize: '6px 6px',
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div style={{ paddingTop: 8, textAlign: 'center', flex: '0 0 auto' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: colors.muted }}>THE TRUTH</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: colors.ink, marginTop: 6, fontFamily: fonts.display }}>
          진실의 시간!
        </div>
      </div>

      <div style={{ flex: '1 1 auto', overflow: 'auto', marginTop: 18 }}>
        {/* 도둑/트롤 — 상단 강조 박스 (왕좌처럼) */}
        {villains.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: villains.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}>
              {villains.map(([pid, p]) => {
                const role = p.role;
                const isThief = role === ROLES.THIEF;
                const bgColor = isThief ? colors.midnight : '#FFE5F0';
                const accentColor = isThief ? colors.cheese : colors.troll;
                const titleColor = isThief ? colors.cheese : colors.troll;

                return (
                  <div
                    key={pid}
                    style={{
                      background: bgColor,
                      border: `2.5px solid ${accentColor}`,
                      borderRadius: 16,
                      padding: '18px 16px',
                      textAlign: 'center',
                      animation: 'slideUp 0.5s',
                      boxShadow: `0 4px 16px ${isThief ? 'rgba(244,208,111,0.25)' : 'rgba(199,62,92,0.18)'}`,
                      position: 'relative',
                    }}
                  >
                    {/* 왕관/지목 마크 */}
                    <div style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: accentColor,
                      color: isThief ? colors.ink : 'white',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '3px 12px',
                      borderRadius: 12,
                      letterSpacing: 1,
                    }}>
                      {isThief ? '🧀 도둑' : '🃏 트롤'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                      <MouseAvatar
                        role={role}
                        size={72}
                        color={colors.avatarColors[p.avatarIndex] || colors.avatarColors[0]}
                      />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: titleColor, marginTop: 10, fontFamily: fonts.display }}>
                      {p.nickname}
                    </div>
                    <div style={{ fontSize: 12, color: accentColor, fontWeight: 700, marginTop: 4 }}>
                      {ROLE_LABELS[role]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 일반 잠꾸러기들 — 게임 시작 그리드와 같은 스타일 */}
        {sleepyheads.length > 0 && (
          <>
            <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, textAlign: 'center' }}>
              · 잠꾸러기들 ·
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 8,
              paddingBottom: 12,
            }}>
              {sleepyheads.map(([pid, p]) => (
                <div
                  key={pid}
                  style={{
                    background: colors.paper,
                    border: `1px solid ${colors.hint}`,
                    borderRadius: 12,
                    padding: '10px 6px',
                    textAlign: 'center',
                    animation: 'slideUp 0.5s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <MouseAvatar role={p.role} size={42} color={colors.avatarColors[p.avatarIndex] || colors.avatarColors[0]} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.ink, marginTop: 6 }}>
                    {p.nickname}
                  </div>
                  <div style={{ fontSize: 9, color: colors.muted, marginTop: 2 }}>
                    잠꾸러기
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleEnd}
        style={{
          flex: '0 0 auto',
          padding: '16px',
          background: colors.ink,
          border: 'none',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          color: colors.cheeseLight,
          fontFamily: fonts.body,
          marginTop: 12,
          marginBottom: 8,
        }}
      >
        다음으로
      </button>
    </div>
  );
}

function MouseAvatarMini({ role, color }) {
  return (
    <svg width="44" height="44" viewBox="0 0 50 50">
      <ellipse cx="25" cy="28" rx="16" ry="15" fill={color} />
      <ellipse cx="13" cy="20" rx="6" ry="7" fill={color} />
      <ellipse cx="37" cy="20" rx="6" ry="7" fill={color} />
      <ellipse cx="13" cy="20" rx="3" ry="3.5" fill={role === ROLES.THIEF ? '#4A3E32' : '#F2B5C4'} />
      <ellipse cx="37" cy="20" rx="3" ry="3.5" fill={role === ROLES.THIEF ? '#4A3E32' : '#F2B5C4'} />
      {role === ROLES.THIEF ? (
        <>
          <rect x="12" y="25" width="26" height="6" fill="#1A1510" />
          <circle cx="19" cy="28" r="2" fill="#F4D06F" />
          <circle cx="31" cy="28" r="2" fill="#F4D06F" />
        </>
      ) : role === ROLES.TROLL ? (
        <>
          <path d="M9 12 L14 5 L19 12 L25 5 L31 12 L36 5 L41 12" stroke="#C73E5C" strokeWidth="1.5" fill="#F4D06F" />
          <circle cx="20" cy="27" r="1.5" fill="#2A2520" />
          <circle cx="30" cy="27" r="1.5" fill="#2A2520" />
        </>
      ) : (
        <>
          <circle cx="20" cy="27" r="1.5" fill="#2A2520" />
          <circle cx="30" cy="27" r="1.5" fill="#2A2520" />
        </>
      )}
    </svg>
  );
}

function hourToKorean(h) {
  return ['', '새벽 한 시', '새벽 두 시', '새벽 세 시', '새벽 네 시', '새벽 다섯 시', '새벽 여섯 시'][h];
}
