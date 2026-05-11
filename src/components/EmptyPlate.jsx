// 치즈 도난 후 빈 접시
export default function EmptyPlate({ size = 320 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 320 200" style={{ display: 'block' }}>
      <ellipse cx="160" cy="150" rx="135" ry="22" fill="#000" opacity="0.5" />
      <ellipse cx="160" cy="140" rx="135" ry="30" fill="#3A2818" />
      <ellipse cx="160" cy="128" rx="128" ry="26" fill="#5A4628" />
      <ellipse cx="160" cy="123" rx="120" ry="22" fill="#7A5A38" />
      <ellipse cx="160" cy="120" rx="110" ry="18" fill="#8B6A40" />
      <ellipse cx="160" cy="116" rx="100" ry="14" fill="#6A4A28" />
      {/* 부스러기 */}
      <circle cx="120" cy="115" r="2" fill="#F4D06F" opacity="0.7" />
      <circle cx="180" cy="118" r="1.5" fill="#F4D06F" opacity="0.6" />
      <circle cx="155" cy="112" r="1.8" fill="#F4D06F" opacity="0.5" />
      <circle cx="200" cy="114" r="1.2" fill="#F4D06F" opacity="0.5" />
    </svg>
  );
}
