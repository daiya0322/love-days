'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getData, saveData, CoupleData, Photo, Message, TimeCapsule } from '@/lib/storage';
import { getDaysTogether, getNextMilestone, formatDate } from '@/lib/calculations';
import DayCounter from '@/components/DayCounter';
import MilestoneCards from '@/components/MilestoneCards';
import PhotoGallery from '@/components/PhotoGallery';
import Messages from '@/components/Messages';
import HeartBg from '@/components/HeartBg';
import TimeCapsuleView from '@/components/TimeCapsule';
import { IconHeart, IconCamera, IconMail, IconSettings, IconBox } from '@/components/Icons';

type Tab = 'home' | 'photos' | 'messages' | 'capsule';

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<CoupleData | null>(null);
  const [tab,  setTab]  = useState<Tab>('home');
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
    setData(next); saveData(next);
  }

  if (!mounted || !data) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ width:'32px', height:'32px', borderRadius:'50%', border:'2px solid var(--bd2)', borderTopColor:'var(--accent)', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  const days    = getDaysTogether(data.startDate);
  const next    = getNextMilestone(data.startDate);
  const bgPhoto = data.photos.length > 0 ? data.photos[data.photos.length - 1].dataUrl : undefined;

  const NAV = [
    { id:'home'     as Tab, Icon: IconHeart,  label:'ホーム' },
    { id:'photos'   as Tab, Icon: IconCamera, label:'思い出' },
    { id:'messages' as Tab, Icon: IconMail,   label:'レター' },
    { id:'capsule'  as Tab, Icon: IconBox,    label:'カプセル' },
  ];

  return (
    <main style={{ minHeight:'100dvh', background:'var(--bg)', position:'relative', paddingBottom:'90px' }}>
      <HeartBg bgPhoto={bgPhoto} />

      <div style={{ position:'relative', zIndex:1, maxWidth:'480px', margin:'0 auto', padding:'0 22px' }}>

        {/* ── トップバー ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'max(20px, env(safe-area-inset-top))', paddingBottom:'4px' }}>
          <p style={{ fontSize:'10px', fontWeight:500, letterSpacing:'0.16em', color:'var(--t4)', textTransform:'uppercase' }}>{formatDate(new Date())}</p>
          <button onClick={() => router.push('/setup')} className="btn-ghost" style={{ padding:'7px 12px', display:'flex', alignItems:'center', gap:'6px', fontSize:'11px' }}>
            <IconSettings size={13} strokeWidth={1.4} />設定
          </button>
        </div>

        {/* ── 名前ヘッダー ── */}
        <div style={{ textAlign:'center', padding:'20px 0 28px' }} className="au">

          {/* 上部 装飾ライン */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
            <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, transparent, rgba(255,26,110,0.40))' }} />
            <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
              <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:'rgba(255,26,110,0.35)' }} />
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)', boxShadow:'0 0 10px rgba(255,26,110,0.80)' }} />
              <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:'rgba(255,26,110,0.35)' }} />
            </div>
            <div style={{ flex:1, height:'1px', background:'linear-gradient(to left, transparent, rgba(255,26,110,0.40))' }} />
          </div>

          {/* 名前 — Poppins */}
          <p style={{
            fontFamily: 'var(--font-display, -apple-system)',
            fontSize: 'clamp(22px, 6vw, 30px)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'var(--t1)',
            lineHeight: 1.15,
          }}>
            {data.partner1}
            <span style={{
              margin: '0 10px',
              fontSize: '0.52em',
              color: 'var(--accent)',
              fontWeight: 700,
              letterSpacing: '0.02em',
              position: 'relative',
              top: '-2px',
            }}>×</span>
            {data.partner2}
          </p>

          {/* 日付 */}
          <p style={{
            fontFamily: 'var(--font-display, -apple-system)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--t4)',
            marginTop: '8px',
            letterSpacing: '0.14em',
          }}>
            {data.startDate.replace(/-/g, '/')} から
          </p>

          {/* 下部 グラデーション区切り */}
          <div style={{ marginTop:'22px', display:'flex', justifyContent:'center', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'36px', height:'1.5px', borderRadius:'2px', background:'linear-gradient(to right, transparent, rgba(255,26,110,0.50))' }} />
            <div style={{ width:'8px', height:'1.5px', borderRadius:'2px', background:'var(--accent)', boxShadow:'0 0 6px rgba(255,26,110,0.70)' }} />
            <div style={{ width:'36px', height:'1.5px', borderRadius:'2px', background:'linear-gradient(to left, transparent, rgba(255,26,110,0.50))' }} />
          </div>
        </div>

        {/* ── ホームタブ ── */}
        {tab === 'home' && (
          <div key="home">
            {/* 日数カード */}
            <div style={{ position:'relative', marginBottom:'16px' }}>
              {/* ごく控えめな外側グロー */}
              <div style={{
                position:'absolute', inset:'-6px', borderRadius:'26px',
                background:'rgba(255,26,110,0.16)',
                filter:'blur(14px)', zIndex:0,
              }} />
              <div className="glass" style={{
                position:'relative', zIndex:1,
                padding:'44px 24px 36px', textAlign:'center', overflow:'hidden',
                background:'rgba(12,4,14,0.72)',
              }}>
                {/* 上部に淡いピンクの光 */}
                <div style={{ position:'absolute', top:'-8%', left:'50%', transform:'translateX(-50%)', width:'65%', height:'50%', background:'radial-gradient(ellipse at top, rgba(255,26,110,0.13) 0%, transparent 70%)', pointerEvents:'none' }} />
                <div className="au"><DayCounter days={days} /></div>
              </div>
            </div>

            {next && (
              <div className="glass-sm" style={{ padding:'18px 20px', display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px' }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--t3)', marginBottom:'4px' }}>Next milestone</p>
                  <p style={{ fontSize:'17px', fontWeight:600, color:'var(--accent)', letterSpacing:'-0.01em' }}>{next.milestone.label}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:'34px', fontWeight:700, color:'var(--t1)', letterSpacing:'-0.03em', lineHeight:1 }}>{next.daysLeft}</p>
                  <p style={{ fontSize:'9px', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--t4)', marginTop:'2px' }}>days left</p>
                </div>
              </div>
            )}

            <div style={{ marginTop:'32px' }} className="au">
              <MilestoneCards startDate={data.startDate} currentDays={days} />
            </div>
          </div>
        )}

        {/* ── 写真タブ ── */}
        {tab === 'photos' && (
          <div key="photos" className="au">
            <PhotoGallery
              photos={data.photos}
              onAdd={(p: Photo) => update({ photos: [...data.photos, p] })}
              onDelete={(id: string) => update({ photos: data.photos.filter(x => x.id !== id) })}
            />
          </div>
        )}

        {/* ── メッセージタブ ── */}
        {tab === 'messages' && (
          <div key="messages" className="au">
            <Messages
              messages={data.messages}
              partner1={data.partner1}
              partner2={data.partner2}
              onAdd={(m: Message) => update({ messages: [...data.messages, m] })}
              onDelete={(id: string) => update({ messages: data.messages.filter(x => x.id !== id) })}
            />
          </div>
        )}

        {/* ── カプセルタブ ── */}
        {tab === 'capsule' && (
          <div key="capsule" className="au">
            <TimeCapsuleView
              capsules={data.capsules ?? []}
              partner1={data.partner1}
              partner2={data.partner2}
              startDate={data.startDate}
              onAdd={(c: TimeCapsule) => update({ capsules: [...(data.capsules ?? []), c] })}
              onSeal={(id, name, text, photo) => update({
                capsules: data.capsules.map(c => c.id === id ? {
                  ...c,
                  messages: c.messages.map(m => m.name === name
                    ? { ...m, text, photoDataUrl: photo, isSealed: true, sealedAt: new Date().toISOString() }
                    : m
                  ),
                } : c),
              })}
              onOpen={(id: string) => update({
                capsules: data.capsules.map(c => c.id === id ? { ...c, isOpened: true } : c),
              })}
              onDelete={(id: string) => update({
                capsules: data.capsules.filter(c => c.id !== id),
              })}
            />
          </div>
        )}
      </div>

      {/* ── ボトムナビ ── */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:50,
        background:'rgba(16,8,16,0.84)', backdropFilter:'blur(28px) saturate(150%)',
        WebkitBackdropFilter:'blur(28px) saturate(150%)',
        borderTop:'1px solid var(--bd1)',
        paddingBottom:'max(16px, env(safe-area-inset-bottom))',
      }}>
        <div style={{ display:'flex', maxWidth:'480px', margin:'0 auto' }}>
          {NAV.map(({ id, Icon, label }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)} style={{
                flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'5px',
                background:'none', border:'none', cursor:'pointer', padding:'12px 8px 4px',
                color: active ? 'var(--accent)' : 'var(--t4)',
                transition:'color 0.2s ease',
                fontFamily:'inherit',
              }}>
                <Icon size={21} strokeWidth={active ? 1.8 : 1.2} />
                <span style={{ fontSize:'9px', fontWeight: active ? 700 : 500, letterSpacing:'0.10em', textTransform:'uppercase' }}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
