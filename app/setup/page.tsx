'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, CoupleRow } from '@/lib/supabase';

const LBL: React.CSSProperties = {
  fontSize:'10px', fontWeight:700, letterSpacing:'0.20em',
  textTransform:'uppercase', color:'var(--t3)', display:'block', marginBottom:'8px',
};

export default function SetupPage() {
  const router = useRouter();
  const [couple,  setCouple]  = useState<CoupleRow | null>(null);
  const [p1,      setP1]      = useState('');
  const [p2,      setP2]      = useState('');
  const [date,    setDate]    = useState('');
  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/auth'); return; }
      const { data } = await supabase
        .from('couples')
        .select('*')
        .or(`partner1_id.eq.${user.id},partner2_id.eq.${user.id}`)
        .maybeSingle();
      if (!data) { router.replace('/auth/setup'); return; }
      setCouple(data);
      setP1(data.partner1_name);
      setP2(data.partner2_name);
      setDate(data.start_date);
    });
  }, [router]);

  async function handleSave() {
    if (!p1.trim()) { setError('あなたの名前を入力してください'); return; }
    if (!p2.trim()) { setError('相手の名前を入力してください'); return; }
    if (!date)      { setError('付き合い始めた日を選んでください'); return; }
    if (new Date(date) > new Date()) { setError('未来の日付は設定できません'); return; }
    setError(''); setSaving(true);
    try {
      const { error: err } = await supabase
        .from('couples')
        .update({ partner1_name: p1.trim(), partner2_name: p2.trim(), start_date: date, updated_at: new Date().toISOString() })
        .eq('id', couple!.id);
      if (err) throw err;
      router.push('/home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    navigator.clipboard?.writeText(couple!.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/auth');
  }

  if (!mounted || !couple) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ width:'32px', height:'32px', borderRadius:'50%', border:'2px solid var(--bd2)', borderTopColor:'var(--accent)', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'var(--bg)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-10%', left:'50%', transform:'translateX(-50%)', width:'520px', height:'420px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,95,168,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:'400px', position:'relative', zIndex:1 }}>

        {/* ヘッダー */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'36px' }} className="au">
          <button onClick={() => router.back()} className="btn-ghost" style={{ padding:'8px 14px', fontSize:'12px' }}>戻る</button>
          <p style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:'var(--t4)' }}>Settings</p>
          <div style={{ width:'52px' }} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }} className="au">

          <div>
            <label style={LBL}>あなたの名前</label>
            <input className="inp" value={p1} onChange={e => setP1(e.target.value)} style={{ padding:'14px 16px' }} />
          </div>
          <div>
            <label style={LBL}>相手の名前</label>
            <input className="inp" value={p2} onChange={e => setP2(e.target.value)} style={{ padding:'14px 16px' }} />
          </div>
          <div>
            <label style={LBL}>付き合い始めた日</label>
            <input type="date" className="inp" value={date} onChange={e => setDate(e.target.value)} style={{ padding:'14px 16px', colorScheme:'dark' }} />
          </div>

          {/* 招待コード（相手未参加時のみ） */}
          {!couple.partner2_id && (
            <div style={{ background:'var(--s1)', border:'1px solid var(--bd1)', borderRadius:'14px', padding:'16px 18px' }}>
              <p style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--t4)', marginBottom:'10px' }}>招待コード（相手未参加）</p>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <p style={{ fontFamily:'var(--font-display, monospace)', fontSize:'22px', fontWeight:800, letterSpacing:'0.08em', color:'var(--accent)', flex:1 }}>
                  {couple.invite_code}
                </p>
                <button onClick={handleCopy} className="btn-ghost" style={{ padding:'8px 14px', fontSize:'12px', flexShrink:0 }}>
                  {copied ? '完了' : 'コピー'}
                </button>
              </div>
              <p style={{ fontSize:'11px', color:'var(--t4)', marginTop:'8px', lineHeight:1.6 }}>
                このコードを相手に送ってください
              </p>
            </div>
          )}

          {error && (
            <div style={{ fontSize:'13px', color:'var(--accent2)', background:'rgba(255,95,168,0.08)', border:'1px solid rgba(255,95,168,0.20)', borderRadius:'10px', padding:'12px 15px' }}>
              {error}
            </div>
          )}

          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop:'4px', opacity: saving ? 0.7 : 1 }}>
            {saving ? '保存中...' : '設定を更新する'}
          </button>

          <div style={{ height:'1px', background:'var(--bd1)', margin:'4px 0' }} />

          <button onClick={handleLogout} style={{
            padding:'14px', borderRadius:'14px', fontSize:'14px', fontWeight:600,
            background:'transparent', border:'1px solid rgba(239,68,68,0.25)',
            color:'rgba(239,68,68,0.65)', cursor:'pointer', fontFamily:'inherit',
            transition:'opacity 0.2s',
          }}>
            ログアウト
          </button>
        </div>
      </div>
    </main>
  );
}
