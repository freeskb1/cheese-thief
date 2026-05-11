// 밤하늘 별 배경 (절대 위치, 자식 컴포넌트 위에 깔림)
export default function StarryNight({ density = 'medium' }) {
  const count = density === 'high' ? 20 : density === 'low' ? 8 : 14;
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: 0.5 + Math.random() * 1.2,
      opacity: 0.3 + Math.random() * 0.6,
    });
  }
  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#F4D06F" opacity={s.opacity} />
      ))}
    </svg>
  );
}
