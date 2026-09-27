/** Simple five-petal bloom used as the brand mark. */
export default function Bloom({ size = 44, className }: { size?: number; className?: string }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4B8C8" />
          <stop offset="1" stopColor="#CDB6EE" />
        </linearGradient>
      </defs>
      <g transform="translate(50 50)">
        {petals.map((r) => (
          <ellipse key={r} cx="0" cy="-21" rx="14" ry="24" fill="url(#petal)" opacity="0.85" transform={`rotate(${r})`} />
        ))}
        <circle r="9" fill="#FFF3E6" />
        <circle r="5" fill="#F2C9A0" />
      </g>
    </svg>
  );
}
