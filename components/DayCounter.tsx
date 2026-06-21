'use client';
import { useEffect, useState, useRef } from 'react';

interface Props { days: number; }

export default function DayCounter({ days }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const [show, setShow] = useState(false);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    setTimeout(() => setShow(true), 100);
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(ease * days));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [days]);

  return (
    <div style={{ textAlign:'center', animation: show ? 'countUp 0.6s ease both' : 'none' }}>
      <div style={{
        fontSize:'clamp(88px, 28vw, 140px)',
        fontWeight:900,
        lineHeight:1,
        letterSpacing:'-0.04em',
        fontVariantNumeric:'tabular-nums',
      }} className="gradient-text">{displayed.toLocaleString()}</div>
      <div style={{ fontSize:'clamp(16px, 4vw, 22px)', fontWeight:600, color:'var(--t2)', letterSpacing:'0.08em', marginTop:'6px', textTransform:'uppercase' }}>
        Days Together
      </div>
    </div>
  );
}
