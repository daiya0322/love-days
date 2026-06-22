'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveData, getData } from '@/lib/storage';
export default function SetupPage() {
  const router = useRouter();
  const existing = typeof window !== 'undefined' ? getData() : null;
  const [p1,    setP1]    = useState(existing?.partner1  ?? '');
  const [p2,    setP2]    = useState(existing?.partner2  ?? '');
  const [date,  setDate]  = useState(existing?.startDate ?? '');
  const [error, setError] = useState('');
  function handleSave() {
    if (!p1.trim()) { setError('あなたの名前を入力してください'); return; }
    if (!p2.trim()) { setError('相手の名前を入力してください');   return; }
    if (!date)      { setError('付き合い始めた日を選んでください'); return; }
    if (new Date(date) > new Date()) { setError('未来の日付は設定できません'); return; }
    const prev = getData();
    saveData({
      partner1: p1.trim(), partner2: p2.trim(), startDate: date,
      photos:   prev?.photos   ?? [],
      messages: prev?.messages ?? [],
      capsules: prev?.capsules ?? [],
    });
    router.push('/home');
  }
  return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'var(--bg)', position:'relative', overflow:'hidden' }}>
      {/* グロー */}
      <div style={{ position:'absolute', top:'-10%', left:'50%', transform:'translateX(-50%)', width:'520px', height:'420px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,95,168,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-5%', right:'-10%', width:'320px', height:'320px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,170,207,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:'400px', position:'relative', zIndex:1 }}>
        {/* ロゴ */}
        <div style={{ textAlign:'center', marginBottom:'52px' }} className="au">
          <p style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.36em', textTransform:'uppercase', color:'var(--t4)', marginBottom:'18px' }}>Love Days</p>
          <div style={{ fontFamily:'var(--font-display, -apple-system)', fontSize:'clamp(42px,13vw,58px)', fontWeight:700, letterSpacing:'-0.02em', color:'var(--t1)', lineHeight:1 }}>
            Together
          </div>
          <div style={{ width:'36px', height:'2px', background:'var(--accent)', margin:'20px auto 0', borderRadius:'2px', boxShadow:'0 0 10px rgba(255,95,168,0.5)' }} />
        </div>

        {/* フォーム */}
        <div style={{ display:'flex', flexDirection:'column', gap:'14px', animationDelay:'0.12s' }} className="au">
          <div>
            <label style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase', color:'var(--t3)', display:'block', marginBottom:'8px' }}>あなたの名前</label>
            <input className="inp" placeholder="Daiya" value={p1} onChange={e=>setP1(e.target.value)} style={{ padding:'14px 16px' }} />
          </div>
          <div>
            <label style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase', color:'var(--t3)', display:'block', marginBottom:'8px' }}>相手の名前</label>
            <input className="inp" placeholder="Yui" value={p2} onChange={e=>setP2(e.target.value)} style={{ padding:'14px 16px' }} />
          </div>
          <div>
            <label style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase', color:'var(--t3)', display:'block', marginBottom:'8px' }}>付き合い始めた日</label>
            <input type="date" className="inp" value={date} onChange={e=>setDate(e.target.value)} style={{ padding:'14px 16px', colorScheme:'dark' }} />
          </div>
          {error && (
            <div style={{ fontSize:'13px', fontWeight:500, color:'var(--accent2)', background:'rgba(255,95,168,0.08)', border:'1px solid rgba(255,95,168,0.20)', borderRadius:'10px', padding:'12px 15px', letterSpacing:'0.02em' }}>{error}</div>
          )}
          <button className="btn-primary" onClick={handleSave} style={{ marginTop:'8px' }}>
            {existing ? '設定を更新する' : 'はじめる'}
          </button>
          <p style={{ fontSize:'11px', fontWeight:500, color:'var(--t4)', textAlign:'center', letterSpacing:'0.04em' }}>データはこのデバイスのみに保存されます</p>
        </div>
      </div>
    </main>
  );
}
