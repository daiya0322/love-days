'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, CoupleRow } from '@/lib/supabase';
import {
  NotificationSettings,
  loadNotificationSettings,
  saveNotificationSettings,
  getPermissionState,
  requestPermission,
} from '@/lib/notifications';

const LBL: React.CSSProperties = {
  fontSize:'10px', fontWeight:700, letterSpacing:'0.20em',
  textTransform:'uppercase', color:'var(--t3)', display:'block', marginBottom:'8px',
};

const SECTION: React.CSSProperties = {
  background:'var(--s1)', border:'1px solid var(--bd1)', borderRadius:'16px', padding:'20px 18px',
};

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width:'44px', height:'26px', borderRadius:'13px', border:'none', cursor:'pointer',
        background: on ? 'var(--accent)' : 'rgba(255,255,255,0.10)',
        position:'relative', transition:'background 0.2s', flexShrink:0,
        boxShadow: on ? '0 0 10px rgba(255,26,110,0.40)' : 'none',
      }}
      aria-label={on ? 'ON' : 'OFF'}
    >
      <span style={{
        position:'absolute', top:'3px',
        left: on ? '21px' : '3px',
        width:'20px', height:'20px', borderRadius:'50%',
        background:'white', transition:'left 0.2s',
        boxShadow:'0 1px 4px rgba(0,0,0,0.30)',
      }} />
    </button>
  );
}

function ToggleRow({
  label, sublabel, on, onToggle, disabled,
}: {
  label: string; sublabel?: string; on: boolean; onToggle: () => void; disabled?: boolean;
}) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:'14px', fontWeight:500, color:'var(--t1)', lineHeight:1.3 }}>{label}</p>
        {sublabel && <p style={{ fontSize:'11px', color:'var(--t4)', marginTop:'2px', lineHeight:1.4 }}>{sublabel}</p>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [couple,       setCouple]       = useState<CoupleRow | null>(null);
  const [p1,           setP1]           = useState('');
  const [p2,           setP2]           = useState('');
  const [date,         setDate]         = useState('');
  const [error,        setError]        = useState('');
  const [saving,       setSaving]       = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [mounted,      setMounted]      = useState(false);

  // 通知設定
  const [notif,        setNotif]        = useState<NotificationSettings | null>(null);
  const [permState,    setPermState]    = useState<'unsupported'|'default'|'granted'|'denied'>('default');
  const [permReq,      setPermReq]      = useState(false);

  useEffect(() => {
    setMounted(true);
    setNotif(loadNotificationSettings());
    setPermState(getPermissionState());

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

  // 通知設定変更
  function updateNotif(patch: Partial<NotificationSettings>) {
    if (!notif) return;
    const next = { ...notif, ...patch };
    setNotif(next);
    saveNotificationSettings(next);
  }

  async function handleEnableNotif() {
    if (!notif) return;
    if (notif.enabled) {
      updateNotif({ enabled: false });
      return;
    }
    if (permState === 'denied') {
      setError('通知がブラウザでブロックされています。ブラウザの設定から許可してください。');
      return;
    }
    if (permState === 'default') {
      setPermReq(true);
      const granted = await requestPermission();
      setPermReq(false);
      setPermState(getPermissionState());
      if (!granted) {
        setError('通知の許可が得られませんでした。ブラウザの設定から許可してください。');
        return;
      }
    }
    updateNotif({ enabled: true });
    setError('');
  }

  if (!mounted || !couple || !notif) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ width:'32px', height:'32px', borderRadius:'50%', border:'2px solid var(--bd2)', borderTopColor:'var(--accent)', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  const TIMING_OPTIONS: { value: 0|1|3|7; label: string }[] = [
    { value: 0, label: '当日' },
    { value: 1, label: '前日' },
    { value: 3, label: '3日前' },
    { value: 7, label: '1週間前' },
  ];

  return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 24px 60px', background:'var(--bg)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-10%', left:'50%', transform:'translateX(-50%)', width:'520px', height:'420px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,95,168,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:'400px', position:'relative', zIndex:1 }}>

        {/* ヘッダー */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'36px' }} className="au">
          <button onClick={() => router.back()} className="btn-ghost" style={{ padding:'8px 14px', fontSize:'12px' }}>戻る</button>
          <p style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:'var(--t4)' }}>Settings</p>
          <div style={{ width:'52px' }} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }} className="au">

          {/* ── 基本情報 ── */}
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

          {/* ── セパレータ ── */}
          <div style={{ height:'1px', background:'var(--bd1)', margin:'8px 0' }} />

          {/* ── 通知設定 ── */}
          <div>
            <p style={{ ...LBL, marginBottom:'16px' }}>通知設定</p>

            {permState === 'unsupported' && (
              <div style={{ fontSize:'12px', color:'var(--t4)', background:'var(--s1)', borderRadius:'12px', padding:'12px 14px', marginBottom:'14px', lineHeight:1.6 }}>
                このブラウザは通知機能に対応していません。
              </div>
            )}

            {permState === 'denied' && (
              <div style={{ fontSize:'12px', color:'rgba(239,68,68,0.80)', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:'12px', padding:'12px 14px', marginBottom:'14px', lineHeight:1.6 }}>
                通知がブラウザでブロックされています。<br />
                ブラウザのサイト設定から「通知を許可」してください。
              </div>
            )}

            <div style={{ ...SECTION, display:'flex', flexDirection:'column', gap:'18px' }}>

              {/* 通知 ON/OFF（メイン） */}
              <ToggleRow
                label="通知"
                sublabel={permState === 'default' ? '有効にするとブラウザから許可が求められます' : permState === 'granted' ? 'ブラウザの通知許可済み' : undefined}
                on={notif.enabled}
                onToggle={handleEnableNotif}
                disabled={permReq || permState === 'unsupported'}
              />

              <div style={{ height:'1px', background:'var(--bd1)' }} />

              {/* 種別トグル */}
              <ToggleRow
                label="記念日の通知"
                sublabel="100日・200日・365日など"
                on={notif.anniversaryEnabled}
                onToggle={() => updateNotif({ anniversaryEnabled: !notif.anniversaryEnabled })}
                disabled={!notif.enabled}
              />
              <ToggleRow
                label="予定の通知"
                sublabel="カレンダーに登録した予定"
                on={notif.eventEnabled}
                onToggle={() => updateNotif({ eventEnabled: !notif.eventEnabled })}
                disabled={!notif.enabled}
              />
              <ToggleRow
                label="タイムカプセルの通知"
                sublabel="開封日の当日・前日"
                on={notif.capsuleEnabled}
                onToggle={() => updateNotif({ capsuleEnabled: !notif.capsuleEnabled })}
                disabled={!notif.enabled}
              />

              <div style={{ height:'1px', background:'var(--bd1)' }} />

              {/* 通知タイミング */}
              <div style={{ opacity: notif.enabled ? 1 : 0.4, pointerEvents: notif.enabled ? 'auto' : 'none' }}>
                <p style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--t3)', marginBottom:'12px' }}>通知タイミング</p>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {TIMING_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateNotif({ timingDays: opt.value })}
                      style={{
                        padding:'8px 16px', borderRadius:'20px', fontSize:'13px', fontWeight:500,
                        border: notif.timingDays === opt.value ? '1px solid var(--accent)' : '1px solid var(--bd1)',
                        background: notif.timingDays === opt.value ? 'rgba(255,26,110,0.12)' : 'transparent',
                        color: notif.timingDays === opt.value ? 'var(--accent)' : 'var(--t3)',
                        cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 通知時刻 */}
              <div style={{ opacity: notif.enabled ? 1 : 0.4, pointerEvents: notif.enabled ? 'auto' : 'none' }}>
                <p style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--t3)', marginBottom:'10px' }}>通知時刻</p>
                <input
                  type="time"
                  value={notif.notifyTime}
                  onChange={e => updateNotif({ notifyTime: e.target.value })}
                  style={{
                    width:'140px', padding:'10px 14px', borderRadius:'12px', fontSize:'15px', fontWeight:500,
                    background:'var(--s2,rgba(255,255,255,0.05))', border:'1px solid var(--bd1)',
                    color:'var(--t1)', fontFamily:'inherit', colorScheme:'dark',
                  }}
                />
                <p style={{ fontSize:'11px', color:'var(--t4)', marginTop:'8px', lineHeight:1.5 }}>
                  アプリを開いたとき、この時刻を過ぎていると通知されます。
                </p>
              </div>
            </div>
          </div>

          {/* ── セパレータ ── */}
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
