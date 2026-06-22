'use client';
import { getMilestones, formatDate } from '@/lib/calculations';

interface Props { startDate: string; currentDays: number; }

export default function MilestoneCards({ startDate }: Props) {
  const milestones = getMilestones(startDate);
  const nextIdx    = milestones.findIndex(m => !m.isPast);

  return (
    <div>
      <p style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.24em', textTransform:'uppercase', color:'var(--t3)', marginBottom:'16px' }}>Timeline</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
        {milestones.map((m, i) => {
          const isNext = i === nextIdx;
          return (
            <div key={m.days} style={{
              display:'flex', alignItems:'center', padding:'16px 20px', gap:'16px',
              background: isNext ? 'rgba(255,95,168,0.09)' : 'var(--s1)',
              border:`1px solid ${isNext ? 'rgba(255,95,168,0.24)' : 'var(--bd1)'}`,
              borderRadius: i === 0 ? '16px 16px 4px 4px' : i === milestones.length - 1 ? '4px 4px 16px 16px' : '4px',
              backdropFilter:'blur(32px)',
            }}>
              <div style={{
                width:8, height:8, borderRadius:'50%', flexShrink:0,
                background: m.isPast ? 'var(--accent)' : isNext ? 'rgba(255,95,168,0.8)' : 'var(--t4)',
                border: m.isPast || isNext ? 'none' : '1.5px solid var(--bd2)',
                boxShadow: isNext ? '0 0 10px rgba(255,95,168,0.55)' : 'none',
              }} />
              <div style={{ flex:1 }}>
                <div style={{
                  fontSize:'14px', fontWeight: isNext ? 700 : 500,
                  color: m.isPast ? 'var(--t2)' : isNext ? 'var(--accent)' : 'var(--t3)',
                }}>{m.label}</div>
                <div style={{ fontSize:'11px', fontWeight:500, color:'var(--t4)', marginTop:'2px' }}>
                  {formatDate(m.date)}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                {m.isPast
                  ? <div style={{ fontSize:'10px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)' }}>達成</div>
                  : <div>
                      <div style={{ fontSize:'16px', fontWeight:700, color: isNext ? 'var(--t1)' : 'var(--t3)', letterSpacing:'-0.02em' }}>
                        {m.daysLeft}
                      </div>
                      <div style={{ fontSize:'9px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--t4)' }}>
                        days left
                      </div>
                    </div>
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
