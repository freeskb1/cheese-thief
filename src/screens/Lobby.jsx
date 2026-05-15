import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { colors, fonts, paperBg } from '../utils/theme';
import { setCheesePlayer, updateOptions, startGame, leaveRoom } from '../firebase/room';
import { MIN_PLAYERS, MAX_PLAYERS } from '../utils/game';
import { unlockTTS } from '../utils/tts';
import MouseAvatar from '../components/MouseAvatar';

export default function Lobby({ room, roomCode, playerId, onShowRules, onLeave }) {
  const [qrUrl, setQrUrl] = useState(null);
  const isHost = room.hostId === playerId;
  const players = room.players || {};
  const playerIds = Object.keys(players);
  const cheesePlayerId = room.cheesePlayerId;

  // 참가자 수 = 전체 - 치즈 단말
  const participantCount = playerIds.filter((id) => id !== cheesePlayerId).length;

  useEffect(() => {
    const url = `${window.location.origin}/?room=${roomCode}`;
    QRCode.toDataURL(url, {
      margin: 1,
      width: 240,
      color: { dark: '#2A2520', light: '#FFFFFF' },
    }).then(setQrUrl);
  }, [roomCode]);

  function toggleCheesePlayer(pid) {
    if (!isHost) return;
    setCheesePlayer(roomCode, cheesePlayerId === pid ? null : pid);
  }

  function toggleOption(key) {
    if (!isHost) return;
    updateOptions(roomCode, { [key]: !room.options?.[key] });
  }

  function handleStart() {
    if (!isHost) return;
    if (cheesePlayerId == null) return;
    if (participantCount < MIN_PLAYERS) return;
    unlockTTS(); // 사용자 인터랙션 - TTS 잠금 해제
    startGame(roomCode);
  }

  function handleLeave() {
    leaveRoom(roomCode, playerId);
    onLeave();
  }

  const canStart = isHost && cheesePlayerId != null && participantCount >= MIN_PLAYERS;
  const slots = Array.from({ length: MAX_PLAYERS }, (_, i) => playerIds[i] || null);

  return (
    <div style={{ height: '100vh', width: '100vw', ...paperBg, overflow: 'auto' }}>
      <div style={{ padding: '24px 16px 100px', maxWidth: 480, margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: colors.muted }}>{isHost ? 'HOST · 방장' : 'PLAYER · 참가자'}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: colors.ink, fontFamily: fonts.display, marginTop: 6, lineHeight: 1.3 }}>
            누가 치즈를<br />훔쳤을까?
          </div>
        </div>

        {/* 방 코드 */}
        <div style={{ background: colors.paper, padding: 16, borderRadius: 16, border: `0.5px solid ${colors.hint}`, textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: colors.muted, letterSpacing: 1, marginBottom: 6 }}>방 코드</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: colors.ink, letterSpacing: 8, fontFamily: 'monospace' }}>
            {roomCode}
          </div>
        </div>

        {/* QR */}
        {qrUrl && (
          <div style={{ background: colors.paper, padding: 12, borderRadius: 14, border: `0.5px solid ${colors.hint}`, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <img src={qrUrl} alt="QR" style={{ width: 60, height: 60, borderRadius: 4 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.ink, marginBottom: 4 }}>QR로 빠른 입장</div>
              <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.4 }}>친구 폰 카메라로 스캔</div>
            </div>
          </div>
        )}

        {/* 입장한 쥐들 */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.ink }}>
              입장한 쥐들 · {participantCount}명
            </div>
            <div style={{ fontSize: 10, color: colors.muted }}>최소 {MIN_PLAYERS}명 필요</div>
          </div>

          {isHost && (
            <div style={{ padding: '8px 10px', background: 'rgba(244, 208, 111, 0.15)', borderRadius: 8, border: `0.5px dashed ${colors.hint}`, marginBottom: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: colors.muted }}>🧀 누구를 치즈 단말로? · 쥐를 탭하세요</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {slots.map((pid, i) => (
              <PlayerSlot
                key={i}
                pid={pid}
                player={pid ? players[pid] : null}
                isHost={pid && players[pid]?.isHost}
                isCheese={pid && pid === cheesePlayerId}
                isMe={pid && pid === playerId}
                canTap={isHost && pid != null}
                onTap={() => pid && toggleCheesePlayer(pid)}
              />
            ))}
          </div>
        </div>

        {/* 옵션 */}
        <OptionToggle
          label="트롤 쥐 포함"
          desc="의심을 자기에게 몰아 단독 승리"
          on={!!room.options?.includeTroll}
          disabled={!isHost}
          onToggle={() => toggleOption('includeTroll')}
        />
        <OptionToggle
          label="추종자 룰 변형"
          desc="OFF: 원작 (6~8인은 6시 후 손 뻗기) · ON: 변형 (도둑이 깰 때 즉시 공범 지정)"
          on={!!room.options?.followerRuleVariant}
          disabled={!isHost}
          onToggle={() => toggleOption('followerRuleVariant')}
        />
        <OptionToggle
          label="빠른 모드"
          desc="ON: 행동 시간 7초 · OFF: 10초 (기본)"
          on={!!room.options?.fastMode}
          disabled={!isHost}
          onToggle={() => toggleOption('fastMode')}
        />
        <OptionToggle
          label="초세기 나레이션"
          desc="시간 호명 후 카운트다운 들려주기 (여유 ↑ 긴장감 ↓)"
          on={!!room.options?.countNarration}
          disabled={!isHost}
          onToggle={() => toggleOption('countNarration')}
        />

        {/* 룰 설명 */}
        <button
          onClick={onShowRules}
          style={{
            width: '100%',
            padding: '12px',
            background: colors.paper,
            border: `0.5px solid ${colors.sage}`,
            borderRadius: 12,
            fontSize: 14,
            color: colors.ink,
            fontFamily: fonts.body,
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          📖 룰 설명 보기
        </button>

        {/* 시작 / 나가기 */}
        {isHost ? (
          <button
            onClick={handleStart}
            disabled={!canStart}
            style={{
              width: '100%',
              padding: '16px',
              background: canStart ? colors.cheese : colors.hint,
              border: 'none',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              color: colors.ink,
              fontFamily: fonts.body,
              marginTop: 12,
              opacity: canStart ? 1 : 0.6,
            }}
          >
            🧀 게임 시작
          </button>
        ) : (
          <div style={{ marginTop: 12, padding: 12, background: colors.paper, borderRadius: 10, textAlign: 'center', border: `0.5px solid ${colors.hint}` }}>
            <div style={{ fontSize: 12, color: colors.muted }}>방장이 시작하기를 기다리는 중...</div>
          </div>
        )}

        {!canStart && isHost && (
          <div style={{ fontSize: 10, color: colors.muted, textAlign: 'center', marginTop: 6 }}>
            {cheesePlayerId == null
              ? '치즈 단말을 지정하세요'
              : `참가자 ${participantCount}명 (최소 ${MIN_PLAYERS}명)`}
          </div>
        )}

        <button
          onClick={handleLeave}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: 12,
            color: colors.muted,
            fontFamily: fonts.body,
            marginTop: 16,
          }}
        >
          방 나가기
        </button>

        <div style={{ fontSize: 10, color: colors.muted, textAlign: 'center', marginTop: 8 }}>
          중앙 폰을 테이블 가운데에 두세요
        </div>
      </div>
    </div>
  );
}

function PlayerSlot({ pid, player, isHost, isCheese, isMe, canTap, onTap }) {
  if (!pid) {
    return (
      <div
        style={{
          background: '#F4EFE0',
          borderRadius: 10,
          padding: '8px 2px',
          textAlign: 'center',
          border: `0.5px dashed ${colors.hint}`,
          opacity: 0.5,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#E8DDC0',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: colors.muted,
          }}
        >
          +
        </div>
        <div style={{ fontSize: 9, color: colors.muted, marginTop: 2 }}>대기중</div>
      </div>
    );
  }

  if (isCheese) {
    return (
      <button
        onClick={canTap ? onTap : undefined}
        style={{
          background: colors.midnight,
          borderRadius: 10,
          padding: '8px 2px',
          textAlign: 'center',
          border: `1.5px solid ${colors.cheese}`,
          position: 'relative',
          cursor: canTap ? 'pointer' : 'default',
        }}
      >
        <CheeseIconMini />
        <div style={{ fontSize: 9, color: colors.cheese, marginTop: 4 }}>🧀 {player.nickname}</div>
        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            fontSize: 7,
            background: colors.cheese,
            color: colors.ink,
            padding: '1px 4px',
            borderRadius: 4,
            fontWeight: 700,
          }}
        >
          치즈
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={canTap ? onTap : undefined}
      style={{
        background: colors.paper,
        borderRadius: 10,
        padding: '8px 2px',
        textAlign: 'center',
        border: `${isMe ? '1.5' : '0.5'}px solid ${isMe ? colors.cheese : colors.hint}`,
        cursor: canTap ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <MouseAvatar color={colors.avatarColors[player.avatarIndex] || colors.avatarColors[0]} size={34} />
      </div>
      <div style={{ fontSize: 9, color: colors.ink, marginTop: 2 }}>
        {isHost ? '👑 ' : ''}{player.nickname}
      </div>
    </button>
  );
}

function OptionToggle({ label, desc, on, disabled, onToggle }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        background: colors.paper,
        borderRadius: 14,
        border: `0.5px solid ${colors.hint}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.ink, display: 'flex', gap: 6, alignItems: 'center' }}>
          {label}
          {disabled && (
            <span style={{ fontSize: 9, background: colors.hint, color: colors.ink, padding: '2px 5px', borderRadius: 6 }}>방장 전용</span>
          )}
          {!disabled && (
            <span style={{ fontSize: 9, background: colors.cheese, color: colors.ink, padding: '2px 5px', borderRadius: 6 }}>방장 전용</span>
          )}
        </div>
        <div style={{ fontSize: 10, color: colors.muted, marginTop: 3 }}>{desc}</div>
      </div>
      <button
        onClick={disabled ? undefined : onToggle}
        disabled={disabled}
        style={{
          width: 44,
          height: 24,
          background: on ? colors.cheese : colors.hint,
          borderRadius: 12,
          position: 'relative',
          border: 'none',
          cursor: disabled ? 'default' : 'pointer',
          padding: 0,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: on ? 22 : 2,
            width: 20,
            height: 20,
            background: 'white',
            borderRadius: '50%',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );
}

function CheeseIconMini() {
  return (
    <svg width="34" height="22" viewBox="0 0 48 32" style={{ display: 'block', margin: '4px auto 0' }}>
      <path d="M8 22 L40 22 L44 10 L4 10 Z" fill={colors.cheese} stroke={colors.cheeseDark} strokeWidth="1" />
      <circle cx="14" cy="16" r="2" fill={colors.cheeseDark} />
      <circle cx="24" cy="14" r="1.5" fill={colors.cheeseDark} />
      <circle cx="34" cy="17" r="2" fill={colors.cheeseDark} />
      <path d="M8 22 L8 26 L40 26 L40 22 Z" fill="#D4A847" stroke={colors.cheeseDark} strokeWidth="1" />
    </svg>
  );
}
