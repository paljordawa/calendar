import React from 'react';

/** 8-spoke Dharma Wheel (Dharmachakra) — sacred wheel of Buddhist law */
export function DharmaWheel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 - 90) * (Math.PI / 180);
        return (
          <g key={i}>
            <line x1="50" y1="50" x2={50 + 40 * Math.cos(a)} y2={50 + 40 * Math.sin(a)}
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={50 + 44 * Math.cos(a)} cy={50 + 44 * Math.sin(a)} r="2.5" fill="currentColor" />
          </g>
        );
      })}
    </svg>
  );
}

/** Endless Knot (དཔལ་བེའུ / Palbu) — symbol of interdependence and infinite wisdom */
export function EndlessKnot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M40 5 L75 40 L40 75 L5 40 Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 20 L60 40 L40 60 L20 40 Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="40" y1="5" x2="40" y2="75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="40" x2="75" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="17" x2="63" y2="63" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 4" />
      <line x1="63" y1="17" x2="17" y2="63" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 4" />
      <circle cx="40" cy="5" r="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="75" cy="40" r="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="40" cy="75" r="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="5" cy="40" r="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="63" cy="17" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="17" cy="63" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="63" cy="63" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="40" cy="40" r="7" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="40" cy="40" r="2.5" fill="currentColor" />
    </svg>
  );
}

/** Prayer Flags Strip — 5 colours representing sky, air, fire, water, earth */
export function PrayerFlagsStrip() {
  const flags = [
    '#1B5EAE', // blue  — sky / wind
    '#DEDAD4', // white — air / clouds
    '#B83028', // red   — fire
    '#3A7D44', // green — water
    '#D97706', // yellow/saffron — earth
  ];
  return (
    <div className="fixed top-0 inset-x-0 z-[55] flex h-[5px] pointer-events-none overflow-hidden">
      {flags.map((c, i) => (
        <div
          key={i}
          className="flex-1 prayer-flag-wave"
          style={{ backgroundColor: c, animationDelay: `${i * 0.55}s` }}
        />
      ))}
    </div>
  );
}
