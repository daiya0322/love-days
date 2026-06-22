interface IconProps { size?: number; color?: string; strokeWidth?: number; }

const d = (size = 20, sw = 1.4, color = 'currentColor') => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none', stroke: color, strokeWidth: sw,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

export const IconCamera = ({ size = 20, color = 'currentColor', strokeWidth = 1.4 }: IconProps) => (
  <svg {...d(size, strokeWidth, color)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

export const IconHeart = ({ size = 20, color = 'currentColor', strokeWidth = 1.4 }: IconProps) => (
  <svg {...d(size, strokeWidth, color)}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export const IconMail = ({ size = 20, color = 'currentColor', strokeWidth = 1.4 }: IconProps) => (
  <svg {...d(size, strokeWidth, color)}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

export const IconSettings = ({ size = 20, color = 'currentColor', strokeWidth = 1.4 }: IconProps) => (
  <svg {...d(size, strokeWidth, color)}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

export const IconPlus = ({ size = 20, color = 'currentColor', strokeWidth = 1.4 }: IconProps) => (
  <svg {...d(size, strokeWidth, color)}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export const IconX = ({ size = 20, color = 'currentColor', strokeWidth = 1.4 }: IconProps) => (
  <svg {...d(size, strokeWidth, color)}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export const IconChevronRight = ({ size = 20, color = 'currentColor', strokeWidth = 1.4 }: IconProps) => (
  <svg {...d(size, strokeWidth, color)}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export const IconTrash = ({ size = 20, color = 'currentColor', strokeWidth = 1.4 }: IconProps) => (
  <svg {...d(size, strokeWidth, color)}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

export const IconCalendar = ({ size = 20, color = 'currentColor', strokeWidth = 1.4 }: IconProps) => (
  <svg {...d(size, strokeWidth, color)}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export const IconLock = ({ size = 20, color = 'currentColor', strokeWidth = 1.4 }: IconProps) => (
  <svg {...d(size, strokeWidth, color)}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export const IconBox = ({ size = 20, color = 'currentColor', strokeWidth = 1.4 }: IconProps) => (
  <svg {...d(size, strokeWidth, color)}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
