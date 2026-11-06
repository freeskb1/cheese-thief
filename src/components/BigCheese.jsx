// 풀스크린 치즈 (중앙 폰) — 그림: public/img/cheese.webp
export default function BigCheese({ size = 320, dim = false, onClick }) {
  return (
    <img
      src="/img/cheese.webp"
      alt="치즈"
      onClick={onClick}
      style={{
        display: 'block', width: size, height: size, objectFit: 'contain',
        cursor: onClick ? 'pointer' : 'default',
        opacity: dim ? 0.5 : 1, transition: 'opacity 0.3s',
        WebkitMaskImage: 'radial-gradient(circle, #000 52%, transparent 71%)', maskImage: 'radial-gradient(circle, #000 52%, transparent 71%)',
        animation: onClick ? 'float 3.2s ease-in-out infinite' : 'none',
      }}
    />
  );
}
