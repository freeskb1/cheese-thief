// 풀스크린 치즈 (중앙 폰)
export default function BigCheese({ size = 320, dim = false, onClick }) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 320 380"
      onClick={onClick}
      style={{
        display: 'block',
        cursor: onClick ? 'pointer' : 'default',
        opacity: dim ? 0.5 : 1,
        transition: 'opacity 0.3s',
        filter: onClick ? 'drop-shadow(0 0 30px rgba(244, 208, 111, 0.3))' : 'none',
      }}
    >
      {/* 글로우 */}
      <ellipse cx="160" cy="200" rx="155" ry="170" fill="#F4D06F" opacity="0.08" />
      <ellipse cx="160" cy="200" rx="120" ry="140" fill="#F4D06F" opacity="0.1" />
      <ellipse cx="160" cy="200" rx="90" ry="110" fill="#F4D06F" opacity="0.12" />

      {/* 접시 */}
      <ellipse cx="160" cy="350" rx="135" ry="20" fill="#000" opacity="0.4" />
      <ellipse cx="160" cy="340" rx="135" ry="28" fill="#3A2818" />
      <ellipse cx="160" cy="328" rx="128" ry="24" fill="#5A4628" />
      <ellipse cx="160" cy="323" rx="120" ry="20" fill="#7A5A38" />
      <ellipse cx="160" cy="320" rx="110" ry="16" fill="#8B6A40" />

      {/* 치즈 (큰 쐐기) */}
      <path
        d="M50 310 L270 310 L290 100 L30 100 Z"
        fill="#F4D06F"
        stroke="#B89540"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M50 310 L270 310 L270 328 L50 328 Z" fill="#D4A847" stroke="#B89540" strokeWidth="3" />

      {/* 윗면 하이라이트 */}
      <path d="M55 115 L265 115 L262 145 L60 145 Z" fill="#FFE099" opacity="0.5" />

      {/* 구멍들 */}
      <ellipse cx="90" cy="200" rx="18" ry="14" fill="#B89540" />
      <ellipse cx="93" cy="195" rx="9" ry="7" fill="#8B6940" />

      <ellipse cx="160" cy="170" rx="14" ry="11" fill="#B89540" />
      <ellipse cx="163" cy="167" rx="7" ry="5" fill="#8B6940" />

      <ellipse cx="220" cy="220" rx="16" ry="12" fill="#B89540" />
      <ellipse cx="223" cy="216" rx="8" ry="6" fill="#8B6940" />

      <ellipse cx="120" cy="260" rx="12" ry="9" fill="#B89540" />
      <ellipse cx="123" cy="257" rx="6" ry="4" fill="#8B6940" />

      <ellipse cx="200" cy="280" rx="10" ry="8" fill="#B89540" />
      <ellipse cx="202" cy="278" rx="5" ry="4" fill="#8B6940" />

      <ellipse cx="240" cy="135" rx="8" ry="6" fill="#B89540" />
      <ellipse cx="242" cy="133" rx="4" ry="3" fill="#8B6940" />

      <ellipse cx="70" cy="270" rx="9" ry="7" fill="#B89540" />
      <ellipse cx="72" cy="268" rx="4" ry="3" fill="#8B6940" />

      <ellipse cx="170" cy="290" rx="11" ry="8" fill="#B89540" />
      <ellipse cx="172" cy="288" rx="5" ry="4" fill="#8B6940" />
    </svg>
  );
}
