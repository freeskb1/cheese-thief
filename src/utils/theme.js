// 디자인 시스템 토큰 (대화에서 확정한 컬러 팔레트)
export const colors = {
  // 메인 톤 (따뜻한 동화풍 + 수채화)
  cream: '#FAF3E3',      // 메인 배경
  paper: '#FFFBF0',      // 카드/패널 배경
  cheese: '#F4D06F',     // 포인트 / CTA / 치즈
  cheeseLight: '#FFE99F',
  cheeseDark: '#B89540',
  wood: '#D4956B',       // 컵, 나무
  woodDark: '#8B6940',
  sage: '#9CAF88',       // 잎사귀, 보조 강조
  sageDark: '#5C7A48',

  // 어두운 톤 (밤 분위기)
  midnight: '#2A2540',
  midnightLight: '#3A2F4F',
  midnightDeep: '#1A1530',
  midnightBorder: '#5A4878',
  midnightText: '#B5A8C5',
  midnightSub: '#8B7A95',

  // 텍스트
  ink: '#5C4A2A',        // 본문
  muted: '#8B7A55',      // 보조 텍스트
  hint: '#C9B98A',       // 힌트/구분선

  // 캐릭터 색상 (10가지)
  avatarColors: [
    '#D9C8B0', // 베이지
    '#C9967A', // 코랄
    '#A8A0C5', // 라벤더
    '#9CAF88', // 세이지
    '#E8B5A0', // 살구
    '#7A6855', // 그레이
    '#B5C9D4', // 스카이
    '#E0A8C5', // 핑크
    '#C8A876', // 머스타드
    '#8FB5A8', // 민트
  ],

  // 역할 색상
  thief: '#7A6855',
  troll: '#C73E5C',

  // 상태
  success: '#9CAF88',
  warning: '#F4D06F',
  danger: '#C73E5C',
};

export const fonts = {
  body: "'Gowun Dodum', 'Apple SD Gothic Neo', sans-serif",
  display: "'Gaegu', 'Gowun Dodum', sans-serif",
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
};

// 종이 질감 배경
export const paperBg = {
  background: colors.cream,
  backgroundImage: 'radial-gradient(circle at 1px 1px, #E8DDC0 1px, transparent 0)',
  backgroundSize: '6px 6px',
};

// 밤하늘 배경 (별 포함은 별도 컴포넌트에서)
export const nightBg = {
  background: colors.midnight,
};
