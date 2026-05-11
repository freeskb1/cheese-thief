// 게임 상수 및 헬퍼

export const GAME_PHASE = {
  LOBBY: 'lobby',                 // 입장 + 옵션 설정
  ROLE_REVEAL: 'role_reveal',     // 역할 카드 확인
  DICE_ROLL: 'dice_roll',         // 주사위 굴리기
  NIGHT_INTRO: 'night_intro',     // 밤 인트로
  NIGHT_HOUR: 'night_hour',       // 1~6시 진행
  HAND_OUT: 'hand_out',           // 손 뻗기 (옵션)
  MORNING: 'morning',             // 아침
  DISCUSSION: 'discussion',       // 토론 타이머
  VOTING: 'voting',               // 투표 안내 (지목)
  REVEAL_RESULT: 'reveal_result', // 결과 발표 (역할 공개)
  ENDED: 'ended',                 // 게임 종료
};

export const ROLES = {
  SLEEPYHEAD: 'sleepyhead',
  THIEF: 'thief',
  TROLL: 'troll',
};

export const ROLE_LABELS = {
  sleepyhead: '잠꾸러기',
  thief: '치즈 도둑',
  troll: '트롤 쥐',
};

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 10;

// 4자리 방 코드 생성
export function generateRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// 6자리 client ID (localStorage용)
export function generateClientId() {
  return 'c_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// 역할 분배
export function assignRoles(playerIds, includeTroll) {
  const ids = [...playerIds];
  // 셔플
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const roles = {};
  roles[ids[0]] = ROLES.THIEF;
  let idx = 1;
  if (includeTroll && ids.length >= 4) {
    roles[ids[1]] = ROLES.TROLL;
    idx = 2;
  }
  for (; idx < ids.length; idx++) {
    roles[ids[idx]] = ROLES.SLEEPYHEAD;
  }
  return roles;
}

// 주사위 굴리기 (1~6, 모두에게 분배)
export function rollDiceForPlayers(playerIds) {
  const dice = {};
  for (const id of playerIds) {
    dice[id] = Math.floor(Math.random() * 6) + 1;
  }
  return dice;
}

// 한글 닉네임 기본값 풀 (입력 안 했을 때)
export const DEFAULT_NICKNAMES = [
  '민준', '서연', '지우', '하준', '예린',
  '도윤', '시아', '주원', '하린', '준서',
];

export function pickRandomNickname() {
  return DEFAULT_NICKNAMES[Math.floor(Math.random() * DEFAULT_NICKNAMES.length)];
}
