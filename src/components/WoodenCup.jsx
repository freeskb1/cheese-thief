// 그루터기 컵 (개인 폰 — 사실 잠든 화면에서는 안 보이지만 셋업/들춰진 상태에서 필요)
export default function WoodenCup({ size = 180, dark = false }) {
  const trunkLight = dark ? '#7A5A38' : '#C49A6E';
  const trunkDark = dark ? '#5A4628' : '#8B6940';
  const top = dark ? '#6A4828' : '#A57A50';
  const topDark = dark ? '#4A3018' : '#7A5A38';
  const shadow = dark ? 0.3 : 0.1;

  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 200 180" style={{ display: 'block' }}>
      <ellipse cx="100" cy="160" rx="80" ry="14" fill="#000" opacity={shadow} />
      <ellipse cx="100" cy="155" rx="78" ry="16" fill={trunkDark} />
      <path
        d="M22 155 Q22 60 100 56 Q178 60 178 155 Z"
        fill={trunkLight}
        stroke={trunkDark}
        strokeWidth="1.5"
      />
      <ellipse cx="100" cy="56" rx="78" ry="14" fill={top} />
      <ellipse cx="100" cy="56" rx="68" ry="9" fill={topDark} />
    </svg>
  );
}
