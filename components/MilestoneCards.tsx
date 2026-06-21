'use client';
import { getMilestones, formatDate } from '@/lib/calculations';

interface Props { startDate: string; currentDays: number; }

const EMOJIS: Record<number, string> = { 100:'💯', 200:'💕', 365:'🌸', 500:'🌟', 1000:'💎', 1500:'👑', 2000:'🏆', 3650:'✨' };

export default function MilestoneCards({ startDate, currentDays }: Props) {
  const milestones = getMilestones(startDate);

  return (
    <div>
      <h3 style={{ fontSize:'13px', fontWeight:700, letterSpacing:'0.12em', color:'var(--t3)', textTransform:'uppercase', marginBottom:'14px' }}>記念日マイルストーン</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {milestones.map((m, i) => {
          const isNext = !m.isPast && milestones.findIndex(x => !x.isPast) === i;
          return (
            <div key={m.days} className="card" style={{
              padding:'16px 18px',
              display:'flex', alignItems:'center', gap:'14px',
              border: isNext ? '1px solid rgba(255,107,157,0.4)' : undefined,
              background: m.isPast ? 'rgba(255,107,157,0.06)' : isNext ? 'rgba(255,107,157,0.08)' : 'var(--card)',
              transition:'transform 0.2s',
            }}>
              <div style={{ fontSize:'22px', flexShrink:0 }}>{EMOJIS[m.days] ?? '💗'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'14px', fontWeight:800, color: m.isPast ? 'var(--t1)' : isNext ? '#FF9A8B' : 'var(--t2)' }}>
                  {m.label}
                  {isNext && <span style={{ fontSize:'10px', background:'linear-gradient(135deg,#FF6B9D,#FF9A8B)', color:'white', borderRadius:'99px', padding:'2px 8px', marginLeft:'8px', fontWeight:700 }}>NEXT</span>}
                </div>
                <div style={{ fontSize:'11px', color:'var(--t3)', marginTop:'2px' }}>{formatDate(m.date)}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                {m.isPast ? (
                  <div style={{ fontSize:'18px' }}>✅</div>
                ) : (
                  <div style={{ fontSize:'12px', color: isNext ? '#FF9A8B' : 'var(--t3)', fontWeight:700 }}>
                    あと{m.days - currentDays}日
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
