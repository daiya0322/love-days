'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getData, saveData, CoupleData, Photo, Message } from '@/lib/storage';
import { getDaysTogether, getNextMilestone, formatDate } from '@/lib/calculations';
import DayCounter from '@/components/DayCounter';
import MilestoneCards from '@/components/MilestoneCards';
import PhotoGallery from '@/components/PhotoGallery';
import Messages from '@/components/Messages';
import HeartBg from '@/components/HeartBg';

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<CoupleData | null>(null);
  const [tab, setTab] = useState<'home'|'photos'|'messages'>('home');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const d = getData();
    if (!d) { router.replace('/setup'); return; }
    setData(d);
  }, [router]);

  function update(updates: Partial<CoupleData>) {
    if (!data) return;
    const next = { ...data, ...updates };
    setData(next);
    saveData(next);
  }

  if (!mounted || !data) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ fontSize:'32px', animation:'pulse-heart 1s ease-in-out infinite' }}>💗</div>
    </div>
  );

  const days = getDaysTogether(data.startDate);
  const next = getNextMilestone(data.startDate);

  return (
    <main style={{ minHeight:'100dvh', background:'var(--bg)', position:'relative', paddingBottom:'100px' }}>
      <HeartBg />

      {/* コンテンツ */}
      <div style={{ position:'relative', zIndex:1, maxWidth:'480px', margin:'0 auto', padding:'0 20px' }}>

        {/* ヘッダー */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 0' }}>
          <div style={{ fontSize:'12px', color:'var(--t3)' }}>{formatDate(new Date())}</div>
          <button onClick={() => router.push('/setup')} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid var(--card-bd)', borderRadius:'8px', padding:'6px 12px', fontSize:'11px', color:'var(--t3)', cursor:'pointer' }}>設定</button>
        </div>

        {/* カップル名 */}
        <div style={{ textAlign:'center', padding:'12px 0 24px', animation:'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize:'clamp(18px, 5vw, 24px)', fontWeight:800, letterSpacing:'0.02em' }}>
            <span style={{ color:'var(--t1)' }}>{data.partner1}</span>
            <span style={{ margin:'0 12px', animation:'pulse-heart 2s ease-in-out infinite', display:'inline-block', fontSize:'1.2em' }}>💗</span>
            <span style={{ color:'var(--t1)' }}>{data.partner2}</span>
          </div>
          <div style={{ fontSize:'12px', color:'var(--t3)', marginTop:'4px' }}>{data.startDate.replace(/-/g,'/')} から</div>
        </div>

        {/* タブ */}
        {tab === 'home' && (
          <div style={{ animation:'fadeUp 0.5s 0.1s ease both', opacity:0, animationFillMode:'both' }}>
            {/* メインカウンター */}
            <div className="card" style={{ padding:'36px 24px', textAlign:'center', marginBottom:'16px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 0%, rgba(255,107,157,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
              <DayCounter days={days} />
              {next && (
                <div style={{ marginTop:'20px', padding:'10px 20px', background:'rgba(255,107,157,0.1)', borderRadius:'99px', display:'inline-block', fontSize:'13px', color:'#FF9A8B', fontWeight:600 }}>
                  次の記念日まであと <strong>{next.daysLeft}日</strong>（{next.milestone.label}）
                </div>
              )}
            </div>

            {/* 開始日カード */}
            <div className="card" style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:'16px', marginBottom:'28px' }}>
              <div style={{ fontSize:'28px' }}>📅</div>
              <div>
                <div style={{ fontSize:'12px', color:'var(--t3)', marginBottom:'2px' }}>付き合い始めた日</div>
                <div style={{ fontSize:'16px', fontWeight:800 }}>{data.startDate.replace(/-/g,'/')}</div>
              </div>
            </div>

            <MilestoneCards startDate={data.startDate} currentDays={days} />
          </div>
        )}

        {tab === 'photos' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <PhotoGallery
              photos={data.photos}
              onAdd={photo => update({ photos: [...data.photos, photo] })}
              onDelete={id => update({ photos: data.photos.filter(p => p.id !== id) })}
            />
          </div>
        )}

        {tab === 'messages' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <Messages
              messages={data.messages}
              partner1={data.partner1}
              partner2={data.partner2}
              onAdd={msg => update({ messages: [...data.messages, msg] })}
              onDelete={id => update({ messages: data.messages.filter(m => m.id !== id) })}
            />
          </div>
        )}
      </div>

      {/* ボトムナビ */}
      <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, background:'rgba(8,5,16,0.85)', backdropFilter:'blur(20px)', borderTop:'1px solid var(--card-bd)', padding:'8px 0', paddingBottom:'calc(8px + env(safe-area-inset-bottom))' }}>
        <div style={{ display:'flex', maxWidth:'480px', margin:'0 auto' }}>
          {([
            { id:'home', icon:'💗', label:'ホーム' },
            { id:'photos', icon:'📷', label:'思い出' },
            { id:'messages', icon:'💌', label:'メッセージ' },
          ] as const).map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
              background:'none', border:'none', cursor:'pointer', padding:'8px',
              color: tab === item.id ? 'var(--rose)' : 'var(--t3)',
              transition:'color 0.2s',
            }}>
              <span style={{ fontSize:'22px' }}>{item.icon}</span>
              <span style={{ fontSize:'10px', fontWeight: tab === item.id ? 700 : 500 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
