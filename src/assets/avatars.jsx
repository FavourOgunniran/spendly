// High quality custom SVG avatars matching the 3D memoji styling in the reference design
import React from 'react';

export const TotokAvatar = ({ className = "avatar-img", size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="50" fill="#f8d7c4" />
    {/* Background hair */}
    <circle cx="50" cy="38" r="32" fill="#4a2e18" />
    <circle cx="28" cy="32" r="14" fill="#4a2e18" />
    <circle cx="72" cy="32" r="14" fill="#4a2e18" />
    <circle cx="24" cy="48" r="12" fill="#4a2e18" />
    <circle cx="76" cy="48" r="12" fill="#4a2e18" />
    <circle cx="36" cy="22" r="14" fill="#4a2e18" />
    <circle cx="64" cy="22" r="14" fill="#4a2e18" />
    <circle cx="50" cy="18" r="14" fill="#4a2e18" />
    {/* Face */}
    <ellipse cx="50" cy="54" rx="28" ry="30" fill="#f3b898" />
    <ellipse cx="50" cy="56" rx="26" ry="26" fill="#f8c9af" />
    {/* Eyes */}
    <ellipse cx="40" cy="52" rx="4" ry="5.5" fill="#2d1d12" />
    <circle cx="41.5" cy="50.5" r="1.5" fill="#ffffff" />
    <ellipse cx="60" cy="52" rx="4" ry="5.5" fill="#2d1d12" />
    <circle cx="61.5" cy="50.5" r="1.5" fill="#ffffff" />
    {/* Eyebrows */}
    <path d="M34 45 Q40 42 46 45" stroke="#331f10" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M54 45 Q60 42 66 45" stroke="#331f10" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Nose */}
    <path d="M50 52 L48 60 Q50 62 52 60 Z" fill="#e29b7a" />
    {/* Smile */}
    <path d="M42 66 Q50 75 58 66" stroke="#873522" strokeWidth="2.5" strokeLinecap="round" fill="#a4412a" />
    <path d="M44 67 Q50 71 56 67" fill="#ffffff" />
    {/* Cheeks */}
    <circle cx="36" cy="60" r="4" fill="#ff9b8a" fillOpacity="0.4" />
    <circle cx="64" cy="60" r="4" fill="#ff9b8a" fillOpacity="0.4" />
    {/* Ears */}
    <circle cx="23" cy="54" r="6" fill="#f3b898" />
    <circle cx="77" cy="54" r="6" fill="#f3b898" />
    {/* Shirt */}
    <path d="M22 100 C24 85 36 82 50 82 C64 82 76 85 78 100 Z" fill="#d9534f" />
    <path d="M44 82 L50 90 L56 82 Z" fill="#f8c9af" />
  </svg>
);

export const AlexandraAvatar = ({ className = "avatar-img", size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="50" fill="#fed7aa" />
    {/* Long hair background */}
    <path d="M20 40 C20 20 80 20 80 40 C80 75 82 92 78 100 L22 100 C18 92 20 75 20 40 Z" fill="#8c4320" />
    {/* Face */}
    <ellipse cx="50" cy="52" rx="26" ry="28" fill="#fcd3b8" />
    {/* Front Hair Bangs */}
    <path d="M24 40 C32 26 68 26 76 40 C72 32 60 28 50 30 C40 28 28 32 24 40 Z" fill="#a85228" />
    {/* Eyes & Glasses */}
    <ellipse cx="40" cy="50" rx="3.5" ry="4.5" fill="#2d1d12" />
    <circle cx="41.5" cy="48.5" r="1.5" fill="#ffffff" />
    <ellipse cx="60" cy="50" rx="3.5" ry="4.5" fill="#2d1d12" />
    <circle cx="61.5" cy="48.5" r="1.5" fill="#ffffff" />
    {/* Smile */}
    <path d="M43 64 Q50 72 57 64" stroke="#993826" strokeWidth="2.5" strokeLinecap="round" fill="#b94a34" />
    <path d="M45 65 Q50 69 55 65" fill="#ffffff" />
    {/* Cheeks */}
    <circle cx="36" cy="58" r="4" fill="#f87171" fillOpacity="0.35" />
    <circle cx="64" cy="58" r="4" fill="#f87171" fillOpacity="0.35" />
    {/* Shirt */}
    <path d="M26 100 C28 86 38 84 50 84 C62 84 72 86 74 100 Z" fill="#f43f5e" />
  </svg>
);

export const EdwinAvatar = ({ className = "avatar-img", size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="50" fill="#bbf7d0" />
    {/* Green beanie/hat */}
    <path d="M25 45 C25 24 75 24 75 45 C75 48 25 48 25 45 Z" fill="#166534" />
    <ellipse cx="50" cy="44" rx="27" ry="6" fill="#15803d" />
    {/* Face */}
    <ellipse cx="50" cy="56" rx="25" ry="26" fill="#a16207" />
    {/* Eyes */}
    <ellipse cx="41" cy="54" rx="3.5" ry="4.5" fill="#1c1917" />
    <circle cx="42.5" cy="52.5" r="1.2" fill="#ffffff" />
    <ellipse cx="59" cy="54" rx="3.5" ry="4.5" fill="#1c1917" />
    <circle cx="60.5" cy="52.5" r="1.2" fill="#ffffff" />
    {/* Beard / Goatee */}
    <path d="M44 68 Q50 75 56 68 Q50 78 44 68 Z" fill="#1c1917" />
    {/* Smile */}
    <path d="M44 64 Q50 70 56 64" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="#ffffff" />
    {/* Shirt */}
    <path d="M25 100 C28 86 38 84 50 84 C62 84 72 86 75 100 Z" fill="#0284c7" />
  </svg>
);

export const IsaacAvatar = ({ className = "avatar-img", size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="50" fill="#bfdbfe" />
    {/* Blue cap/hat */}
    <path d="M24 44 C24 24 76 24 76 44 Z" fill="#2563eb" />
    <path d="M18 43 C26 43 74 38 82 43 C84 46 76 48 70 48 L22 48 Z" fill="#1d4ed8" />
    {/* Face */}
    <ellipse cx="50" cy="58" rx="25" ry="26" fill="#854d0e" />
    {/* Eyes */}
    <ellipse cx="40" cy="56" rx="3.5" ry="4.5" fill="#1c1917" />
    <circle cx="41.5" cy="54.5" r="1.2" fill="#ffffff" />
    <ellipse cx="60" cy="56" rx="3.5" ry="4.5" fill="#1c1917" />
    <circle cx="61.5" cy="54.5" r="1.2" fill="#ffffff" />
    {/* Smile */}
    <path d="M43 66 Q50 72 57 66" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="#ffffff" />
    {/* Shirt */}
    <path d="M25 100 C28 86 38 84 50 84 C62 84 72 86 75 100 Z" fill="#e11d48" />
  </svg>
);

export const DavidAvatar = ({ className = "avatar-img", size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="50" fill="#fef08a" />
    {/* Short brown hair */}
    <path d="M26 42 C26 24 74 24 74 42 C74 46 26 46 26 42 Z" fill="#593a1e" />
    {/* Face */}
    <ellipse cx="50" cy="55" rx="25" ry="26" fill="#fcd3b8" />
    {/* Eyes */}
    <ellipse cx="41" cy="52" rx="3.5" ry="4.5" fill="#2d1d12" />
    <circle cx="42.5" cy="50.5" r="1.2" fill="#ffffff" />
    <ellipse cx="59" cy="52" rx="3.5" ry="4.5" fill="#2d1d12" />
    <circle cx="60.5" cy="50.5" r="1.2" fill="#ffffff" />
    {/* Beard outline */}
    <path d="M27 52 C27 75 36 82 50 82 C64 82 73 75 73 52 C73 66 64 74 50 74 C36 74 27 66 27 52 Z" fill="#6b4624" />
    {/* Smile */}
    <path d="M43 63 Q50 69 57 63" stroke="#873522" strokeWidth="2.2" strokeLinecap="round" fill="#ffffff" />
    {/* Shirt */}
    <path d="M25 100 C28 86 38 84 50 84 C62 84 72 86 75 100 Z" fill="#475569" />
  </svg>
);

export const AppIconMesh = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#154432" />
    <circle cx="12" cy="12" r="6" stroke="#41ab79" strokeWidth="2" strokeDasharray="3 2" />
    <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
  </svg>
);
