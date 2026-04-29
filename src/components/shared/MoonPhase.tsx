import React from 'react';

interface MoonPhaseProps {
  day: number;
  size?: number;
  isDark?: boolean;
}

/**
 * Renders a moon phase SVG based on the Tibetan lunar day.
 * Full Moon (15) and New Moon (1, 30) render at full opacity — sacred days.
 * All other phases render at reduced opacity (subtle background indicator).
 */
export function MoonPhase({ day, size = 10, isDark = false }: MoonPhaseProps) {
  const fg = isDark ? '#ffffff' : '#1c1917';
  const bg = isDark ? '#33333366' : '#d6d3d1';
  const stroke = isDark ? '#ffffffcc' : '#1c1917';
  const strokeW = 1.8;
  const r = 10;
  const cx = 12;
  const cy = 12;

  // Only render on sacred days — Full Moon (15) and New Moon (30)
  const isSacred = day === 15 || day === 30;
  if (!isSacred) return null;

  const wrapperStyle: React.CSSProperties = { display: 'inline-flex' };

  let svgContent: React.ReactNode;

  if (day === 15) {
    // Full Moon — bold white circle
    svgContent = (
      <circle cx={cx} cy={cy} r={r} fill={isDark ? '#fffbeb' : '#ffffff'} stroke={stroke} strokeWidth={strokeW + 0.7} />
    );
  } else if (day === 30 || day === 1) {
    // New Moon — complete black circle with white border
    svgContent = (
      <circle cx={cx} cy={cy} r={r} fill="#000000" stroke="#ffffff" strokeWidth={strokeW + 0.5} />
    );
  } else if (day === 8) {
    // First Quarter — right half lit
    svgContent = (
      <>
        <circle cx={cx} cy={cy} r={r} fill={bg} stroke={stroke} strokeWidth={strokeW} />
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`} fill={fg} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={strokeW} />
      </>
    );
  } else if (day === 22) {
    // Last Quarter — left half lit
    svgContent = (
      <>
        <circle cx={cx} cy={cy} r={r} fill={bg} stroke={stroke} strokeWidth={strokeW} />
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`} fill={fg} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={strokeW} />
      </>
    );
  } else if (day >= 2 && day <= 7) {
    // Waxing crescent
    const fraction = day / 15;
    const x = cx + r * (1 - 2 * fraction);
    svgContent = (
      <>
        <circle cx={cx} cy={cy} r={r} fill={bg} stroke={stroke} strokeWidth={strokeW} />
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${Math.abs(x - cx)} ${r} 0 0 0 ${cx} ${cy - r}`}
          fill={fg}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={strokeW} />
      </>
    );
  } else if (day >= 9 && day <= 14) {
    // Waxing gibbous
    const fraction = (day - 8) / 7;
    const x = cx - r * fraction;
    svgContent = (
      <>
        <circle cx={cx} cy={cy} r={r} fill={fg} stroke={stroke} strokeWidth={strokeW} />
        <path
          d={`M ${cx} ${cy - r} A ${Math.abs(x - cx)} ${r} 0 0 0 ${cx} ${cy + r} A ${r} ${r} 0 0 0 ${cx} ${cy - r}`}
          fill={bg}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={strokeW} />
      </>
    );
  } else if (day >= 16 && day <= 21) {
    // Waning gibbous
    const fraction = (day - 15) / 7;
    const x = cx + r * fraction;
    svgContent = (
      <>
        <circle cx={cx} cy={cy} r={r} fill={fg} stroke={stroke} strokeWidth={strokeW} />
        <path
          d={`M ${cx} ${cy - r} A ${Math.abs(x - cx)} ${r} 0 0 1 ${cx} ${cy + r} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`}
          fill={bg}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={strokeW} />
      </>
    );
  } else if (day >= 23 && day <= 29) {
    // Waning crescent
    const fraction = (29 - day) / 7;
    const x = cx - r * (1 - 2 * fraction);
    svgContent = (
      <>
        <circle cx={cx} cy={cy} r={r} fill={bg} stroke={stroke} strokeWidth={strokeW} />
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${Math.abs(x - cx)} ${r} 0 0 1 ${cx} ${cy - r}`}
          fill={fg}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={strokeW} />
      </>
    );
  } else {
    // Fallback — dim circle
    svgContent = (
      <circle cx={cx} cy={cy} r={r} fill={bg} stroke={stroke} strokeWidth={strokeW} />
    );
  }

  return (
    <span style={wrapperStyle}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {svgContent}
      </svg>
    </span>
  );
}
