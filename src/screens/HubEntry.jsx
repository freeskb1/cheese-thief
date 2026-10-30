import { useEffect, useRef, useState } from 'react';
import { colors, fonts, paperBg } from '../utils/theme';
import { onValue } from 'firebase/database';
import { getRoomRef, ensureHubRoom, joinHubRoom, claimCheeseTerminalIfEmpty } from '../firebase/room';
import { getStoredNickname, getStoredAvatar } from '../utils/storage';
import { pickRandomNickname, GAME_PHASE } from '../utils/game';
import { HUB } from '../utils/hub';
import MouseAvatar from '../components/MouseAvatar';

// 말랑월드에서 넘어왔을 때: 홈/닉네임/방 만들기 화면을 건너뛰고 바로 대기실로.
//   방장(host=1): h{room} 방을 멱등하게 만들고(hubSid 비교) 바로 입장
//   멤버: 방장이 이번 판(sid) 방을 만들 때까지 "방장을 기다리는 중…" → 생기면 자동 입장
//   공용 기기(device=1): 입장 후 치즈 단말이 비어 있으면 자기 자신을 치즈 단말로 지정

function pickAvatarIndex(players, playerId) {
  const total = colors.avatarColors.length;
  const used = new Set(
    Object.entries(players || {})
      .filter(([id]) => id !== playerId)
      .map(([, p]) => p && p.avatarIndex)
  );
  const stored = getStoredAvatar();
  if (stored >= 0 && stored < total && !used.has(stored)) return stored;
  for (let i = 0; i < total; i++) {
    if (!used.has(i)) return i;
  }
  return 0;
}

function hubNickname() {
  return HUB.name || getStoredNickname() || pickRandomNickname();
}

export default function HubEntry({ playerId, onEntered }) {
  const [status, setStatus] = useState(HUB.host ? '방을 만드는 중…' : '방장을 기다리는 중…');
  const [error, setError] = useState(null);
  const busyRef = useRef(false);
  const doneRef = useRef(false);
  const onEnteredRef = useRef(onEntered);
  onEnteredRef.current = onEntered;

  useEffect(() => {
    const roomKey = HUB.roomKey;
    let alive = true;

    function finish() {
      if (!alive || doneRef.current) return;
      doneRef.current = true;
      onEnteredRef.current(roomKey);
    }

    async function afterJoin(room) {
      // 공용 기기 → 치즈 단말 자리가 비어 있으면 차지 (로비에서만)
      if (HUB.device && room && room.phase === GAME_PHASE.LOBBY && !room.cheesePlayerId) {
        try {
          await claimCheeseTerminalIfEmpty(roomKey, playerId);
        } catch (e) {
          // 실패해도 입장은 진행 (방장이 로비에서 직접 지정 가능)
        }
      }
      finish();
    }

    async function hostCreate() {
      if (busyRef.current || doneRef.current) return;
      busyRef.current = true;
      setError(null);
      try {
        const room = await ensureHubRoom({
          roomKey,
          sid: HUB.sid,
          hostId: playerId,
          nickname: hubNickname(),
          avatarIndex: pickAvatarIndex(null, playerId),
        });
        await afterJoin(room);
      } catch (e) {
        if (alive) setError(e.message || '방을 만들지 못했어요');
      } finally {
        busyRef.current = false;
      }
    }

    async function memberJoin(room) {
      if (busyRef.current || doneRef.current) return;
      busyRef.current = true;
      setError(null);
      try {
        const joined = await joinHubRoom({
          roomKey,
          playerId,
          nickname: hubNickname(),
          avatarIndex: pickAvatarIndex(room.players, playerId),
          isDevice: HUB.device,
        });
        await afterJoin(joined);
      } catch (e) {
        if (alive) setError(e.message || '입장하지 못했어요');
      } finally {
        busyRef.current = false;
      }
    }

    if (HUB.host) {
      hostCreate();
      return () => {
        alive = false;
      };
    }

    // subscribeRoom의 off()는 같은 경로의 모든 리스너를 지우므로, 여기서는 onValue의 개별 해제 함수를 쓴다
    const unsub = onValue(getRoomRef(roomKey), (snap) => {
      const data = snap.val();
      if (!alive || doneRef.current) return;
      if (!data || data.hubSid !== HUB.sid) {
        // 방이 아직 없거나 예전 판의 방 → 계속 대기
        setStatus('방장을 기다리는 중…');
        return;
      }
      const already = !!(data.players && data.players[playerId]);
      if (!already && data.phase !== GAME_PHASE.LOBBY) {
        // 이미 시작한 판에 새로 온 사람 → 로비로 돌아오면 자동 입장
        setStatus('이미 게임이 진행 중이에요. 이번 판이 끝나고 대기실로 돌아오면 자동으로 들어가요.');
        return;
      }
      setStatus('입장하는 중…');
      memberJoin(data);
    });

    return () => {
      alive = false;
      unsub();
    };
  }, [playerId]);

  function retry() {
    // 방장만 재시도 버튼 사용 (멤버는 구독으로 자동 재시도)
    doneRef.current = false;
    busyRef.current = false;
    setError(null);
    ensureHubRoom({
      roomKey: HUB.roomKey,
      sid: HUB.sid,
      hostId: playerId,
      nickname: hubNickname(),
      avatarIndex: pickAvatarIndex(null, playerId),
    })
      .then(async (room) => {
        if (HUB.device && room && room.phase === GAME_PHASE.LOBBY && !room.cheesePlayerId) {
          try {
            await claimCheeseTerminalIfEmpty(HUB.roomKey, playerId);
          } catch (e) {
            // ignore
          }
        }
        if (!doneRef.current) {
          doneRef.current = true;
          onEnteredRef.current(HUB.roomKey);
        }
      })
      .catch((e) => setError(e.message || '방을 만들지 못했어요'));
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        ...paperBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ animation: 'float 2s ease-in-out infinite' }}>
        <MouseAvatar color={colors.avatarColors[0]} size={86} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink, fontFamily: fonts.display, marginTop: 16, lineHeight: 1.3 }}>
        누가 치즈를 훔쳤을까?
      </div>
      <div style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>
        말랑월드 방 {HUB.room}
        {HUB.name ? ` · ${HUB.name}` : ''}
        {HUB.device ? ' · 🧀 치즈 단말기' : ''}
      </div>
      <div style={{ fontSize: 14, color: colors.ink, marginTop: 20, animation: 'pulse 1.6s ease-in-out infinite', maxWidth: 320, lineHeight: 1.5 }}>
        {status}
      </div>
      {error && (
        <div style={{ fontSize: 12, color: '#C73E5C', marginTop: 12, maxWidth: 320 }}>{error}</div>
      )}
      {error && HUB.host && (
        <button
          onClick={retry}
          style={{
            marginTop: 16,
            padding: '12px 20px',
            background: colors.cheese,
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            color: colors.ink,
            fontFamily: fonts.body,
          }}
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
