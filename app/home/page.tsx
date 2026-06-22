'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getPhotoUrl, CoupleRow, PhotoRow, MessageRow, TimeCapsuleRow, CapsuleMsgRow } from '@/lib/supabase';
import { getDaysTogether, getNextMilestone, formatDate } from '@/lib/calculations';
import { Photo, Message, TimeCapsule } from '@/lib/storage';
import DayCounter from '@/components/DayCounter';
import MilestoneCards from '@/components/MilestoneCards';
import PhotoGallery from '@/components/PhotoGallery';
import Messages from '@/components/Messages';
import HeartBg from '@/components/HeartBg';
import TimeCapsuleView from '@/components/TimeCapsule';
import { IconHeart, IconCamera, IconMail, IconSettings, IconBox } from '@/components/Icons';
import type { User } from '@supabase/supabase-js';

type Tab = 'home' | 'photos' | 'messages' | 'capsule';

export default function HomePage() {
  const router = useRouter();
  const [user,        setUser]        = useState<User | null>(null);
  const [couple,      setCouple]      = useState<CoupleRow | null>(null);
  const [dbPhotos,    setDbPhotos]    = useState<PhotoRow[]>([]);
  const [dbMessages,  setDbMessages]  = useState<MessageRow[]>([]);
  const [dbCapsules,  setDbCapsules]  = useState<TimeCapsuleRow[]>([]);
  const [dbCapMsgs,   setDbCapMsgs]   = useState<CapsuleMsgRow[]>([]);
  const [tab,         setTab]         = useState<Tab>('home');
  const [mounted,     setMounted]     = useState(false);

  const fetchPhotos = useCallback(async (coupleId: string) => {
    const { data } = await supabase.from('photos').select('*').eq('couple_id', coupleId).order('created_at', { ascending: true });
    setDbPhotos(data ?? []);
  }, []);

  const fetchMessages = useCallback(async (coupleId: string) => {
    const { data } = await supabase.from('messages').select('*').eq('couple_id', coupleId).order('created_at', { ascending: true });
    setDbMessages(data ?? []);
  }, []);

  const fetchCapsules = useCallback(async (coupleId: string) => {
    const { data: caps } = await supabase.from('time_capsules').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false });
    if (!caps) { setDbCapsules([]); setDbCapMsgs([]); return; }
    setDbCapsules(caps);
    if (caps.length > 0) {
      const ids = caps.map(c => c.id);
      const { data: msgs } = await supabase.from('capsule_messages').select('*').in('capsule_id', ids);
      setDbCapMsgs(msgs ?? []);
    } else {
      setDbCapMsgs([]);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { router.replace('/auth'); return; }
      setUser(u);

      const { data: coupleData } = await supabase
        .from('couples')
        .select('*')
        .or(`partner1_id.eq.${u.id},partner2_id.eq.${u.id}`)
        .maybeSingle();

      if (!coupleData) { router.replace('/auth/setup'); return; }
      setCouple(coupleData);

      await Promise.all([
        fetchPhotos(coupleData.id),
        fetchMessages(coupleData.id),
        fetchCapsules(coupleData.id),
      ]);
    });
  }, [router, fetchPhotos, fetchMessages, fetchCapsules]);

  // Realtime 同期
  useEffect(() => {
    if (!couple) return;
    const ch = supabase
      .channel(`couple-${couple.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos',           filter: `couple_id=eq.${couple.id}` }, () => fetchPhotos(couple.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages',          filter: `couple_id=eq.${couple.id}` }, () => fetchMessages(couple.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_capsules',     filter: `couple_id=eq.${couple.id}` }, () => fetchCapsules(couple.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'capsule_messages' }, () => fetchCapsules(couple.id))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [couple, fetchPhotos, fetchMessages, fetchCapsules]);

  // ── データ変換 ──
  const photos: Photo[] = dbPhotos.map(p => ({
    id:          p.id,
    url:         getPhotoUrl(p.storage_path),
    storagePath: p.storage_path,
    caption:     p.caption ?? '',
    date:        p.created_at.slice(0, 10),
    createdAt:   p.created_at,
  }));

  const messages: Message[] = dbMessages.map(m => ({
    id:        m.id,
    text:      m.text,
    from:      m.from_name,
    createdAt: m.created_at,
  }));

  const capsules: TimeCapsule[] = dbCapsules.map(c => {
    const capMsgs = dbCapMsgs.filter(m => m.capsule_id === c.id);
    const byName  = Object.fromEntries(capMsgs.map(m => [m.author_name, m]));
    return {
      id:       c.id,
      title:    c.title,
      openDate: c.open_date,
      isOpened: c.is_opened,
      createdAt: c.created_at,
      messages: [couple!.partner1_name, couple!.partner2_name].map(name => {
        const m = byName[name];
        return m ? {
          name,
          text:        m.message_text ?? '',
          photoDataUrl: m.photo_storage_path ? getPhotoUrl(m.photo_storage_path) : undefined,
          isSealed:    m.is_sealed,
          sealedAt:    m.sealed_at ?? undefined,
        } : { name, text: '', isSealed: false };
      }),
    };
  });

  const myName  = couple?.partner1_id === user?.id ? couple?.partner1_name : couple?.partner2_name;
  const bgPhoto = photos.length > 0 ? photos[photos.length - 1].url : undefined;

  // ── ハンドラ ──
  async function handlePhotoAdd(file: File, caption: string) {
    if (!couple || !user) return;
    const ext  = file.name.split('.').pop() ?? 'jpg';
    const path = `${couple.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file);
    if (error) { console.error(error); return; }
    await supabase.from('photos').insert({ couple_id: couple.id, storage_path: path, caption, uploaded_by: user.id });
    await fetchPhotos(couple.id);
  }

  async function handlePhotoDelete(id: string, storagePath: string) {
    await supabase.storage.from('photos').remove([storagePath]);
    await supabase.from('photos').delete().eq('id', id);
    await fetchPhotos(couple!.id);
  }

  async function handleMessageAdd(m: Message) {
    if (!couple || !user) return;
    await supabase.from('messages').insert({ couple_id: couple.id, text: m.text, from_name: m.from, author_id: user.id });
    await fetchMessages(couple.id);
  }

  async function handleMessageDelete(id: string) {
    await supabase.from('messages').delete().eq('id', id);
    await fetchMessages(couple!.id);
  }

  async function handleCapsuleAdd(c: TimeCapsule) {
    if (!couple || !user) return;
    await supabase.from('time_capsules').insert({ couple_id: couple.id, title: c.title, open_date: c.openDate, created_by: user.id, is_opened: false });
    await fetchCapsules(couple.id);
  }

  async function handleCapsuleSeal(capsuleId: string, name: string, text: string, photo?: string) {
    if (!couple || !user) return;

    let photoPath: string | undefined;
    if (photo?.startsWith('data:')) {
      const blob = await (await fetch(photo)).blob();
      const path = `${couple.id}/capsules/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('photos').upload(path, blob);
      if (!error) photoPath = path;
    }

    const existing = dbCapMsgs.find(m => m.capsule_id === capsuleId && m.author_id === user.id);
    if (existing) {
      await supabase.from('capsule_messages').update({
        message_text: text, photo_storage_path: photoPath ?? null,
        is_sealed: true, sealed_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('capsule_messages').insert({
        capsule_id: capsuleId, author_id: user.id, author_name: name,
        message_text: text, photo_storage_path: photoPath ?? null,
        is_sealed: true, sealed_at: new Date().toISOString(),
      });
    }
    await fetchCapsules(couple.id);
  }

  async function handleCapsuleOpen(capsuleId: string) {
    await supabase.from('time_capsules').update({ is_opened: true }).eq('id', capsuleId);
    await fetchCapsules(couple!.id);
  }

  async function handleCapsuleDelete(capsuleId: string) {
    await supabase.from('time_capsules').delete().eq('id', capsuleId);
    await fetchCapsules(couple!.id);
  }

  if (!mounted || !couple) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ width:'32px', height:'32px', borderRadius:'50%', border:'2px solid var(--bd2)', borderTopColor:'var(--accent)', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  const days = getDaysTogether(couple.start_date);
  const next = getNextMilestone(couple.start_date);

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

        {/* トップバー */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'max(20px, env(safe-area-inset-top))', paddingBottom:'4px' }}>
          <p style={{ fontSize:'10px', fontWeight:500, letterSpacing:'0.16em', color:'var(--t4)', textTransform:'uppercase' }}>{formatDate(new Date())}</p>
          <button onClick={() => router.push('/setup')} className="btn-ghost" style={{ padding:'7px 12px', display:'flex', alignItems:'center', gap:'6px', fontSize:'11px' }}>
            <IconSettings size={13} strokeWidth={1.4} />設定
          </button>
        </div>

        {/* 名前ヘッダー */}
        <div style={{ textAlign:'center', padding:'20px 0 28px' }} className="au">
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
            <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, transparent, rgba(255,26,110,0.40))' }} />
            <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
              <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:'rgba(255,26,110,0.35)' }} />
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)', boxShadow:'0 0 10px rgba(255,26,110,0.80)' }} />
              <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:'rgba(255,26,110,0.35)' }} />
            </div>
            <div style={{ flex:1, height:'1px', background:'linear-gradient(to left, transparent, rgba(255,26,110,0.40))' }} />
          </div>

          <p style={{ fontFamily:'var(--font-display, -apple-system)', fontSize:'clamp(22px, 6vw, 30px)', fontWeight:600, letterSpacing:'0.06em', color:'var(--t1)', lineHeight:1.15 }}>
            {couple.partner1_name}
            <span style={{ margin:'0 10px', fontSize:'0.52em', color:'var(--accent)', fontWeight:700, letterSpacing:'0.02em', position:'relative', top:'-2px' }}>×</span>
            {couple.partner2_name}
          </p>

          <p style={{ fontFamily:'var(--font-display, -apple-system)', fontSize:'11px', fontWeight:500, color:'var(--t4)', marginTop:'8px', letterSpacing:'0.14em' }}>
            {couple.start_date.replace(/-/g, '/')} から
          </p>

          <div style={{ marginTop:'22px', display:'flex', justifyContent:'center', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'36px', height:'1.5px', borderRadius:'2px', background:'linear-gradient(to right, transparent, rgba(255,26,110,0.50))' }} />
            <div style={{ width:'8px', height:'1.5px', borderRadius:'2px', background:'var(--accent)', boxShadow:'0 0 6px rgba(255,26,110,0.70)' }} />
            <div style={{ width:'36px', height:'1.5px', borderRadius:'2px', background:'linear-gradient(to left, transparent, rgba(255,26,110,0.50))' }} />
          </div>
        </div>

        {/* ホームタブ */}
        {tab === 'home' && (
          <div key="home">
            <div style={{ position:'relative', marginBottom:'16px' }}>
              <div style={{ position:'absolute', inset:'-6px', borderRadius:'26px', background:'rgba(255,26,110,0.16)', filter:'blur(14px)', zIndex:0 }} />
              <div className="glass" style={{ position:'relative', zIndex:1, padding:'44px 24px 36px', textAlign:'center', overflow:'hidden', background:'rgba(12,4,14,0.72)' }}>
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
              <MilestoneCards startDate={couple.start_date} currentDays={days} />
            </div>
          </div>
        )}

        {tab === 'photos' && (
          <div key="photos" className="au">
            <PhotoGallery
              photos={photos}
              onAdd={handlePhotoAdd}
              onDelete={handlePhotoDelete}
            />
          </div>
        )}

        {tab === 'messages' && (
          <div key="messages" className="au">
            <Messages
              messages={messages}
              partner1={couple.partner1_name}
              partner2={couple.partner2_name}
              onAdd={handleMessageAdd}
              onDelete={handleMessageDelete}
            />
          </div>
        )}

        {tab === 'capsule' && (
          <div key="capsule" className="au">
            <TimeCapsuleView
              capsules={capsules}
              partner1={couple.partner1_name}
              partner2={couple.partner2_name}
              startDate={couple.start_date}
              currentUserName={myName}
              onAdd={handleCapsuleAdd}
              onSeal={handleCapsuleSeal}
              onOpen={handleCapsuleOpen}
              onDelete={handleCapsuleDelete}
            />
          </div>
        )}
      </div>

      {/* ボトムナビ */}
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
