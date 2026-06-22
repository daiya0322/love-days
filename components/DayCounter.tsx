'use client';
import { useEffect, useState, useRef } from 'react';

interface Props { days: number; }

/* 4個の極めて控えめなスパークル（固定座標でSSR安全） */
const SPARKLES = [
  { x: 7,  y: 24, delay: 0.0, size: 3, dur: 4.5 },
  { x: 89, y: 20, delay: 2.2, size: 2, dur: 4.0 },
  { x: 12, y: 74, delay: 3.6, size: 2, dur: 4.8 },
  { x: 85, y: 72, delay: 1.4, size: 3, dur: 4.2 },
];

export default function DayCounter({ days }: Props) {
  const [val,   setVal]   = useState(0);
  const [ready, setReady] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    setReady(true);
    if (ran.current || days === 0) return;
    ran.current = true;
    const dur = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(e * days));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [days]);

  const digits = String(val || days).split('');

  return (
    <div style={{ textAlign: 'center', position: 'relative', padding: '4px 0' }}>

      {/* 極めて控えめなスパークル粒子 */}
      {ready && SPARKLES.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width:  `${s.size}px`,
          height: `${s.size}px`,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.80)',
          boxShadow: `0 0 ${s.size}px ${s.size + 2}px rgba(255,255,255,0.35), 0 0 ${s.size * 3}px rgba(255,26,110,0.22)`,
          animation: `sparkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          pointerEvents: 'none',
          zIndex: 2,
        }} />
      ))}

      {/* 数字 — グラデーション＋軽い発光 */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        position: 'relative',
        zIndex: 1,
        animation: 'numGlow 4s ease-in-out infinite',
      }}>
        {digits.map((d, i) => (
          <span
            key={`${i}-${d}`}
            style={{
              fontSize: 'clamp(104px, 33vw, 172px)',
              fontWeight: 800,
              lineHeight: 0.85,
              letterSpacing: '-0.04em',
              display: 'block',
              fontVariantNumeric: 'tabular-nums',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD0E8 22%, #FF80B5 46%, #FF1A6E 66%, #B8004A 88%, #7A0030 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: `numRise 0.70s ${i * 0.045}s cubic-bezier(0.22,1,0.36,1) both`,
            }}
          >
            {d}
          </span>
        ))}
      </div>

      {/* DAYS TOGETHER */}
      <div style={{
        fontFamily: 'var(--font-display, -apple-system)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.30em',
        textTransform: 'uppercase',
        marginTop: '18px',
        background: 'linear-gradient(90deg, #FF85B8 0%, #FF1A6E 50%, #FF85B8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        days together
      </div>
    </div>
  );
}
