// 치즈 도난 후 빈 접시 — 그림: public/img/plate.webp
export default function EmptyPlate({ size = 320 }) {
  return (
    <img
      src="/img/plate.webp"
      alt="빈 접시"
      style={{ display: 'block', width: size, height: size, objectFit: 'contain',
        WebkitMaskImage: 'radial-gradient(circle, #000 55%, transparent 72%)', maskImage: 'radial-gradient(circle, #000 55%, transparent 72%)' }}
    />
  );
}
