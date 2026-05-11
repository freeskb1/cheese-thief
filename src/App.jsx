import { useEffect, useState } from 'react';
import { ensureSignedIn } from './firebase/config';
import { subscribeRoom } from './firebase/room';
import { getOrCreateClientId } from './utils/storage';
import { GAME_PHASE } from './utils/game';

import Home from './screens/Home';
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
  const [screen, setScreen] = useState('home'); // home | join | inRoom | rules
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
        const id = getOrCreateClientId();
        setPlayerId(id);
        setReady(true);
      })
      .catch((e) => setError(e.message));
    return () => {
      mounted = false;
    };
  }, []);

  // 방 입장 후 실시간 구독
  useEffect(() => {
    if (!roomCode) return;
    const unsub = subscribeRoom(roomCode, (data) => {
      if (data == null) {
        // 방이 사라짐 → 홈으로
        setRoom(null);
        setRoomCode(null);
        setScreen('home');
      } else {
        setRoom(data);
        // 내 플레이어가 방에서 사라졌으면 → 홈
        if (playerId && data.players && !data.players[playerId]) {
          setRoom(null);
          setRoomCode(null);
          setScreen('home');
        }
      }
    });
    return unsub;
  }, [roomCode, playerId]);

  if (!ready) {
    return (
      <FullScreenMessage>
        <div style={{ fontSize: 14, color: '#8B7A55' }}>준비 중...</div>
      </FullScreenMessage>
    );
  }

  if (error) {
    return (
      <FullScreenMessage>
        <div style={{ fontSize: 14, color: '#C73E5C' }}>오류: {error}</div>
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
              setRoom(null);
              setRoomCode(null);
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
