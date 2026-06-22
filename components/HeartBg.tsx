'use client';

interface Props { bgPhoto?: string; }

export default function HeartBg({ bgPhoto }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {bgPhoto && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${bgPhoto})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(60px) saturate(0.4) brightness(0.16)',
          transform: 'scale(1.1)',
          opacity: 0.80,
        }} />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: bgPhoto
          ? 'linear-gradient(180deg, rgba(14,5,16,0.38) 0%, rgba(14,5,16,0.62) 36%, rgba(14,5,16,0.95) 100%)'
          : 'transparent',
      }} />
      {/* メイングロー（上部中央）— ラズベリーピンク */}
      <div style={{
        position: 'absolute',
        top: '-12%', left: '50%', transform: 'translateX(-50%)',
        width: '680px', height: '580px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,26,110,0.16) 0%, rgba(255,26,110,0.05) 45%, transparent 70%)',
        animation: 'breathe 8s ease-in-out infinite',
      }} />
      {/* サブグロー（左） */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '-14%',
        width: '360px', height: '360px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,130,184,0.09) 0%, transparent 70%)',
        animation: 'breatheSlow 13s ease-in-out infinite 2s',
      }} />
      {/* ディープローズグロー（右下） */}
      <div style={{
        position: 'absolute',
        bottom: '8%', right: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(192,0,78,0.09) 0%, transparent 70%)',
        animation: 'breatheSlow 16s ease-in-out infinite 4s',
      }} />
    </div>
  );
}
