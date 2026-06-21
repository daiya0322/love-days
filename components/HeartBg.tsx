'use client';
import { useEffect, useState } from 'react';

interface Particle { id: number; x: number; size: number; delay: number; duration: number; }

export default function HeartBg() {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    setParticles(Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 14 + 8,
      delay: Math.random() * 8,
      duration: Math.random() * 10 + 12,
    })));
  }, []);

  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
      {/* グロー */}
      <div style={{ position:'absolute', top:'-15%', left:'50%', transform:'translateX(-50%)', width:'700px', height:'700px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,107,157,0.10) 0%, transparent 65%)' }} />
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 65%)' }} />
      {/* 浮遊ハート */}
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', bottom:'-30px', left:`${p.x}%`,
          fontSize:`${p.size}px`, opacity:0.15,
          animation:`floatUp ${p.duration}s ${p.delay}s ease-in infinite`,
        }}>💗</div>
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { transform:translateY(0) scale(0.8); opacity:0; }
          10%  { opacity:0.15; }
          90%  { opacity:0.08; }
          100% { transform:translateY(-110vh) scale(1.2); opacity:0; }
        }
      `}</style>
    </div>
  );
}
