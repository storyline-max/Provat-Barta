import React from 'react';

interface ProvatBartaLogoProps {
  variant?: 'full' | 'compact' | 'minimal';
  className?: string;
  showTaglines?: boolean;
}

export const ProvatBartaLogo: React.FC<ProvatBartaLogoProps> = ({
  variant = 'full',
  className = '',
  showTaglines = true,
}) => {
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Sun & Newspaper Icon */}
        <div className="relative w-9 h-9 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
            <defs>
              <linearGradient id="sunGradMin" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FD8B18" />
                <stop offset="60%" stopColor="#FF9E00" />
                <stop offset="100%" stopColor="#FFC300" />
              </linearGradient>
            </defs>
            {/* Rays */}
            <path d="M50,15 L50,5 M30,22 L20,13 M70,22 L80,13 M15,40 L5,36 M85,40 L95,36" stroke="#FF9E00" strokeWidth="3" strokeLinecap="round" />
            {/* Sun Body */}
            <circle cx="50" cy="50" r="30" fill="url(#sunGradMin)" />
            {/* Folded Paper */}
            <path d="M22,42 L56,36 L62,75 L28,82 Z" fill="#FFFFFF" stroke="#00204A" strokeWidth="2.5" />
            <path d="M22,42 L42,48 L42,80 L22,74 Z" fill="#00204A" />
            <text x="32" y="62" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">NEWS</text>
            {/* Bottom Swooshes */}
            <path d="M28,82 Q50,68 76,78" stroke="#00204A" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M34,87 Q54,75 82,84" stroke="#005082" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="font-bengali font-black text-2xl tracking-tight text-[#00204A]">
              প্রভাত
            </span>
            <span className="font-bengali font-black text-2xl tracking-tight text-[#E5000C] italic">
              বার্তা
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#00204A]/80 font-bold font-dateline">
            Provat Barta • US Edition
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Top Motto: সত্য • নিরপেক্ষ • নির্ভীক with editorial flanking rules */}
      {showTaglines && (
        <div className="w-full flex items-center justify-center gap-3 mb-1.5 opacity-90">
          <div className="h-[1px] bg-stone-400 w-16 sm:w-28 md:w-36"></div>
          <p className="text-[12px] sm:text-[13px] font-bengali font-semibold text-[#1a1a1a] tracking-wider whitespace-nowrap">
            সত্য <span className="text-[#E5000C] mx-1">•</span> নিরপেক্ষ <span className="text-[#E5000C] mx-1">•</span> নির্ভীক
          </p>
          <div className="h-[1px] bg-stone-400 w-16 sm:w-28 md:w-36"></div>
        </div>
      )}

      {/* Main Center Brand Lockup */}
      <div className="flex items-center justify-center flex-wrap sm:flex-nowrap gap-4 sm:gap-6 py-1">
        {/* Emblem: Sun rising over folded newspaper with oceanic waves */}
        <div className="relative w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28 flex-shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-sm">
            <defs>
              {/* Sun Gradient */}
              <linearGradient id="pbSunGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="35%" stopColor="#FD8B18" />
                <stop offset="70%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#FDE047" />
              </linearGradient>

              {/* Waves Gradient */}
              <linearGradient id="pbNavyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#001838" />
                <stop offset="100%" stopColor="#003566" />
              </linearGradient>

              <filter id="pbGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FD8B18" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Radiant Sunburst Rays */}
            <g opacity="0.95">
              {/* Central Ray */}
              <polygon points="80,12 83,48 77,48" fill="#F59E0B" />
              {/* Left Rays */}
              <polygon points="62,18 71,50 66,52" fill="#F59E0B" />
              <polygon points="46,28 61,54 57,58" fill="#F59E0B" />
              <polygon points="34,44 54,62 50,66" fill="#F59E0B" />
              <polygon points="26,62 50,70 48,75" fill="#F59E0B" />
              {/* Right Rays */}
              <polygon points="98,18 94,52 89,50" fill="#F59E0B" />
              <polygon points="114,28 103,58 99,54" fill="#F59E0B" />
              <polygon points="126,44 110,66 106,62" fill="#F59E0B" />
              <polygon points="134,62 112,75 110,70" fill="#F59E0B" />
            </g>

            {/* Golden Rising Sun Disc */}
            <circle cx="80" cy="80" r="46" fill="url(#pbSunGradient)" filter="url(#pbGlow)" />

            {/* Inner Sun Accent Ring */}
            <circle cx="80" cy="80" r="38" fill="none" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="2" />

            {/* Folded Broadside Newspaper */}
            <g transform="translate(18, 54) rotate(-3)">
              {/* Under-shadow */}
              <path d="M12,18 L56,10 L58,68 L14,78 Z" fill="#000000" opacity="0.12" />
              
              {/* White Newspaper Body */}
              <path d="M10,16 L54,8 L58,66 L12,76 Z" fill="#FFFFFF" stroke="#00204A" strokeWidth="2.8" strokeLinejoin="round" />
              
              {/* Dark Left Fold Panel */}
              <path d="M10,16 L30,22 L30,70 L12,76 Z" fill="#00204A" />
              
              {/* "NEWS" White Text on Fold */}
              <rect x="14" y="28" width="13" height="10" fill="#00204A" rx="1" />
              <text x="20.5" y="36" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">NEWS</text>
              
              {/* Newspaper Print Simulation Lines */}
              <line x1="14" y1="44" x2="26" y2="44" stroke="#E2E8F0" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="14" y1="49" x2="26" y2="49" stroke="#E2E8F0" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="14" y1="54" x2="24" y2="54" stroke="#E2E8F0" strokeWidth="1.8" strokeLinecap="round" />

              {/* Red Breaking News Badge */}
              <rect x="14" y="60" width="5" height="5" fill="#E5000C" />

              {/* Right Fold Page Columns */}
              <line x1="35" y1="22" x2="51" y2="18" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="35" y1="28" x2="52" y2="24" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="35" y1="34" x2="52" y2="30" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="35" y1="40" x2="53" y2="36" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="35" y1="46" x2="53" y2="42" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="35" y1="52" x2="54" y2="48" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Elegant Ocean Wave Swooshes (Flow of News at Dawn) */}
            <path
              d="M34,124 C60,98 100,102 144,118 C116,110 80,108 52,128 Z"
              fill="url(#pbNavyGradient)"
            />
            <path
              d="M44,131 C72,108 112,112 152,126 C124,120 88,118 60,136 Z"
              fill="#005082"
            />
            <path
              d="M58,138 C84,118 120,122 156,133 C132,128 98,126 72,143 Z"
              fill="#0284C7"
            />
          </svg>
        </div>

        {/* Wordmark Typography */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-baseline gap-2 sm:gap-3">
            {/* প্রভাত in Navy */}
            <span
              className="font-bengali font-black tracking-tight text-[#00204A] leading-none"
              style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.75rem)',
                textShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              প্রভাত
            </span>

            {/* বার্তা in Red italic with sharp editorial flourish */}
            <span
              className="font-bengali font-black tracking-tight text-[#E5000C] leading-none italic inline-block transform -skew-x-3"
              style={{
                fontSize: 'clamp(2.6rem, 5.7vw, 4.95rem)',
                textShadow: '0 1px 2px rgba(229,0,12,0.1)',
              }}
            >
              বার্তা
            </span>
          </div>

          {/* Secondary English US Broadsheet Masthead */}
          <div className="w-full flex items-center justify-between gap-2 mt-1">
            <span className="text-[11px] sm:text-[13px] md:text-[14px] font-cinzel font-bold tracking-[0.25em] text-[#00204A] uppercase">
              The Provat Barta
            </span>
            <span className="hidden md:inline-block text-[11px] font-dateline tracking-widest text-stone-500 uppercase">
              • The Voice of Truth & Courage •
            </span>
            <span className="text-[10px] sm:text-[12px] font-dateline tracking-widest text-[#E5000C] font-semibold uppercase">
              Est. 2024
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Tagline: সত্যের আলোয় শুরু হোক প্রতিটি সকাল with elegant baseline ruler */}
      {showTaglines && (
        <div className="w-full flex items-center justify-center gap-3 mt-1.5 opacity-90">
          <div className="h-[1px] bg-stone-300 w-16 sm:w-36 md:w-56"></div>
          <p className="text-[11px] sm:text-[13px] font-bengali text-stone-700 italic tracking-wide text-center">
            সত্যের আলোয় শুরু হোক প্রতিটি সকাল
          </p>
          <div className="h-[1px] bg-stone-300 w-16 sm:w-36 md:w-56"></div>
        </div>
      )}
    </div>
  );
};
