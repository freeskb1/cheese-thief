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
