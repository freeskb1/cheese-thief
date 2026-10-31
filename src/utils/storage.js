import { generateClientId } from './game';

const KEY_CLIENT_ID = 'cheese_thief_client_id';
const KEY_NICKNAME = 'cheese_thief_nickname';
const KEY_AVATAR = 'cheese_thief_avatar';

export function getOrCreateClientId() {
  let id = localStorage.getItem(KEY_CLIENT_ID);
  if (!id) {
    id = generateClientId();
    localStorage.setItem(KEY_CLIENT_ID, id);
  }
  return id;
}

export function getStoredNickname() {
  return localStorage.getItem(KEY_NICKNAME) || '';
}

export function setStoredNickname(name) {
  localStorage.setItem(KEY_NICKNAME, name);
}

export function getStoredAvatar() {
  const idx = localStorage.getItem(KEY_AVATAR);
  return idx ? parseInt(idx, 10) : 0;
}

export function setStoredAvatar(idx) {
  localStorage.setItem(KEY_AVATAR, String(idx));
}

// 단독 흐름: 지금 들어가 있는 방 코드 (새로고침하면 같은 방으로 복귀)
const KEY_ROOM = 'cheese_thief_room';

export function getStoredRoom() {
  try {
    return localStorage.getItem(KEY_ROOM) || '';
  } catch (e) {
    return '';
  }
}

export function setStoredRoom(code) {
  try {
    if (code) localStorage.setItem(KEY_ROOM, code);
    else localStorage.removeItem(KEY_ROOM);
  } catch (e) {
    // ignore
  }
}
