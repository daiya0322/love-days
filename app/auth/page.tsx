'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [mode,    setMode]    = useState<'login' | 'register'>('login');
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !pass.trim()) { setError('メールアドレスとパスワードを入力してください'); return; }
    setError(''); setLoading(true);

    try {
      if (mode === 'register') {
        const { error: err } = await supabase.auth.signUp({ email: email.trim(), password: pass });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
        if (err) throw err;
      }

      // カップルに参加済みか確認
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証に失敗しました');

      const { data: couple } = await supabase
        .from('couples')
        .select('id')
        .or(`partner1_id.eq.${user.id},partner2_id.eq.${user.id}`)
        .maybeSingle();

      router.replace(couple ? '/home' : '/auth/setup');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Invalid login')) setError('メールアドレスまたはパスワードが正しくありません');
      else if (msg.includes('already registered')) setError('このメールアドレスはすでに登録されています');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'var(--bg)', position:'relative', overflow:'hidden' }}>
      {/* 背景グロー */}
      <div style={{ position:'absolute', top:'-10%', left:'50%', transform:'translateX(-50%)', width:'520px', height:'420px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,95,168,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:'380px', position:'relative', zIndex:1 }}>
        {/* ロゴ */}
        <div style={{ textAlign:'center', marginBottom:'44px' }} className="au">
          <p style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.36em', textTransform:'uppercase', color:'var(--t4)', marginBottom:'14px' }}>Love Days</p>
          <div style={{ fontFamily:'var(--font-display, -apple-system)', fontSize:'clamp(36px,11vw,48px)', fontWeight:700, letterSpacing:'-0.02em', color:'var(--t1)', lineHeight:1 }}>
            Together
          </div>
          <div style={{ width:'28px', height:'2px', background:'var(--accent)', margin:'16px auto 0', borderRadius:'2px', boxShadow:'0 0 10px rgba(255,95,168,0.5)' }} />
        </div>

        {/* モード切替 */}
        <div style={{ display:'flex', background:'var(--s1)', borderRadius:'14px', padding:'4px', marginBottom:'28px', border:'1px solid var(--bd1)' }} className="au">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
              flex:1, padding:'11px', borderRadius:'10px', fontSize:'13px', fontWeight:700,
              fontFamily:'inherit', cursor:'pointer', transition:'all 0.18s', letterSpacing:'0.02em',
              background: mode === m ? 'var(--accent)' : 'transparent',
              border: 'none',
              color: mode === m ? '#fff' : 'var(--t3)',
              boxShadow: mode === m ? '0 2px 12px rgba(255,95,168,0.35)' : 'none',
            }}>
              {m === 'login' ? 'ログイン' : '新規登録'}
            </button>
          ))}
        </div>

        {/* フォーム */}
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }} className="au">
          <div>
            <label style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase', color:'var(--t3)', display:'block', marginBottom:'8px' }}>メールアドレス</label>
            <input
              className="inp"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ padding:'14px 16px' }}
            />
          </div>
          <div>
            <label style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase', color:'var(--t3)', display:'block', marginBottom:'8px' }}>パスワード</label>
            <input
              className="inp"
              type="password"
              placeholder="6文字以上"
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ padding:'14px 16px' }}
            />
          </div>

          {error && (
            <div style={{ fontSize:'13px', fontWeight:500, color:'var(--accent2)', background:'rgba(255,95,168,0.08)', border:'1px solid rgba(255,95,168,0.20)', borderRadius:'10px', padding:'12px 15px' }}>
              {error}
            </div>
          )}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop:'4px', opacity: loading ? 0.7 : 1 }}>
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウントを作成'}
          </button>
        </div>
      </div>
    </main>
  );
}
