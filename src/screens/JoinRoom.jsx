import { useState, useEffect } from 'react';
import { colors, fonts, paperBg } from '../utils/theme';
import { joinRoom, setupDisconnectHandler } from '../firebase/room';
import { getStoredNickname, getStoredAvatar, setStoredNickname, setStoredAvatar } from '../utils/storage';
import { pickRandomNickname } from '../utils/game';
import MouseAvatar from '../components/MouseAvatar';

export default function JoinRoom({ playerId, onJoined, onBack }) {
  const [code, setCode] = useState('');
  const [step, setStep] = useState('code'); // code | profile
  const [nickname, setNickname] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setNickname(getStoredNickname() || pickRandomNickname());
    setAvatarIndex(getStoredAvatar());

    // URL ?room=XXXX 로 들어왔으면 코드 자동 채움
    const params = new URLSearchParams(window.location.search);
    const r = params.get('room');
    if (r && /^\d{4}$/.test(r)) {
      setCode(r);
    }
  }, []);

  function press(digit) {
    if (code.length < 4) setCode(code + digit);
  }
  function back() {
    setCode(code.slice(0, -1));
  }

  function confirmCode() {
    if (code.length !== 4) {
      setError('4자리 코드를 입력해주세요');
      return;
    }
    setError(null);
    setStep('profile');
  }

  async function doJoin() {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }
    setStoredNickname(nickname);
    setStoredAvatar(avatarIndex);
    setJoining(true);
    try {
      await joinRoom({ roomCode: code, playerId, nickname, avatarIndex });
      setupDisconnectHandler(code, playerId);
      onJoined(code);
    } catch (e) {
      setError(e.message);
      setJoining(false);
    }
  }

  if (step === 'profile') {
    return (
      <ProfileSetup
        nickname={nickname}
        avatarIndex={avatarIndex}
        onChangeNickname={setNickname}
        onChangeAvatar={setAvatarIndex}
        roomCode={code}
        joining={joining}
        onConfirm={doJoin}
        onBack={() => setStep('code')}
        error={error}
      />
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', ...paperBg, padding: 24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', paddingTop: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: colors.ink, fontFamily: fonts.display }}>방 참여하기</div>
        <div style={{ fontSize: 11, color: colors.muted, marginTop: 6 }}>방 코드 4자리를 입력하세요</div>
      </div>

      {/* 코드 디스플레이 */}
      <div style={{ marginTop: 28, display: 'flex', gap: 8, justifyContent: 'center' }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 48,
              height: 56,
              background: 'white',
              border: `1.5px solid ${i < code.length ? colors.cheese : colors.hint}`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 700,
              color: colors.ink,
            }}
          >
            {code[i] || ''}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 10, background: '#FCEBEB', borderRadius: 8, fontSize: 12, color: '#A32D2D', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* 키패드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <KeyButton key={n} onClick={() => press(String(n))}>{n}</KeyButton>
        ))}
        <KeyButton onClick={back} subtle>⌫</KeyButton>
        <KeyButton onClick={() => press('0')}>0</KeyButton>
        <KeyButton onClick={confirmCode} primary>→</KeyButton>
      </div>

      <button
        onClick={onBack}
        style={{
          padding: '10px',
          background: 'transparent',
          border: 'none',
          fontSize: 12,
          color: colors.muted,
          fontFamily: fonts.body,
        }}
      >
        ← 뒤로
      </button>
    </div>
  );
}

function KeyButton({ children, onClick, primary, subtle }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 0',
        background: primary ? colors.cheese : colors.paper,
        border: `0.5px solid ${colors.hint}`,
        borderRadius: 10,
        fontSize: subtle ? 16 : 20,
        fontWeight: 700,
        color: primary ? colors.ink : colors.ink,
        fontFamily: fonts.body,
      }}
    >
      {children}
    </button>
  );
}

function ProfileSetup({ nickname, avatarIndex, onChangeNickname, onChangeAvatar, roomCode, joining, onConfirm, onBack, error }) {
  return (
    <div style={{ height: '100vh', width: '100vw', ...paperBg, padding: 24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', paddingTop: 16 }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: colors.muted }}>
          방 코드 <span style={{ color: colors.ink, fontWeight: 700 }}>{roomCode}</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: colors.ink, marginTop: 8, fontFamily: fonts.display }}>당신은 어떤 쥐?</div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 100,
            height: 100,
            background: colors.paper,
            border: `2px solid ${colors.cheese}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MouseAvatar color={colors.avatarColors[avatarIndex]} size={78} />
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>색상 선택</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', maxWidth: 280, margin: '0 auto' }}>
          {colors.avatarColors.map((c, i) => (
            <button
              key={i}
              onClick={() => onChangeAvatar(i)}
              style={{
                width: 26,
                height: 26,
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

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>닉네임</div>
        <input
          value={nickname}
          onChange={(e) => onChangeNickname(e.target.value.slice(0, 8))}
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
          onClick={onConfirm}
          disabled={joining}
          style={{
            padding: '14px',
            background: joining ? colors.hint : colors.cheese,
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            color: colors.ink,
            fontFamily: fonts.body,
          }}
        >
          {joining ? '입장 중...' : '입장하기'}
        </button>
        <button
          onClick={onBack}
          style={{
            padding: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: 12,
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
