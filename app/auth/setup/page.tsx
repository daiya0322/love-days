'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Step = 'choice' | 'create' | 'invite_shown' | 'join';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `LOVE-${suffix}`;
}

const LBL: React.CSSProperties = {
  fontSize:'10px', fontWeight:700, letterSpacing:'0.20em',
  textTransform:'uppercase', color:'var(--t3)', display:'block', marginBottom:'8px',
};

export default function CoupleSetupPage() {
  const router  = useRouter();
  const [step,      setStep]      = useState<Step>('choice');
  const [p1,        setP1]        = useState('');
  const [p2,        setP2]        = useState('');
  const [date,      setDate]      = useState('');
  const [code,      setCode]      = useState('');
  const [joinCode,  setJoinCode]  = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    // すでにカップルに参加済みならホームへ
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/auth'); return; }
      const { data } = await supabase
        .from('couples')
        .select('id')
        .or(`partner1_id.eq.${user.id},partner2_id.eq.${user.id}`)
        .maybeSingle();
      if (data) router.replace('/home');
    });
  }, [router]);

  async function handleCreate() {
    if (!p1.trim() || !p2.trim() || !date) { setError('すべての項目を入力してください'); return; }
    if (new Date(date) > new Date()) { setError('未来の日付は設定できません'); return; }
    setError(''); setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ログインが必要です');

      const inviteCode = generateInviteCode();
      const { error: err } = await supabase.from('couples').insert({
        invite_code:   inviteCode,
        start_date:    date,
        partner1_name: p1.trim(),
        partner2_name: p2.trim(),
        partner1_id:   user.id,
      });
      if (err) throw err;

      setCode(inviteCode);
      setStep('invite_shown');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) { setError('招待コードを入力してください'); return; }
    setError(''); setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ログインが必要です');

      const { error: err } = await supabase.rpc('join_couple', {
        p_invite_code: joinCode.trim().toUpperCase(),
      });
      if (err) {
        if (err.message.includes('invite_code_not_found')) throw new Error('招待コードが見つかりません。コードを確認してください');
        if (err.message.includes('cannot_join_own_couple')) throw new Error('自分のカップル部屋には参加できません');
        throw err;
      }

      router.replace('/home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  /* ── 招待コード表示 ── */
  if (step === 'invite_shown') return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:'380px', textAlign:'center' }} className="au">
        <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--accent-dim)', border:'1.5px solid var(--bd2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <span style={{ fontSize:'28px' }}>+</span>
        </div>
        <p style={{ fontSize:'17px', fontWeight:700, color:'var(--t1)', marginBottom:'8px' }}>カップル部屋を作成しました</p>
        <p style={{ fontSize:'13px', color:'var(--t3)', marginBottom:'32px', lineHeight:1.65 }}>
          この招待コードを相手に送ってください。<br />相手がコードを入力すると2人で繋がります。
        </p>

        <div style={{ background:'var(--s2)', border:'1px solid var(--bd2)', borderRadius:'18px', padding:'28px 20px', marginBottom:'28px' }}>
          <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--t4)', marginBottom:'12px' }}>招待コード</p>
          <p style={{ fontFamily:'var(--font-display, monospace)', fontSize:'clamp(28px,9vw,38px)', fontWeight:800, letterSpacing:'0.08em', color:'var(--accent)', lineHeight:1 }}>
            {code}
          </p>
          <button
            onClick={() => navigator.clipboard?.writeText(code)}
            className="btn-ghost"
            style={{ marginTop:'16px', padding:'9px 20px', fontSize:'12px' }}
          >
            コピー
          </button>
        </div>

        <button className="btn-primary" onClick={() => router.replace('/home')}>
          ホームへ進む（ひとりで先に）
        </button>
        <p style={{ fontSize:'11px', color:'var(--t4)', marginTop:'14px', lineHeight:1.65 }}>
          相手はアプリに登録後、招待コードを入力することで参加できます
        </p>
      </div>
    </main>
  );

  /* ── 選択画面 ── */
  if (step === 'choice') return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:'380px' }} className="au">
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <p style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.36em', textTransform:'uppercase', color:'var(--t4)', marginBottom:'12px' }}>Love Days</p>
          <p style={{ fontFamily:'var(--font-display, -apple-system)', fontSize:'24px', fontWeight:700, color:'var(--t1)' }}>2人を繋げましょう</p>
          <div style={{ width:'28px', height:'2px', background:'var(--accent)', margin:'14px auto 0', borderRadius:'2px' }} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <button onClick={() => setStep('create')} className="btn-primary" style={{ padding:'20px', textAlign:'left', display:'flex', flexDirection:'column', gap:'4px' }}>
            <span style={{ fontSize:'15px', fontWeight:700 }}>カップル部屋を作る</span>
            <span style={{ fontSize:'12px', fontWeight:400, opacity:0.75 }}>初めて使う場合はこちら。招待コードが発行されます</span>
          </button>

          <button onClick={() => setStep('join')} style={{
            padding:'20px', borderRadius:'14px', textAlign:'left', display:'flex', flexDirection:'column', gap:'4px',
            background:'var(--s1)', border:'1px solid var(--bd2)', cursor:'pointer', fontFamily:'inherit',
          }}>
            <span style={{ fontSize:'15px', fontWeight:700, color:'var(--t1)' }}>招待コードを持っている</span>
            <span style={{ fontSize:'12px', color:'var(--t3)' }}>相手から送られたコードを入力して参加する</span>
          </button>
        </div>
      </div>
    </main>
  );

  /* ── カップル作成フォーム ── */
  if (step === 'create') return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:'380px' }} className="au">
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <p style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.36em', textTransform:'uppercase', color:'var(--t4)', marginBottom:'12px' }}>カップル部屋を作る</p>
          <div style={{ width:'28px', height:'2px', background:'var(--accent)', margin:'0 auto', borderRadius:'2px' }} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div>
            <label style={LBL}>あなたの名前</label>
            <input className="inp" placeholder="名前を入力" value={p1} onChange={e => setP1(e.target.value)} style={{ padding:'14px 16px' }} />
          </div>
          <div>
            <label style={LBL}>恋人の名前</label>
            <input className="inp" placeholder="名前を入力" value={p2} onChange={e => setP2(e.target.value)} style={{ padding:'14px 16px' }} />
          </div>
          <div>
            <label style={LBL}>付き合い始めた日</label>
            <input type="date" className="inp" value={date} onChange={e => setDate(e.target.value)} style={{ padding:'14px 16px', colorScheme:'dark' }} />
          </div>

          {error && (
            <div style={{ fontSize:'13px', color:'var(--accent2)', background:'rgba(255,95,168,0.08)', border:'1px solid rgba(255,95,168,0.20)', borderRadius:'10px', padding:'12px 15px' }}>
              {error}
            </div>
          )}

          <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
            <button className="btn-ghost" onClick={() => { setStep('choice'); setError(''); }} style={{ padding:'15px 18px' }}>戻る</button>
            <button className="btn-primary" onClick={handleCreate} disabled={loading} style={{ flex:1, opacity: loading ? 0.7 : 1 }}>
              {loading ? '作成中...' : '部屋を作成する'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );

  /* ── 招待コード入力 ── */
  return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:'380px' }} className="au">
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <p style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.36em', textTransform:'uppercase', color:'var(--t4)', marginBottom:'12px' }}>招待コードを入力</p>
          <div style={{ width:'28px', height:'2px', background:'var(--accent)', margin:'0 auto', borderRadius:'2px' }} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div>
            <label style={LBL}>招待コード</label>
            <input
              className="inp"
              placeholder="LOVE-XXXX"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              style={{ padding:'14px 16px', letterSpacing:'0.12em', fontSize:'18px', fontWeight:700, textAlign:'center' }}
            />
          </div>

          {error && (
            <div style={{ fontSize:'13px', color:'var(--accent2)', background:'rgba(255,95,168,0.08)', border:'1px solid rgba(255,95,168,0.20)', borderRadius:'10px', padding:'12px 15px' }}>
              {error}
            </div>
          )}

          <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
            <button className="btn-ghost" onClick={() => { setStep('choice'); setError(''); }} style={{ padding:'15px 18px' }}>戻る</button>
            <button className="btn-primary" onClick={handleJoin} disabled={loading} style={{ flex:1, opacity: loading ? 0.7 : 1 }}>
              {loading ? '参加中...' : 'カップルに参加する'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
