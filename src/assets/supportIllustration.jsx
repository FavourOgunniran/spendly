import React from 'react';

export const SupportCharacter = ({ className = "support-char-svg", size = 64 }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 80 104" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Head & Hair */}
    <circle cx="40" cy="18" r="10" fill="#fcd3b8" />
    <path d="M30 15 C30 8 50 8 50 15 C50 16 30 16 30 15 Z" fill="#8c5836" />
    <circle cx="40" cy="11" r="7" fill="#8c5836" />
    {/* Glasses */}
    <rect x="34" y="16" width="5" height="3.5" rx="1" stroke="#334155" strokeWidth="1" fill="none" />
    <rect x="41" y="16" width="5" height="3.5" rx="1" stroke="#334155" strokeWidth="1" fill="none" />
    <line x1="39" y1="18" x2="41" y2="18" stroke="#334155" strokeWidth="1" />
    {/* Body / Sweater */}
    <path d="M28 32 C28 26 52 26 52 32 L54 62 L26 62 Z" fill="#e2e8f0" />
    <path d="M36 28 L40 34 L44 28" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
    {/* Arms & Hands holding coffee / phone */}
    <path d="M28 34 L22 48 L32 50" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 34 L58 48 L48 50" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Coffee Cup / Tablet */}
    <rect x="36" y="46" width="8" height="11" rx="2" fill="#d97706" />
    <rect x="35" y="44" width="10" height="3" rx="1" fill="#ffffff" />
    {/* Khaki Trousers */}
    <path d="M28 62 L32 94 L38 94 L39 68 L41 68 L42 94 L48 94 L52 62 Z" fill="#b48346" />
    {/* Shoes */}
    <ellipse cx="34" cy="97" rx="5" ry="2.5" fill="#ffffff" stroke="#cbd5e1" />
    <ellipse cx="46" cy="97" rx="5" ry="2.5" fill="#ffffff" stroke="#cbd5e1" />
  </svg>
);
