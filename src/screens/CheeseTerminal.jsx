import { useEffect, useState, useRef } from 'react';
import { colors, fonts } from '../utils/theme';
import {
  setPhase,
  setCurrentHour,
  stealCheese,
  startDiscussionTimer,
  endGame,
} from '../firebase/room';
import { GAME_PHASE } from '../utils/game';
import { speak, stopSpeaking, unlockTTS } from '../utils/tts';
import BigCheese from '../components/BigCheese';
import EmptyPlate from '../components/EmptyPlate';
import StarryNight from '../components/StarryNight';

// 시간당 진행 시간 (ms)
const HOUR_DURATION = 12000; // 각 시간 12초 (호명 → 대기 → 잠들기)

// 중앙 폰 — 게임 진행 전체를 주도
export default function CheeseTerminal({ room, roomCode }) {
  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      {renderPhase(room, roomCode)}
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
    case GAME_PHASE.ENDED:
      return <EndedScreen room={room} />;
    default:
      return null;
  }
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

  function handleStart() {
    if (started) return;
    setStarted(true);
    unlockTTS();
    speak('쉿... 모두 눈을 감고 잠드세요. 깊은 밤이 찾아왔어요.');
    setTimeout(() => {
      setCurrentHour(roomCode, 1);
      setPhase(roomCode, GAME_PHASE.NIGHT_HOUR);
    }, 5500);
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
  const participantCount = Object.keys(room.players || {}).filter((id) => id !== room.cheesePlayerId).length;
  const lastHourRef = useRef(null);
  const transitioningRef = useRef(false);

  // 시간이 바뀔 때마다 나레이션 + 자동 다음 시간 진행
  useEffect(() => {
    if (lastHourRef.current === hour) return;
    lastHourRef.current = hour;
    transitioningRef.current = false;

    // 호명 → 대기 → 잠들기 안내
    const hourLabel = hourToKorean(hour);
    speak(`${hourLabel}... ${hourLabel}에 깨어난 쥐는 살며시 눈을 뜨세요.`);

    // 6초 후 "잠드세요" 안내
    const halfwayTimer = setTimeout(() => {
      speak(`${hourLabel}의 쥐는 다시 잠드세요.`);
    }, HOUR_DURATION - 4000);

    // 시간 종료 후 다음 시간
    const nextTimer = setTimeout(() => {
      if (transitioningRef.current) return;
      transitioningRef.current = true;
      if (hour < 6) {
        setCurrentHour(roomCode, hour + 1);
      } else {
        // 6시 끝 → 손 뻗기 또는 아침으로
        const needHandOut = !followerRuleVariant && participantCount >= 6 && participantCount <= 8;
        if (needHandOut) {
          setPhase(roomCode, GAME_PHASE.HAND_OUT);
        } else {
          setPhase(roomCode, GAME_PHASE.MORNING);
        }
      }
    }, HOUR_DURATION);

    return () => {
      clearTimeout(halfwayTimer);
      clearTimeout(nextTimer);
    };
  }, [hour, roomCode, followerRuleVariant, participantCount]);

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

// 아침 화면
function Morning({ room, roomCode }) {
  const said = useRef(false);
  useEffect(() => {
    if (said.current) return;
    said.current = true;
    speak('아침이 밝았어요! 모두 눈을 뜨세요. 어머나, 치즈가 사라졌네요. 누가 훔쳐갔을까요?');

    const t = setTimeout(() => {
      startDiscussionTimer(roomCode);
    }, 6000);
    return () => clearTimeout(t);
  }, [roomCode]);

  return (
    <div
      style={{
        height: '100%',
        background: `linear-gradient(180deg, ${colors.cheese} 0%, ${colors.cream} 60%)`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <div style={{ position: 'absolute', top: 60 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ animation: 'float 3s ease-in-out infinite' }}>
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

      <div style={{ marginTop: 80, animation: 'slideUp 0.6s' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: colors.ink, lineHeight: 1.3, fontFamily: fonts.display }}>
          아침이<br />밝았어요!
        </div>
        <div style={{ fontSize: 13, color: colors.cheeseDark, marginTop: 18, fontStyle: 'italic', lineHeight: 1.7 }}>
          "어머나, 치즈가<br />사라졌네요...<br />누가 훔쳐갔을까요?"
        </div>
      </div>
    </div>
  );
}

// 토론 단계
function DiscussionScreen({ room, roomCode }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      if (room.timerEndsAt) {
        const r = Math.max(0, room.timerEndsAt - Date.now());
        setRemaining(r);
        if (r === 0) {
          endGame(roomCode);
        }
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

  function handleSkipToVote() {
    endGame(roomCode);
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
        padding: 32,
      }}
    >
      <div style={{ paddingTop: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: colors.muted }}>DISCUSSION</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.ink, marginTop: 8, fontFamily: fonts.display }}>
          누가 훔쳐갔을까요?
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 220, height: 220 }}>
          <svg width="220" height="220" viewBox="0 0 200 200">
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
              남은 시간
            </text>
          </svg>
        </div>

        <div style={{ marginTop: 32, fontSize: 12, color: colors.muted, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.7, padding: '0 16px' }}>
          "자유롭게 이야기 나누세요~<br />
          본 것을 말해도 되고,<br />
          거짓말을 해도 된답니다"
        </div>
      </div>

      <button
        onClick={handleSkipToVote}
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
        바로 투표 시작
      </button>
    </div>
  );
}

// 게임 종료 화면 (치즈 단말용)
function EndedScreen({ room }) {
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
        justifyContent: 'center',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: 2, color: colors.muted }}>VOTE TIME</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: colors.ink, marginTop: 12, lineHeight: 1.3, fontFamily: fonts.display }}>
        투표 시간이에요!
      </div>
      <div style={{ marginTop: 32 }}>
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
      </div>
      <div style={{ fontSize: 14, color: colors.ink, marginTop: 24, lineHeight: 1.6 }}>
        셋을 세면 손가락으로<br />
        도둑이라고 생각하는<br />
        쥐를 가리키세요
      </div>
    </div>
  );
}

function hourToKorean(h) {
  return ['', '새벽 한 시', '새벽 두 시', '새벽 세 시', '새벽 네 시', '새벽 다섯 시', '새벽 여섯 시'][h];
}
