import React from 'react';

export function AgroLensLogo({
  variant = 'dark',
  className = '',
}: {
  variant?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M8 29C8 17 17 8 31 8C31 22 22 31 8 29Z"
          fill={variant === 'light' ? '#4ADE80' : '#16A34A'}
        />
        <path
          d="M17 31C17 22 23 15 34 15C34 25 27 32 17 31Z"
          fill={variant === 'light' ? '#A3E635' : '#0B4D1E'}
          fillOpacity={variant === 'light' ? 0.92 : 0.95}
        />
        <path
          d="M11 27C16 22 21 17 28 12"
          stroke={variant === 'light' ? '#0B4D1E' : '#ECFDF5'}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`font-display text-xl font-extrabold tracking-tight whitespace-nowrap ${
          variant === 'light' ? 'text-white' : 'text-[#0B4D1E]'
        }`}
      >
        Agro<span className={variant === 'light' ? 'text-[#86EFAC]' : 'text-[#16A34A]'}>Lens</span>
      </span>
    </div>
  );
}

export function HeroFieldArtwork({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Illustration of terraced Nigerian farmland observed by satellite telemetry"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="720" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E6F4EA" />
          <stop offset="60%" stopColor="#CBEAD2" />
          <stop offset="100%" stopColor="#A7DFB6" />
        </linearGradient>
        <linearGradient id="hillBack" x1="0" y1="180" x2="720" y2="480" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E7B34" />
          <stop offset="100%" stopColor="#0F4D1F" />
        </linearGradient>
        <linearGradient id="hillFront" x1="0" y1="260" x2="720" y2="480" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>
        <linearGradient id="satBeam" x1="560" y1="54" x2="360" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="720" height="480" rx="24" fill="url(#skyGrad)" />

      {/* Warm sun */}
      <circle cx="150" cy="108" r="46" fill="#FDE047" fillOpacity="0.85" />
      <circle cx="150" cy="108" r="68" fill="#FEF08A" fillOpacity="0.35" />

      {/* Satellite orbit arc & Earth observation craft */}
      <path
        d="M80 120C210 38 450 32 645 96"
        stroke="#0B4D1E"
        strokeOpacity="0.22"
        strokeWidth="1.5"
        strokeDasharray="6 6"
      />
      <polygon points="558,64 468,312 248,312" fill="url(#satBeam)" />

      <g transform="translate(534,42)">
        <rect x="0" y="14" width="16" height="8" rx="1.5" fill="#15803D" />
        <rect x="34" y="14" width="16" height="8" rx="1.5" fill="#15803D" />
        <rect x="17" y="10" width="16" height="16" rx="3" fill="#0B4D1E" />
        <circle cx="25" cy="18" r="3" fill="#86EFAC" />
      </g>

      {/* Rolling hills of Oyo derived savanna */}
      <path d="M0 245C150 205 290 225 450 200C580 180 650 198 720 220V480H0V245Z" fill="#86EFAC" fillOpacity="0.65" />
      <path d="M0 280C170 245 340 295 510 250C605 225 668 238 720 252V480H0V280Z" fill="url(#hillBack)" />

      {/* Cultivated crop contour rows */}
      <path d="M0 328C190 295 390 345 720 288V480H0V328Z" fill="url(#hillFront)" />
      <path d="M0 365C220 336 420 378 720 335" stroke="#86EFAC" strokeOpacity="0.4" strokeWidth="3" />
      <path d="M0 398C220 370 420 412 720 372" stroke="#86EFAC" strokeOpacity="0.35" strokeWidth="3" />
      <path d="M0 432C220 408 420 446 720 410" stroke="#86EFAC" strokeOpacity="0.28" strokeWidth="3" />

      {/* Stylized Maize stalks foreground */}
      {[92, 132, 174, 540, 584, 628].map((x, idx) => (
        <g key={x} transform={`translate(${x}, ${idx % 2 === 0 ? 310 : 326})`}>
          <path d="M0 80V12" stroke="#064E3B" strokeWidth="4" strokeLinecap="round" />
          <path d="M0 48C-18 38 -24 22 -14 14C-4 22 0 36 0 48Z" fill="#4ADE80" />
          <path d="M0 36C18 26 24 10 14 2C4 10 0 24 0 36Z" fill="#22C55E" />
          <ellipse cx="0" cy="8" rx="5" ry="12" fill="#FACC15" />
        </g>
      ))}

      {/* Field parcel boundary overlay */}
      <polygon
        points="240,342 425,318 475,388 268,412"
        fill="#FFFFFF"
        fillOpacity="0.16"
        stroke="#ECFDF5"
        strokeWidth="2.5"
        strokeDasharray="7 5"
      />
      <circle cx="356" cy="364" r="9" fill="#FFFFFF" />
      <circle cx="356" cy="364" r="5" fill="#16A34A" />
    </svg>
  );
}

export function DashboardBannerBackdrop({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 240"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bannerBg" x1="0" y1="0" x2="1200" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B4D1E" />
          <stop offset="55%" stopColor="#146C2E" />
          <stop offset="100%" stopColor="#1E8A3D" />
        </linearGradient>
      </defs>
      <rect width="1200" height="240" fill="url(#bannerBg)" />
      <path d="M0 170C260 110 540 190 860 130C1020 100 1120 118 1200 138V240H0V170Z" fill="#093D18" fillOpacity="0.55" />
      <path d="M0 195C320 148 640 212 960 165C1080 148 1150 158 1200 168V240H0V195Z" fill="#22C55E" fillOpacity="0.22" />
      <circle cx="1060" cy="52" r="90" fill="#86EFAC" fillOpacity="0.12" />
      <circle cx="960" cy="110" r="140" fill="#4ADE80" fillOpacity="0.08" />
    </svg>
  );
}

export function CropIconIllustration({ cropName, className = 'w-14 h-14' }: { cropName: string; className?: string }) {
  const key = cropName.toLowerCase();

  if (key.includes('cowpea')) {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#ECFDF5" stroke="#BBF7D0" strokeWidth="1.5" />
        {/* Cowpea brown/cream beans */}
        <ellipse cx="23" cy="36" rx="9" ry="6.5" transform="rotate(-22 23 36)" fill="#92400E" />
        <ellipse cx="22" cy="35" rx="3" ry="2" fill="#FEF3C7" />
        <ellipse cx="41" cy="35" rx="9" ry="6.5" transform="rotate(18 41 35)" fill="#B45309" />
        <ellipse cx="40" cy="34" rx="3" ry="2" fill="#FEF3C7" />
        <ellipse cx="32" cy="24" rx="9" ry="6.5" fill="#78350F" />
        <ellipse cx="32" cy="23" rx="3" ry="2" fill="#FEF3C7" />
        <path d="M18 44C26 48 38 48 46 44" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes('soybean')) {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#ECFDF5" stroke="#BBF7D0" strokeWidth="1.5" />
        {/* Soybean green pod */}
        <path
          d="M15 41C16 29 29 19 49 20C48 33 36 44 15 41Z"
          fill="#65A30D"
          stroke="#3F6212"
          strokeWidth="1.5"
        />
        <circle cx="24" cy="35" r="4.5" fill="#BEF264" />
        <circle cx="33" cy="30" r="4.8" fill="#D9F99D" />
        <circle cx="42" cy="26" r="4.2" fill="#BEF264" />
      </svg>
    );
  }

  // Default: Maize
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#ECFDF5" stroke="#BBF7D0" strokeWidth="1.5" />
      <ellipse cx="32" cy="28" rx="9" ry="16" transform="rotate(12 32 28)" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
      <path d="M29 17L36 18M27 23L36 25M26 29L35 31M25 35L33 37" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 46C18 35 21 26 27 21C25 31 26 39 30 46H20Z" fill="#16A34A" />
      <path d="M41 46C44 36 42 28 37 23C37 32 35 39 31 46H41Z" fill="#15803D" />
    </svg>
  );
}

export function SoilSproutArtwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 110" fill="none" className={className} aria-hidden="true">
      <path d="M20 102C55 76 165 76 205 102H20Z" fill="#78350F" />
      <path d="M40 102C70 84 150 84 185 102H40Z" fill="#92400E" />
      <path d="M110 86V42" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
      <path d="M110 56C90 48 80 30 92 22C104 30 110 44 110 56Z" fill="#22C55E" />
      <path d="M110 48C130 40 140 22 128 14C116 22 110 36 110 48Z" fill="#4ADE80" />
    </svg>
  );
}
