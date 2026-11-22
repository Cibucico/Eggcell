/**
 * Generated artwork for courses and sessions that have no image yet. The
 * pattern is picked from the item's name, so each one looks different but
 * stays the same between visits. Colours come from the active brand.
 */
function seedOf(text: string): number {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function CoverArt({ seed, className }: { seed: string; className?: string }) {
  const n = seedOf(seed);
  const variant = n % 3;
  const tilt = (n % 40) - 20;
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <defs>
        <radialGradient id={`g-${n}`} cx="80%" cy="10%" r="90%">
          <stop offset="0%" stopColor="var(--brand-primary)" />
          <stop offset="100%" stopColor="var(--brand-deep)" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#g-${n})`} />
      {variant === 0 &&
        [120, 95, 70, 45].map((r, i) => (
          <circle
            key={r}
            cx="250"
            cy="190"
            r={r}
            fill="none"
            stroke="var(--brand-accent)"
            strokeOpacity={0.25 + i * 0.18}
            strokeWidth="1.5"
          />
        ))}
      {variant === 1 && (
        <g transform={`rotate(${tilt} 220 90)`}>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={150 + i * 34}
              y={40 - i * 6}
              width="26"
              height={120 + i * 12}
              rx="13"
              fill="var(--brand-accent)"
              fillOpacity={0.2 + i * 0.2}
            />
          ))}
        </g>
      )}
      {variant === 2 && (
        <>
          <circle cx="235" cy="70" r="56" fill="var(--brand-accent)" fillOpacity="0.85" />
          <circle cx="275" cy="120" r="42" fill="var(--brand-deep-fg)" fillOpacity="0.15" />
          <path d="M150 180 Q 230 90 320 140 L 320 180 Z" fill="var(--brand-deep)" fillOpacity="0.55" />
        </>
      )}
    </svg>
  );
}
