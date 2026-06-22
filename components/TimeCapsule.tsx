'use client';
import { useState, useRef } from 'react';
import { TimeCapsule, CapsuleMessage } from '@/lib/storage';
import { IconLock, IconPlus, IconX, IconBox, IconCalendar } from './Icons';

interface Props {
  capsules: TimeCapsule[];
  partner1: string;
  partner2: string;
  startDate: string;
  currentUserName?: string;
  onAdd:    (c: TimeCapsule) => void;
  onSeal:   (id: string, name: string, text: string, photo?: string) => void;
  onOpen:   (id: string) => void;
  onDelete: (id: string) => void;
}

const QUICK = [
  { label: '100日',  days: 100 },
  { label: '200日',  days: 200 },
  { label: '1周年',  days: 365 },
  { label: '500日',  days: 500 },
  { label: '1000日', days: 1000 },
];

function daysUntil(d: string): number {
  const t = new Date(); t.setHours(0,0,0,0);
  const o = new Date(d); o.setHours(0,0,0,0);
  return Math.ceil((o.getTime() - t.getTime()) / 86400000);
}
function pickDate(start: string, n: number): string {
  const d = new Date(start); d.setDate(d.getDate() + n - 1);
  return d.toISOString().slice(0,10);
}

/* ── ラベルスタイル ── */
const LBL: React.CSSProperties = {
  fontSize:'10px', fontWeight:700, letterSpacing:'0.18em',
  textTransform:'uppercase', color:'var(--t3)', display:'block', marginBottom:'8px',
};

/* ─────────────────────────────────────── */
export default function TimeCapsuleView({ capsules, partner1, partner2, startDate, currentUserName, onAdd, onSeal, onOpen, onDelete }: Props) {
  const [view,            setView]            = useState<'list'|'create'>('list');
  const [title,           setTitle]           = useState('');
  const [openDate,        setOpenDate]        = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string|null>(null);

  function handleCreate() {
    if (!title.trim() || !openDate) return;
    onAdd({
      id: Date.now().toString(), title: title.trim(), openDate,
      messages: [
        { name: partner1, text: '', isSealed: false },
        { name: partner2, text: '', isSealed: false },
      ],
      isOpened: false, createdAt: new Date().toISOString(),
    });
    setTitle(''); setOpenDate(''); setView('list');
  }

  /* ── 作成フォーム ── */
  if (view === 'create') return (
    <div className="au">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <p style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.24em', textTransform:'uppercase', color:'var(--t3)' }}>New Capsule</p>
        <button onClick={() => { setView('list'); setTitle(''); setOpenDate(''); }} className="btn-ghost" style={{ padding:'7px 12px', display:'flex', alignItems:'center', gap:'5px', fontSize:'11px' }}>
          <IconX size={12} /> キャンセル
        </button>
      </div>

      <div className="glass-warm" style={{ padding:'22px', display:'flex', flexDirection:'column', gap:'18px' }}>
        <div>
          <label style={LBL}>タイトル</label>
          <input className="inp" placeholder="100日記念のカプセル" value={title} onChange={e=>setTitle(e.target.value)} style={{ padding:'13px 15px' }} />
        </div>

        <div>
          <label style={LBL}>開封日</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px' }}>
            {QUICK.map(q => {
              const qd = pickDate(startDate, q.days);
              const sel = openDate === qd;
              return (
                <button key={q.days} onClick={()=>setOpenDate(qd)} style={{
                  padding:'7px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:700,
                  fontFamily:'inherit', cursor:'pointer', transition:'all 0.18s',
                  background: sel ? 'var(--accent)' : 'var(--s2)',
                  border:`1px solid ${sel ? 'transparent' : 'var(--bd2)'}`,
                  color: sel ? '#fff' : 'var(--t2)',
                  boxShadow: sel ? '0 2px 12px rgba(255,95,168,0.35)' : 'none',
                }}>{q.label}</button>
              );
            })}
          </div>
          <input type="date" className="inp" value={openDate} onChange={e=>setOpenDate(e.target.value)} style={{ padding:'12px 15px', colorScheme:'dark' }} />
        </div>

        {/* 参加者プレビュー */}
        <div style={{ display:'flex', gap:'8px' }}>
          {[partner1, partner2].map(p => (
            <div key={p} style={{ flex:1, padding:'12px', borderRadius:'12px', background:'var(--s1)', border:'1px solid var(--bd1)', textAlign:'center' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--bd2)', margin:'0 auto 6px' }} />
              <p style={{ fontSize:'12px', fontWeight:600, color:'var(--t2)' }}>{p}</p>
              <p style={{ fontSize:'10px', color:'var(--t4)', letterSpacing:'0.08em', marginTop:'2px' }}>未作成</p>
            </div>
          ))}
        </div>

        <div className="glass-sm" style={{ padding:'13px 16px' }}>
          <p style={{ fontSize:'11px', color:'var(--t3)', lineHeight:1.65, letterSpacing:'0.01em' }}>
            作成後、それぞれが自分のメッセージを書いて封印します。開封日まで相手のメッセージは見えません。
          </p>
        </div>

        <button className="btn-primary" onClick={handleCreate} style={{ opacity:(!title.trim()||!openDate)?0.5:1 }}>
          カプセルを作成する
        </button>
      </div>
    </div>
  );

  /* ── リスト ── */
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <p style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.24em', textTransform:'uppercase', color:'var(--t3)' }}>Time Capsule</p>
        <button onClick={()=>setView('create')} className="btn-ghost" style={{ padding:'8px 14px', display:'flex', alignItems:'center', gap:'6px', fontSize:'12px' }}>
          <IconPlus size={14} strokeWidth={1.8} /> 作成
        </button>
      </div>

      {capsules.length === 0 && (
        <button onClick={()=>setView('create')} style={{
          width:'100%', padding:'52px 20px', cursor:'pointer', display:'flex', flexDirection:'column',
          alignItems:'center', gap:'18px', border:'1px dashed var(--bd2)', borderRadius:'20px',
          background:'transparent', textAlign:'center', fontFamily:'inherit',
        }}>
          <SealRing />
          <div>
            <p style={{ fontSize:'15px', fontWeight:600, color:'var(--t2)', letterSpacing:'0.01em' }}>思い出をカプセルに封印する</p>
            <p style={{ fontSize:'12px', color:'var(--t4)', marginTop:'6px', letterSpacing:'0.02em' }}>開封日まで中身は見えません</p>
          </div>
        </button>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {[...capsules].reverse().map(c => (
          <CapsuleCard
            key={c.id}
            capsule={c}
            currentUserName={currentUserName}
            onSeal={(name,text,photo)=>onSeal(c.id,name,text,photo)}
            onOpen={()=>onOpen(c.id)}
            onDelete={()=>setConfirmDeleteId(c.id)}
          />
        ))}
      </div>

      {/* ── 削除確認モーダル ── */}
      {confirmDeleteId && (
        <div
          onClick={() => setConfirmDeleteId(null)}
          style={{
            position:'fixed', inset:0, zIndex:300,
            background:'rgba(14,5,16,0.88)',
            backdropFilter:'blur(16px)',
            WebkitBackdropFilter:'blur(16px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:'28px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass-warm asi"
            style={{ padding:'32px 24px', maxWidth:'320px', width:'100%', textAlign:'center' }}
          >
            {/* アイコン */}
            <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <IconX size={22} color="rgba(239,68,68,0.80)" strokeWidth={1.8} />
            </div>

            <p style={{ fontSize:'17px', fontWeight:700, color:'var(--t1)', marginBottom:'10px', lineHeight:1.4 }}>
              このタイムカプセルを<br />削除しますか？
            </p>
            <p style={{ fontSize:'13px', color:'var(--t3)', marginBottom:'28px', lineHeight:1.65 }}>
              削除すると元に戻せません。
            </p>

            <div style={{ display:'flex', gap:'10px' }}>
              <button
                className="btn-ghost"
                onClick={() => setConfirmDeleteId(null)}
                style={{ flex:1, padding:'14px', fontSize:'14px' }}
              >
                キャンセル
              </button>
              <button
                onClick={() => { onDelete(confirmDeleteId); setConfirmDeleteId(null); }}
                style={{
                  flex:1, padding:'14px', borderRadius:'14px', fontSize:'14px', fontWeight:700,
                  background:'linear-gradient(135deg, #8B0026, #D0003C)',
                  color:'#fff', border:'none', cursor:'pointer', fontFamily:'inherit',
                  boxShadow:'0 4px 18px rgba(139,0,38,0.55)',
                }}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── シールリングアイコン ── */
function SealRing() {
  return (
    <div style={{ width:60, height:60, borderRadius:'50%', border:'1.5px solid var(--bd2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'1px solid var(--bd1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <IconBox size={18} color="var(--accent)" strokeWidth={1.3} />
      </div>
    </div>
  );
}

/* ── カプセルカード ── */
interface CardProps {
  capsule: TimeCapsule;
  currentUserName?: string;
  onSeal:  (name: string, text: string, photo?: string) => void;
  onOpen:  () => void;
  onDelete:() => void;
}

function CapsuleCard({ capsule, currentUserName, onSeal, onOpen, onDelete }: CardProps) {
  const until   = daysUntil(capsule.openDate);
  const isLocked = until > 0;
  const isReady  = until <= 0 && !capsule.isOpened;

  const [writingFor,  setWritingFor]  = useState<string|null>(null);
  const [writeTxt,    setWriteTxt]    = useState('');
  const [writePhoto,  setWritePhoto]  = useState<string|null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  function handleSeal() {
    if (!writingFor || !writeTxt.trim()) return;
    onSeal(writingFor, writeTxt.trim(), writePhoto ?? undefined);
    setWritingFor(null); setWriteTxt(''); setWritePhoto(null);
  }

  /* 開封済み */
  if (capsule.isOpened) return (
    <div className="glass-sm" style={{ padding:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <IconBox size={16} color="var(--accent)" strokeWidth={1.3} />
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:'15px', fontWeight:700, color:'var(--t1)' }}>{capsule.title}</p>
          <p style={{ fontSize:'10px', color:'var(--t4)', letterSpacing:'0.06em', marginTop:'2px' }}>
            {capsule.openDate.replace(/-/g,'/')}
          </p>
        </div>
        <span style={{ fontSize:'9px', padding:'4px 9px', borderRadius:'20px', background:'var(--accent-dim)', border:'1px solid var(--bd2)', color:'var(--accent)', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700 }}>OPENED</span>
      </div>
      {capsule.messages.map(m => (
        <div key={m.name} style={{ marginBottom:'16px' }}>
          <p style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--accent)', marginBottom:'7px' }}>{m.name}</p>
          {m.text
            ? <>
                <p style={{ fontSize:'14px', color:'var(--t2)', lineHeight:1.72, whiteSpace:'pre-wrap' }}>{m.text}</p>
                {m.photoDataUrl && <img src={m.photoDataUrl} alt="" style={{ width:'100%', borderRadius:'10px', marginTop:'10px', maxHeight:'200px', objectFit:'cover' }} />}
              </>
            : <p style={{ fontSize:'13px', color:'var(--t4)', fontStyle:'italic' }}>メッセージなし</p>
          }
        </div>
      ))}
      <button onClick={onDelete} className="btn-ghost" style={{ width:'100%', padding:'10px', fontSize:'12px', color:'rgba(239,68,68,0.65)', borderColor:'rgba(239,68,68,0.20)', marginTop:'4px' }}>削除</button>
    </div>
  );

  /* 開封可能 */
  if (isReady) return (
    <div style={{
      padding:'30px 22px', textAlign:'center', position:'relative',
      background:'linear-gradient(135deg, rgba(255,95,168,0.12) 0%, rgba(255,170,207,0.06) 100%)',
      border:'1px solid rgba(255,95,168,0.36)',
      borderRadius:'20px',
      backdropFilter:'blur(40px)',
      WebkitBackdropFilter:'blur(40px)',
      boxShadow:'0 0 40px rgba(255,95,168,0.18)',
      animation:'glowPulse 3s ease-in-out infinite',
    }}>
      <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(255,95,168,0.16)', border:'1.5px solid rgba(255,95,168,0.44)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
        <IconBox size={24} color="var(--accent)" strokeWidth={1.3} />
      </div>
      <p style={{ fontSize:'18px', fontWeight:700, color:'var(--t1)', marginBottom:'8px' }}>{capsule.title}</p>
      <p style={{ fontSize:'13px', color:'var(--accent)', letterSpacing:'0.05em', marginBottom:'26px', fontWeight:600 }}>開封日になりました</p>
      <button className="btn-primary" onClick={onOpen} style={{ maxWidth:'260px', padding:'15px 24px', fontSize:'15px' }}>
        カプセルを開封する
      </button>
      <button onClick={onDelete} style={{ position:'absolute', top:'14px', right:'14px', background:'none', border:'none', color:'var(--t4)', cursor:'pointer', padding:'4px', display:'flex', opacity:0.6 }}>
        <IconX size={14} />
      </button>
    </div>
  );

  /* ロック中 */
  return (
    <div className="glass-warm" style={{ padding:'22px', position:'relative' }}>
      {/* ヘッダー */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px' }}>
        <div style={{ width:44, height:44, borderRadius:'50%', border:'1.5px solid var(--bd2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, animation:'sealReveal 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div style={{ width:30, height:30, borderRadius:'50%', border:'1px solid var(--bd1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <IconLock size={13} color="var(--accent)" strokeWidth={1.6} />
          </div>
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:'16px', fontWeight:700, color:'var(--t1)' }}>{capsule.title}</p>
          <p style={{ fontSize:'10px', color:'var(--t4)', letterSpacing:'0.07em', marginTop:'2px' }}>
            {capsule.openDate.replace(/-/g,'/')} 開封予定
          </p>
        </div>
      </div>

      {/* カウントダウン */}
      <div style={{ textAlign:'center', padding:'16px 12px', background:'var(--s1)', borderRadius:'14px', marginBottom:'18px' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:'4px' }}>
          <span style={{ fontSize:'12px', fontWeight:600, color:'var(--t3)', letterSpacing:'0.07em' }}>あと</span>
          <span style={{ fontSize:'52px', fontWeight:700, color:'var(--accent)', letterSpacing:'-0.02em', lineHeight:1 }}>{until}</span>
          <span style={{ fontSize:'12px', fontWeight:600, color:'var(--t3)', letterSpacing:'0.07em' }}>日</span>
        </div>
        <p style={{ fontSize:'10px', color:'var(--t4)', letterSpacing:'0.06em', marginTop:'4px' }}>で開封できます</p>
      </div>

      {/* メッセージステータス */}
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {capsule.messages.map(m => (
          <div key={m.name}>
            {/* ステータス行 */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', background:'var(--s1)', borderRadius:'12px', border:'1px solid var(--bd1)' }}>
              <div style={{ width:9, height:9, borderRadius:'50%', flexShrink:0,
                background: m.isSealed ? 'var(--accent)' : 'transparent',
                border:`2px solid ${m.isSealed ? 'var(--accent)' : 'var(--bd2)'}`,
                boxShadow: m.isSealed ? '0 0 8px rgba(255,95,168,0.60)' : 'none',
              }} />
              <span style={{ flex:1, fontSize:'14px', fontWeight:600, color: m.isSealed ? 'var(--t1)' : 'var(--t3)' }}>{m.name}</span>
              {m.isSealed
                ? <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--accent)', background:'var(--accent-dim)', border:'1px solid var(--bd2)', padding:'4px 10px', borderRadius:'12px' }}>封印済み</span>
                : currentUserName && m.name !== currentUserName
                ? <span style={{ fontSize:'10px', color:'var(--t4)', letterSpacing:'0.06em' }}>待機中</span>
                : <button onClick={()=>setWritingFor(writingFor===m.name ? null : m.name)} style={{
                    padding:'6px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:700,
                    fontFamily:'inherit', cursor:'pointer', transition:'all 0.18s',
                    background: writingFor===m.name ? 'var(--accent)' : 'var(--s2)',
                    border:`1px solid ${writingFor===m.name ? 'transparent' : 'var(--bd2)'}`,
                    color: writingFor===m.name ? '#fff' : 'var(--t2)',
                    boxShadow: writingFor===m.name ? '0 2px 10px rgba(255,95,168,0.35)' : 'none',
                  }}>書く</button>
              }
            </div>

            {/* インライン入力フォーム */}
            {writingFor === m.name && (
              <div className="afi" style={{ marginTop:'8px', padding:'16px', background:'rgba(255,95,168,0.06)', borderRadius:'14px', border:'1px solid var(--bd1)', display:'flex', flexDirection:'column', gap:'12px' }}>
                <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--accent)' }}>
                  {m.name} のメッセージ
                </p>
                <textarea
                  className="inp"
                  placeholder="未来の私たちへ..."
                  value={writeTxt}
                  onChange={e=>setWriteTxt(e.target.value)}
                  rows={4}
                  style={{ padding:'13px 14px', resize:'none', lineHeight:1.68, fontSize:'14px' }}
                />
                <input ref={photoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{
                  const f=e.target.files?.[0]; if(!f) return;
                  const r=new FileReader(); r.onload=()=>setWritePhoto(r.result as string); r.readAsDataURL(f);
                }} />
                {writePhoto
                  ? <div style={{ position:'relative' }}>
                      <img src={writePhoto} alt="" style={{ width:'100%', borderRadius:'10px', maxHeight:'160px', objectFit:'cover' }} />
                      <button onClick={()=>setWritePhoto(null)} style={{ position:'absolute', top:'7px', right:'7px', background:'rgba(16,8,16,0.82)', border:'1px solid rgba(255,95,168,0.20)', borderRadius:'50%', width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--t1)' }}>
                        <IconX size={13} />
                      </button>
                    </div>
                  : <button onClick={()=>photoRef.current?.click()} className="btn-ghost" style={{ padding:'11px', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', borderStyle:'dashed' as const, fontSize:'12px' }}>
                      <IconCalendar size={14} /> 写真を追加（任意）
                    </button>
                }
                <div style={{ display:'flex', gap:'8px' }}>
                  <button className="btn-primary" onClick={handleSeal} style={{ flex:1, padding:'13px', fontSize:'13px', opacity:!writeTxt.trim()?0.5:1 }}>
                    保存して封印する
                  </button>
                  <button className="btn-ghost" onClick={()=>{setWritingFor(null);setWriteTxt('');setWritePhoto(null);}} style={{ padding:'13px 15px' }}>
                    <IconX size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={onDelete} style={{ position:'absolute', top:'14px', right:'14px', background:'none', border:'none', color:'var(--t4)', cursor:'pointer', padding:'4px', display:'flex', opacity:0.55 }}>
        <IconX size={14} />
      </button>
    </div>
  );
}
