import { useState, useEffect } from 'react';
import { colors, fonts, paperBg } from '../utils/theme';
import { createRoom, setupDisconnectHandler } from '../firebase/room';
import { getStoredNickname, getStoredAvatar, setStoredNickname, setStoredAvatar } from '../utils/storage';
import { pickRandomNickname } from '../utils/game';
import MouseAvatar from '../components/MouseAvatar';

export default function Home({ playerId, onCreated, onJoin }) {
  const [nickname, setNickname] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('main'); // main | profile

  useEffect(() => {
    const stored = getStoredNickname();
    setNickname(stored || pickRandomNickname());
    setAvatarIndex(getStoredAvatar());
  }, []);

  async function handleCreate() {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }
    setStoredNickname(nickname);
    setStoredAvatar(avatarIndex);
    setCreating(true);
    try {
      const code = await createRoom({ hostId: playerId, nickname, avatarIndex });
      setupDisconnectHandler(code, playerId);
      onCreated(code);
    } catch (e) {
      setError(e.message);
      setCreating(false);
    }
  }

  if (step === 'profile') {
    return (
      <ProfileSetup
        nickname={nickname}
        avatarIndex={avatarIndex}
        onChangeNickname={setNickname}
        onChangeAvatar={setAvatarIndex}
        actionLabel={creating ? '만드는 중...' : '🎮 방 만들기'}
        actionDisabled={creating}
        onAction={handleCreate}
        onBack={() => setStep('main')}
        error={error}
      />
    );
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
        padding: '40px 24px',
        position: 'relative',
      }}
    >
      <div style={{ animation: 'fadeIn 0.6s ease-out', textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: colors.muted, marginBottom: 8 }}>BOARDGAME</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: colors.ink, fontFamily: fonts.display, lineHeight: 1.3 }}>
          누가 치즈를<br />훔쳤을까?
        </div>
        <div style={{ marginTop: 20, animation: 'float 3s ease-in-out infinite' }}>
          <CheeseIcon size={80} />
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: colors.muted }}>쥐들의 추리 게임 · 4~10인</div>
      </div>

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={() => setStep('profile')}
          style={{
            padding: '16px',
            background: colors.cheese,
            border: 'none',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            color: colors.ink,
            fontFamily: fonts.body,
          }}
        >
          🎮 방 만들기
        </button>
        <button
          onClick={onJoin}
          style={{
            padding: '16px',
            background: colors.paper,
            border: `1px solid ${colors.hint}`,
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            color: colors.ink,
            fontFamily: fonts.body,
          }}
        >
          방 참여하기
        </button>
      </div>

      <div style={{ position: 'absolute', bottom: 24, fontSize: 10, color: colors.muted }}>
        모두 모여서 함께 하는 보드게임
      </div>
    </div>
  );
}

function ProfileSetup({ nickname, avatarIndex, onChangeNickname, onChangeAvatar, actionLabel, actionDisabled, onAction, onBack, error }) {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        ...paperBg,
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
      }}
    >
      <div style={{ paddingTop: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.ink, fontFamily: fonts.display }}>당신은 어떤 쥐?</div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 110,
            height: 110,
            background: colors.paper,
            border: `2px solid ${colors.cheese}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MouseAvatar color={colors.avatarColors[avatarIndex]} size={86} />
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>색상 선택</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', maxWidth: 280, margin: '0 auto' }}>
          {colors.avatarColors.map((c, i) => (
            <button
              key={i}
              onClick={() => onChangeAvatar(i)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: c,
                border: i === avatarIndex ? `3px solid ${colors.cheese}` : `1px solid ${colors.hint}`,
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>닉네임</div>
        <input
          value={nickname}
          onChange={(e) => onChangeNickname(e.target.value.slice(0, 8))}
          placeholder="닉네임 입력"
          maxLength={8}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'white',
            border: `1px solid ${colors.cheese}`,
            borderRadius: 12,
            fontSize: 15,
            color: colors.ink,
            fontFamily: fonts.body,
            outline: 'none',
          }}
        />
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 10, background: '#FCEBEB', borderRadius: 8, fontSize: 12, color: '#A32D2D', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={onAction}
          disabled={actionDisabled}
          style={{
            padding: '14px',
            background: actionDisabled ? colors.hint : colors.cheese,
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            color: colors.ink,
            fontFamily: fonts.body,
            opacity: actionDisabled ? 0.5 : 1,
          }}
        >
          {actionLabel}
        </button>
        <button
          onClick={onBack}
          style={{
            padding: '10px',
            background: 'transparent',
            border: `1px solid ${colors.hint}`,
            borderRadius: 10,
            fontSize: 13,
            color: colors.muted,
            fontFamily: fonts.body,
          }}
        >
          뒤로
        </button>
      </div>
    </div>
  );
}

function CheeseIcon({ size = 48 }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 48 32" style={{ display: 'block' }}>
      <path d="M8 22 L40 22 L44 10 L4 10 Z" fill={colors.cheese} stroke={colors.cheeseDark} strokeWidth="1.5" />
      <circle cx="14" cy="16" r="2" fill={colors.cheeseDark} />
      <circle cx="24" cy="14" r="1.5" fill={colors.cheeseDark} />
      <circle cx="34" cy="17" r="2" fill={colors.cheeseDark} />
      <path d="M8 22 L8 26 L40 26 L40 22 Z" fill="#D4A847" stroke={colors.cheeseDark} strokeWidth="1.5" />
    </svg>
  );
}
