'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveData, getData } from '@/lib/storage';

export default function SetupPage() {
  const router = useRouter();
  const existing = typeof window !== 'undefined' ? getData() : null;
  const [p1, setP1] = useState(existing?.partner1 ?? '');
  const [p2, setP2] = useState(existing?.partner2 ?? '');
  const [date, setDate] = useState(existing?.startDate ?? '');
  const [error, setError] = useState('');

  function handleSave() {
    if (!p1.trim()) { setError('あなたの名前を入力してください'); return; }
    if (!p2.trim()) { setError('恋人の名前を入力してください'); return; }
    if (!date) { setError('付き合い始めた日を選んでください'); return; }
    const d = new Date(date);
    if (d > new Date()) { setError('未来の日付は設定できません'); return; }
    const prev = getData();
    saveData({ partner1: p1.trim(), partner2: p2.trim(), startDate: date, photos: prev?.photos ?? [], messages: prev?.messages ?? [] });
    router.push('/home');
  }

  return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', background:'var(--bg)', position:'relative', overflow:'hidden' }}>
      {/* 背景グロー */}
      <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,107,157,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:'420px', animation:'fadeUp 0.6s ease both' }}>
        {/* ロゴ */}
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ fontSize:'48px', marginBottom:'8px', animation:'pulse-heart 2s ease-in-out infinite' }}>💗</div>
          <h1 style={{ fontSize:'28px', fontWeight:900, letterSpacing:'-0.03em' }} className="gradient-text">Love Days</h1>
          <p style={{ fontSize:'13px', color:'var(--t3)', marginTop:'6px' }}>2人の記念日を、毎日大切に</p>
        </div>

        {/* フォームカード */}
        <div className="card" style={{ padding:'28px 24px', display:'flex', flexDirection:'column', gap:'20px' }}>
          <div>
            <label style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', color:'var(--t3)', textTransform:'uppercase', display:'block', marginBottom:'8px' }}>あなたの名前</label>
            <input className="inp" placeholder="例: Daiya" value={p1} onChange={e => setP1(e.target.value)} style={{ padding:'13px 16px', fontSize:'15px' }} />
          </div>
          <div>
            <label style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', color:'var(--t3)', textTransform:'uppercase', display:'block', marginBottom:'8px' }}>恋人の名前</label>
            <input className="inp" placeholder="例: Yui" value={p2} onChange={e => setP2(e.target.value)} style={{ padding:'13px 16px', fontSize:'15px' }} />
          </div>
          <div>
            <label style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', color:'var(--t3)', textTransform:'uppercase', display:'block', marginBottom:'8px' }}>付き合い始めた日 💕</label>
            <input type="date" className="inp" value={date} onChange={e => setDate(e.target.value)} style={{ padding:'13px 16px', fontSize:'15px', colorScheme:'dark' }} />
          </div>

          {error && <div style={{ fontSize:'12px', color:'#FF6B9D', background:'rgba(255,107,157,0.1)', border:'1px solid rgba(255,107,157,0.2)', borderRadius:'8px', padding:'10px 14px' }}>{error}</div>}

          <button className="btn-rose" onClick={handleSave} style={{ padding:'15px', fontSize:'15px', marginTop:'4px' }}>
            {existing ? '設定を更新する' : 'はじめる ✨'}
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:'11px', color:'var(--t3)', marginTop:'20px' }}>データはこのデバイスにのみ保存されます</p>
      </div>
    </main>
  );
}
