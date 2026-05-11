// 주사위 (1~6)
const DOT_POSITIONS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

export default function Dice({ value = 1, size = 120, rolling = false }) {
  const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        display: 'block',
        animation: rolling ? 'shake 0.4s infinite' : 'none',
        filter: 'drop-shadow(3px 3px 0 #C9B98A)',
      }}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
      `}</style>
      <rect x="6" y="6" width="88" height="88" rx="14" fill="#F4F0E0" stroke="#5C4A2A" strokeWidth="2" />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="8" fill="#5C4A2A" />
      ))}
    </svg>
  );
}
