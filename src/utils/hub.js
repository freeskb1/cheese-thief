// 광배월드(허브)에서 넘어온 경우의 쿼리 파싱
//   ?room=4821&sid=...&uid=...&name=...&host=1&device=1&hub=...
// room·sid·uid가 모두 있을 때만 허브 모드. 없으면 null → 기존 단독 흐름 그대로.
// (hub.js는 defer라 window.KWANGBBAN이 늦게 생길 수 있어 location.search를 직접 읽는다)

function parseHubParams() {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const room = q.get('room');
  const sid = q.get('sid');
  const uid = q.get('uid');
  if (!room || !sid || !uid) return null;
  return {
    room,
    roomKey: `h${room}`, // 게임 DB의 방 키 (게임에서 직접 만든 4자리 방과 안 겹치게)
    sid,
    uid,
    name: (q.get('name') || '').trim(),
    host: q.get('host') === '1',
    device: q.get('device') === '1',
    hub: q.get('hub') || '',
  };
}

export const HUB = parseHubParams();

export function isHubRoomKey(roomCode) {
  return typeof roomCode === 'string' && roomCode.charAt(0) === 'h';
}

// 광배월드 방으로 돌아가기 (hub.js의 버튼과 같은 동작)
export function goBackToHub() {
  if (!HUB || !HUB.hub) return false;
  try {
    sessionStorage.removeItem('kwangbban');
  } catch (e) {
    // ignore
  }
  window.location.href = HUB.hub;
  return true;
}
