import { useEffect, useState } from 'react';
import { ensureSignedIn } from './firebase/config';
import { subscribeRoom, isStillInRoom } from './firebase/room';
import { getOrCreateClientId, getStoredRoom, setStoredRoom } from './utils/storage';
import { GAME_PHASE } from './utils/game';
import { HUB, goBackToHub } from './utils/hub';

import Home from './screens/Home';
import HubEntry from './screens/HubEntry';
import JoinRoom from './screens/JoinRoom';
import Lobby from './screens/Lobby';
import RuleGuide from './screens/RuleGuide';
import RoleReveal from './screens/RoleReveal';
import DiceRoll from './screens/DiceRoll';
import NightPhase from './screens/NightPhase';
import CheeseTerminal from './screens/CheeseTerminal';
import Discussion from './screens/Discussion';
import RevealResultPlayer from './screens/RevealResultPlayer';
import GameOver from './screens/GameOver';

// 메인 라우터/상태머신
export default function App() {
  // 말랑월드에서 넘어왔으면(HUB) 홈 대신 자동 입장 화면부터
  const [screen, setScreen] = useState(HUB ? 'hub' : 'home'); // home | join | inRoom | rules | hub
  const [roomCode, setRoomCode] = useState(null);
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  // 익명 로그인 + clientId 발급
  useEffect(() => {
    let mounted = true;
    ensureSignedIn()
      .then((user) => {
        if (!mounted) return;
        // playerId = clientId (브라우저 단위)
        // 말랑월드 입장: 플레이어 키 = 말랑월드 uid (쿼리 우선, localStorage는 건드리지 않음)
        const id = HUB ? HUB.uid : getOrCreateClientId();
        setPlayerId(id);
        if (HUB) {
          setReady(true);
          return;
        }
        // 단독 흐름: 새로고침(당겨서 새로고침 포함) 전에 있던 방에 아직 내가 있으면 바로 복귀
        const stored = getStoredRoom();
        if (!stored) {
          setReady(true);
          return;
        }
        return isStillInRoom(stored, id)
          .catch(() => false)
          .then((stillIn) => {
            if (!mounted) return;
            if (stillIn) {
              setRoomCode(stored);
              setScreen('inRoom');
            } else {
              setStoredRoom('');
            }
            setReady(true);
          });
      })
      .catch((e) => setError(e.message));
    return () => {
      mounted = false;
    };
  }, []);

  // 방 입장 후 실시간 구독
  useEffect(() => {
    if (!roomCode) return;
    // 단독 흐름이면 새로고침 복귀용으로 방 코드 기억 (말랑월드는 쿼리로 복귀)
    if (!HUB) setStoredRoom(roomCode);
    const unsub = subscribeRoom(roomCode, (data) => {
      if (data == null) {
        // 방이 사라짐 → 홈으로 (말랑월드 입장이면 대기 화면으로)
        if (!HUB) setStoredRoom('');
        setRoom(null);
        setRoomCode(null);
        setScreen(HUB ? 'hub' : 'home');
      } else {
        setRoom(data);
        // 내 플레이어가 방에서 사라졌으면 → 홈 (말랑월드 입장이면 대기 화면으로)
        if (playerId && data.players && !data.players[playerId]) {
          if (!HUB) setStoredRoom('');
          setRoom(null);
          setRoomCode(null);
          setScreen(HUB ? 'hub' : 'home');
        }
      }
    });
    return unsub;
  }, [roomCode, playerId]);

  // (오류를 먼저 확인 — 로그인 실패 시 "준비 중"에 멈춰 있지 않게)
  if (error) {
    return (
      <FullScreenMessage>
        <div style={{ fontSize: 14, color: '#C73E5C' }}>오류: {error}</div>
      </FullScreenMessage>
    );
  }

  if (!ready) {
    return (
      <FullScreenMessage>
        <div style={{ fontSize: 14, color: '#8B7A55' }}>준비 중...</div>
      </FullScreenMessage>
    );
  }

  // 방에 들어가 있다면 phase에 따라 화면 선택
  if (screen === 'inRoom' && room && playerId) {
    const isCheeseTerminal = room.cheesePlayerId === playerId;
    const me = room.players?.[playerId];

    // 치즈 단말은 항상 별도 화면
    if (isCheeseTerminal && room.phase !== GAME_PHASE.LOBBY) {
      return <CheeseTerminal room={room} roomCode={roomCode} />;
    }

    switch (room.phase) {
      case GAME_PHASE.LOBBY:
        return (
          <Lobby
            room={room}
            roomCode={roomCode}
            playerId={playerId}
            onShowRules={() => setScreen('rules')}
            onLeave={() => {
              if (!HUB) setStoredRoom('');
              setRoom(null);
              setRoomCode(null);
              // 말랑월드 입장이면 나가기 = 말랑월드 방으로 돌아가기
              // ('leaving'으로 두어 대기 화면이 다시 입장시키지 않게 함)
              if (HUB && goBackToHub()) {
                setScreen('leaving');
                return;
              }
              setScreen('home');
            }}
          />
        );
      case GAME_PHASE.ROLE_REVEAL:
        return <RoleReveal room={room} roomCode={roomCode} playerId={playerId} />;
      case GAME_PHASE.DICE_ROLL:
        return <DiceRoll room={room} roomCode={roomCode} playerId={playerId} />;
      case GAME_PHASE.NIGHT_INTRO:
      case GAME_PHASE.NIGHT_HOUR:
      case GAME_PHASE.HAND_OUT:
      case GAME_PHASE.MORNING:
        return <NightPhase room={room} roomCode={roomCode} playerId={playerId} />;
      case GAME_PHASE.DISCUSSION:
        return <Discussion room={room} roomCode={roomCode} playerId={playerId} />;
      case GAME_PHASE.VOTING:
        return <Discussion room={room} roomCode={roomCode} playerId={playerId} voting />;
      case GAME_PHASE.REVEAL_RESULT:
        return <RevealResultPlayer room={room} roomCode={roomCode} playerId={playerId} />;
      case GAME_PHASE.ENDED:
        return <GameOver room={room} roomCode={roomCode} playerId={playerId} />;
      default:
        return (
          <FullScreenMessage>
            <div>알 수 없는 단계: {room.phase}</div>
          </FullScreenMessage>
        );
    }
  }

  // ── 말랑월드 입장 전용 화면 (HUB가 없으면 여기로 오지 않음) ──
  if (HUB && screen === 'leaving') {
    return (
      <FullScreenMessage>
        <div style={{ fontSize: 14, color: '#8B7A55' }}>말랑월드로 돌아가는 중...</div>
      </FullScreenMessage>
    );
  }

  if (HUB && screen === 'hub') {
    return (
      <HubEntry
        playerId={playerId}
        onEntered={(code) => {
          setRoomCode(code);
          setScreen('inRoom');
        }}
      />
    );
  }

  if (screen === 'inRoom' && !room) {
    // 방 구독 첫 데이터가 올 때까지 (홈 화면이 잠깐 보이지 않도록)
    return (
      <FullScreenMessage>
        <div style={{ fontSize: 14, color: '#8B7A55' }}>입장 중...</div>
      </FullScreenMessage>
    );
  }

  if (screen === 'rules') {
    return <RuleGuide onClose={() => setScreen('inRoom')} room={room} />;
  }

  if (screen === 'join') {
    return (
      <JoinRoom
        playerId={playerId}
        onJoined={(code) => {
          setRoomCode(code);
          setScreen('inRoom');
        }}
        onBack={() => setScreen('home')}
      />
    );
  }

  // 기본: 홈
  return (
    <Home
      playerId={playerId}
      onCreated={(code) => {
        setRoomCode(code);
        setScreen('inRoom');
      }}
      onJoin={() => setScreen('join')}
    />
  );
}

function FullScreenMessage({ children }) {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF3E3',
        color: '#5C4A2A',
      }}
    >
      {children}
    </div>
  );
}
