import { colors } from '../utils/theme';

// 쥐 아바타 — color: 본체 색상 (avatarColors 중 하나)
// role: 'sleepyhead' | 'thief' | 'troll' | undefined
// size: 픽셀 단위
export default function MouseAvatar({ color, role, size = 60 }) {
  const bodyColor = color || colors.avatarColors[0];

  return (
    <svg width={size} height={size} viewBox="0 0 50 50" style={{ display: 'block' }}>
      {/* 본체 */}
      <ellipse cx="25" cy="28" rx="16" ry="15" fill={bodyColor} />
      {/* 귀 */}
      <ellipse cx="13" cy="20" rx="6" ry="7" fill={bodyColor} />
      <ellipse cx="37" cy="20" rx="6" ry="7" fill={bodyColor} />
      <ellipse cx="13" cy="20" rx="3" ry="3.5" fill={role === 'thief' ? '#4A3E32' : '#F2B5C4'} />
      <ellipse cx="37" cy="20" rx="3" ry="3.5" fill={role === 'thief' ? '#4A3E32' : '#F2B5C4'} />

      {role === 'thief' ? (
        <>
          {/* 도둑: 마스크 */}
          <rect x="12" y="25" width="26" height="6" fill="#1A1510" />
          <circle cx="19" cy="28" r="2" fill="#F4D06F" />
          <circle cx="31" cy="28" r="2" fill="#F4D06F" />
          <path d="M19 35 Q25 32 31 35" stroke="#1A1510" strokeWidth="1.5" fill="none" />
          <ellipse cx="25" cy="33" rx="2" ry="1.5" fill="#3A3025" />
        </>
      ) : role === 'troll' ? (
        <>
          {/* 트롤: 광대 모자 + 윙크 */}
          <path
            d="M9 12 L14 5 L19 12 L25 5 L31 12 L36 5 L41 12"
            stroke="#C73E5C"
            strokeWidth="1.5"
            fill="#F4D06F"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="9" r="1" fill="#9CAF88" />
          <circle cx="25" cy="9" r="1" fill="#5B4A6E" />
          <circle cx="34" cy="9" r="1" fill="#C73E5C" />
          {/* 윙크 */}
          <path d="M16 26 L22 28 L16 30 Z" fill="#2A2520" />
          <path d="M28 27 Q31 24 34 27" stroke="#2A2520" strokeWidth="1.5" fill="none" />
          {/* 장난스러운 입 */}
          <path d="M18 36 Q22 40 25 37 Q28 34 31 39" stroke="#2A2520" strokeWidth="1.2" fill="none" />
          <ellipse cx="25" cy="32" rx="2" ry="1.5" fill="#E89B9B" />
        </>
      ) : (
        <>
          {/* 잠꾸러기 (기본): 평온한 얼굴 */}
          <circle cx="20" cy="27" r="1.5" fill="#2A2520" />
          <circle cx="30" cy="27" r="1.5" fill="#2A2520" />
          <ellipse cx="25" cy="32" rx="2" ry="1.5" fill="#E89B9B" />
        </>
      )}
    </svg>
  );
}
