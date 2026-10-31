import {
  ref,
  set,
  get,
  update,
  onValue,
  off,
  remove,
  serverTimestamp,
  onDisconnect,
  runTransaction,
} from 'firebase/database';
import { db } from '../firebase/config';
import { generateRoomCode, assignRoles, rollDiceForPlayers, GAME_PHASE } from '../utils/game';

// 룸 데이터 구조
// rooms/{roomCode} = {
//   createdAt, hostId, cheesePlayerId, phase, currentHour,
//   options: { includeTroll, followerRuleVariant },
//   cheeseStolen: boolean,
//   players: {
//     [playerId]: { nickname, avatarIndex, joinedAt, role, dice }
//   },
//   timerEndsAt: number (ms) | null
// }

export function getRoomRef(roomCode) {
  return ref(db, `rooms/${roomCode}`);
}

export function getPlayerRef(roomCode, playerId) {
  return ref(db, `rooms/${roomCode}/players/${playerId}`);
}

// 새 방 만들기
export async function createRoom({ hostId, nickname, avatarIndex }) {
  let code = generateRoomCode();
  // 충돌 회피 (1회 재시도)
  const exists = (await get(getRoomRef(code))).exists();
  if (exists) code = generateRoomCode();

  await set(getRoomRef(code), {
    createdAt: serverTimestamp(),
    hostId,
    cheesePlayerId: null,
    phase: GAME_PHASE.LOBBY,
    options: {
      includeTroll: false,         // 트롤은 기본 OFF (옵션)
      followerRuleVariant: true,   // 변형 룰 기본 ON (공범 지정 단순)
      fastMode: true,              // 빠른 모드 기본 ON (행동 시간 7초)
      countNarration: true,        // 초세기 나레이션 기본 ON
    },
    cheeseStolen: false,
    currentHour: 0,
    players: {
      [hostId]: {
        nickname,
        avatarIndex,
        joinedAt: serverTimestamp(),
        isHost: true,
      },
    },
    timerEndsAt: null,
  });
  return code;
}

// 방 입장
export async function joinRoom({ roomCode, playerId, nickname, avatarIndex }) {
  const snap = await get(getRoomRef(roomCode));
  if (!snap.exists()) {
    throw new Error('방을 찾을 수 없어요');
  }
  const room = snap.val();
  // 이미 이 방에 있는 사람(새로고침·재접속) → 다시 쓰지 않고 그대로 입장 (어느 단계든)
  if (room.players && room.players[playerId]) return;
  if (room.phase !== GAME_PHASE.LOBBY) {
    throw new Error('이미 게임이 시작됐어요');
  }
  const playerCount = Object.keys(room.players || {}).length;
  if (playerCount >= 10) {
    throw new Error('인원이 가득 찼어요');
  }

  await update(getPlayerRef(roomCode, playerId), {
    nickname,
    avatarIndex,
    joinedAt: serverTimestamp(),
    isHost: false,
  });
}

// 새로고침 복귀용: 그 방이 아직 있고 내가 players에 남아 있는지
// (며칠 전 방에 갑자기 들어가지 않게 12시간 넘은 방은 제외)
export async function isStillInRoom(roomCode, playerId) {
  if (!roomCode || !playerId) return false;
  const snap = await get(getRoomRef(roomCode));
  const room = snap.val();
  if (!room || !room.players || !room.players[playerId]) return false;
  if (typeof room.createdAt === 'number' && Date.now() - room.createdAt > 12 * 60 * 60 * 1000) return false;
  return true;
}

// ── 말랑월드(허브) 자동 입장 ──
// 방 키는 h{room}, room.hubSid = 이번 판 sid (createRoom과 같은 초기 구조 + hubSid)
function buildHubRoom({ sid, hostId, nickname, avatarIndex, now }) {
  return {
    createdAt: now,
    hubSid: sid,
    hostId,
    cheesePlayerId: null,
    phase: GAME_PHASE.LOBBY,
    options: {
      includeTroll: false,
      followerRuleVariant: true,
      fastMode: true,
      countNarration: true,
    },
    cheeseStolen: false,
    currentHour: 0,
    players: {
      [hostId]: {
        nickname,
        avatarIndex,
        joinedAt: now,
        isHost: true,
      },
    },
    timerEndsAt: null,
  };
}

// 방장: 방이 없거나 hubSid가 다르면(예전 판) 새로 만들고, 같으면 그대로 쓴다. (트랜잭션 → 멱등)
export async function ensureHubRoom({ roomKey, sid, hostId, nickname, avatarIndex }) {
  const result = await runTransaction(getRoomRef(roomKey), (cur) => {
    if (!cur || cur.hubSid !== sid) {
      // 트랜잭션 안에서는 serverTimestamp 대신 Date.now()
      return buildHubRoom({ sid, hostId, nickname, avatarIndex, now: Date.now() });
    }
    if (!cur.players || !cur.players[hostId]) {
      // 같은 판인데 방장이 players에서 빠진 경우(방 나가기 등) → 다시 넣기
      return {
        ...cur,
        players: {
          ...(cur.players || {}),
          [hostId]: { nickname, avatarIndex, joinedAt: Date.now(), isHost: cur.hostId === hostId },
        },
      };
    }
    return undefined; // 이미 만든 방 (새로고침 등) → 아무것도 안 씀
  });
  return result.snapshot.val();
}

// 멤버: 이미 players에 있으면 다시 쓰지 않음(어느 단계든 재입장 가능).
// 없으면 로비일 때만, 10명 미만일 때만 입장.
export async function joinHubRoom({ roomKey, playerId, nickname, avatarIndex, isDevice }) {
  const snap = await get(getRoomRef(roomKey));
  if (!snap.exists()) throw new Error('방을 찾을 수 없어요');
  const room = snap.val();
  if (room.players && room.players[playerId]) return room;
  if (room.phase !== GAME_PHASE.LOBBY) {
    throw new Error('이미 게임이 시작됐어요');
  }
  const playerCount = Object.keys(room.players || {}).length;
  if (playerCount >= 10) {
    throw new Error('인원이 가득 찼어요');
  }
  const data = {
    nickname,
    avatarIndex,
    joinedAt: serverTimestamp(),
    isHost: room.hostId === playerId,
  };
  if (isDevice) data.isDevice = true;
  await update(getPlayerRef(roomKey, playerId), data);
  return room;
}

// 공용 기기: 치즈 단말이 아직 비어 있으면 자기 자신을 치즈 단말로 지정.
// 방장이 이미 다른 사람을 정했으면 건드리지 않음 (방장은 로비에서 탭으로 언제든 바꿀 수 있음)
export async function claimCheeseTerminalIfEmpty(roomKey, playerId) {
  await runTransaction(ref(db, `rooms/${roomKey}/cheesePlayerId`), (cur) => {
    if (cur) return undefined; // 이미 지정됨 → 그대로
    return playerId;
  });
}

// 플레이어 방 나가기 (수동) — 게임 중에는 판 무효
export async function leaveRoom(roomCode, playerId) {
  await remove(getPlayerRef(roomCode, playerId));
}

// 자동 해제 시 핸들러 — 현재는 비활성화
// Firebase 일시 끊김에도 onDisconnect가 실행되어 갑자기 홈으로 튕기는 문제 방지
// 게임이 짧으니 사용자가 명시적으로 leaveRoom 호출하는 것에 의존
export function setupDisconnectHandler(roomCode, playerId) {
  // no-op
  // 필요시 onDisconnect(getPlayerRef(roomCode, playerId)).remove();
}

// 룸 실시간 구독
export function subscribeRoom(roomCode, callback) {
  const r = getRoomRef(roomCode);
  onValue(r, (snap) => {
    callback(snap.val());
  });
  return () => off(r);
}

// 옵션 변경 (방장 전용 — UI에서 제한)
export async function updateOptions(roomCode, options) {
  await update(ref(db, `rooms/${roomCode}/options`), options);
}

// 치즈 단말 지정
export async function setCheesePlayer(roomCode, playerId) {
  await update(getRoomRef(roomCode), { cheesePlayerId: playerId });
}

// 게임 시작 — 역할 분배 + 주사위 굴리기 + 셋업 단계로 전환
export async function startGame(roomCode) {
  const snap = await get(getRoomRef(roomCode));
  const room = snap.val();
  if (!room) return;

  const playerIds = Object.keys(room.players || {}).filter((id) => id !== room.cheesePlayerId);
  const roles = assignRoles(playerIds, room.options.includeTroll);
  const dice = rollDiceForPlayers(playerIds);

  // 각 플레이어에 역할/주사위 부여
  const updates = {};
  for (const id of playerIds) {
    updates[`players/${id}/role`] = roles[id];
    updates[`players/${id}/dice`] = dice[id];
  }
  updates['phase'] = GAME_PHASE.ROLE_REVEAL;
  updates['cheeseStolen'] = false;
  updates['currentHour'] = 0;

  await update(getRoomRef(roomCode), updates);
}

// 단계 전환
export async function setPhase(roomCode, phase) {
  // 단계 전환 시 모든 플레이어의 ready 플래그 초기화
  const snap = await get(getRoomRef(roomCode));
  const room = snap.val();
  if (!room) return;
  const updates = { phase };
  for (const id of Object.keys(room.players || {})) {
    updates[`players/${id}/ready`] = null;
  }
  await update(getRoomRef(roomCode), updates);
}

// 플레이어가 현재 단계에서 "준비됨" 표시
export async function setPlayerReady(roomCode, playerId, ready = true) {
  await update(getPlayerRef(roomCode, playerId), { ready });
}

// 현재 호명 시간 설정 (1~6) - 0이면 미시작
export async function setCurrentHour(roomCode, hour) {
  await update(getRoomRef(roomCode), { currentHour: hour });
}

// 도둑이 치즈 터치
export async function stealCheese(roomCode) {
  await update(getRoomRef(roomCode), { cheeseStolen: true });
}

// 토론 타이머 시작 (3분)
export async function startDiscussionTimer(roomCode, durationMs = 3 * 60 * 1000) {
  await update(getRoomRef(roomCode), {
    phase: GAME_PHASE.DISCUSSION,
    timerEndsAt: Date.now() + durationMs,
  });
}

// 게임 종료
export async function endGame(roomCode) {
  await update(getRoomRef(roomCode), {
    phase: GAME_PHASE.ENDED,
    timerEndsAt: null,
  });
}

// 다시하기 — 셋업으로 점프 (멤버/옵션/치즈단말 유지, 역할 재분배)
export async function restartGame(roomCode) {
  const snap = await get(getRoomRef(roomCode));
  const room = snap.val();
  if (!room) return;

  // 이전 게임의 역할/주사위 초기화
  const updates = {};
  for (const id of Object.keys(room.players || {})) {
    updates[`players/${id}/role`] = null;
    updates[`players/${id}/dice`] = null;
  }
  updates['phase'] = GAME_PHASE.LOBBY;
  updates['cheeseStolen'] = false;
  updates['currentHour'] = 0;
  updates['timerEndsAt'] = null;
  await update(getRoomRef(roomCode), updates);

  // 셋업으로 바로 점프
  await startGame(roomCode);
}

// 로비로 (멤버 유지, 옵션 유지)
export async function backToLobby(roomCode) {
  const snap = await get(getRoomRef(roomCode));
  const room = snap.val();
  if (!room) return;
  const updates = {};
  for (const id of Object.keys(room.players || {})) {
    updates[`players/${id}/role`] = null;
    updates[`players/${id}/dice`] = null;
  }
  updates['phase'] = GAME_PHASE.LOBBY;
  updates['cheeseStolen'] = false;
  updates['currentHour'] = 0;
  updates['timerEndsAt'] = null;
  await update(getRoomRef(roomCode), updates);
}
