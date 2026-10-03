/** Faint territory map: dot grid, winding routes and scattered pins. Decorative only. */
export function TerritoryBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 size-full text-primary animate-rise-in"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.12" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="m">
            <rect width="400" height="800" fill="url(#fade)" />
          </mask>
        </defs>
        <g mask="url(#m)">
          <rect width="400" height="800" fill="url(#dots)" />
          <g stroke="currentColor" strokeWidth="1.2" opacity="0.22" strokeLinecap="round">
            <path className="animate-draw-line" d="M-20 180 C 80 160, 120 260, 210 240 S 360 150, 430 210" />
            <path className="animate-draw-line" style={{ animationDelay: "150ms" }} d="M-20 600 C 90 560, 140 640, 230 610 S 350 520, 430 560" />
            <path className="animate-draw-line" style={{ animationDelay: "300ms" }} d="M70 -20 C 60 120, 130 220, 100 360 S 40 620, 90 820" strokeDasharray="2 8" />
            <path className="animate-draw-line" style={{ animationDelay: "300ms" }} d="M330 -20 C 350 140, 290 260, 320 420 S 370 640, 320 820" strokeDasharray="2 8" />
          </g>
          <g fill="currentColor" opacity="0.35">
            <circle cx="100" cy="230" r="3" />
            <circle cx="300" cy="190" r="3" />
            <circle cx="90" cy="590" r="3" />
            <circle cx="320" cy="560" r="3" />
            <circle cx="210" cy="242" r="2" />
            <circle cx="230" cy="610" r="2" />
          </g>
          <g stroke="currentColor" opacity="0.18">
            <circle cx="200" cy="360" r="120" />
            <circle cx="200" cy="360" r="180" strokeDasharray="3 6" />
            <circle cx="200" cy="360" r="250" />
          </g>
        </g>
      </svg>
    </div>
  );
}
