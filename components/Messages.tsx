'use client';
import { useState } from 'react';
import { Message } from '@/lib/storage';
import { IconMail, IconPlus, IconX } from './Icons';
interface Props { messages: Message[]; partner1: string; partner2: string; onAdd: (m: Message) => void; onDelete: (id: string) => void; }
export default function Messages({ messages, partner1, partner2, onAdd, onDelete }: Props) {
  const [text, setText] = useState('');
  const [from, setFrom] = useState(partner1);
  const [open, setOpen] = useState(false);
  function handleAdd() {
    if (!text.trim()) return;
    onAdd({ id: Date.now().toString(), text: text.trim(), from, createdAt: new Date().toISOString() });
    setText(''); setOpen(false);
  }
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <p style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.24em', textTransform:'uppercase', color:'var(--t3)' }}>Letters</p>
        <button onClick={() => setOpen(!open)} className="btn-ghost" style={{ padding:'8px 14px', display:'flex', alignItems:'center', gap:'6px', fontSize:'12px' }}>
          <IconPlus size={14} strokeWidth={1.8} /> 書く
        </button>
      </div>
      {open && (
        <div className="glass-sm" style={{ padding:'18px', marginBottom:'14px', display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ display:'flex', gap:'6px' }}>
            {[partner1, partner2].map(p => (
              <button key={p} onClick={() => setFrom(p)} style={{
                flex:1, padding:'11px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:700,
                fontFamily:'inherit', letterSpacing:'0.02em', transition:'all 0.18s',
                background: from===p ? 'var(--accent)' : 'var(--s1)',
                border:`1px solid ${from===p ? 'transparent' : 'var(--bd1)'}`,
                color: from===p ? '#fff' : 'var(--t3)',
                boxShadow: from===p ? '0 2px 12px rgba(255,95,168,0.35)' : 'none',
              }}>{p}</button>
            ))}
          </div>
          <textarea className="inp" placeholder="気持ちを言葉にしてみて" value={text} onChange={e=>setText(e.target.value)} rows={5} style={{ padding:'14px', fontSize:'14px', resize:'none', lineHeight:1.65 }} />
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="btn-primary" onClick={handleAdd} style={{ flex:1, padding:'13px', fontSize:'13px' }}>送る</button>
            <button className="btn-ghost" onClick={() => setOpen(false)} style={{ padding:'13px 14px' }}><IconX size={16} /></button>
          </div>
        </div>
      )}
      {messages.length === 0 && !open && (
        <div className="glass" style={{ padding:'52px 20px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
          <IconMail size={28} color="var(--t3)" strokeWidth={1.2} />
          <p style={{ fontSize:'14px', fontWeight:500, color:'var(--t3)', letterSpacing:'0.03em' }}>最初の手紙を書いてみよう</p>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {[...messages].reverse().map(m => (
          <div key={m.id} className="glass-sm" style={{ padding:'18px', position:'relative' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <IconMail size={12} color="var(--accent)" strokeWidth={1.4} />
              </div>
              <span style={{ fontSize:'13px', fontWeight:700, color:'var(--accent)', letterSpacing:'0.03em' }}>{m.from}</span>
              <span style={{ fontSize:'11px', fontWeight:500, color:'var(--t4)', marginLeft:'auto' }}>
                {new Date(m.createdAt).toLocaleDateString('ja-JP', { month:'long', day:'numeric' })}
              </span>
            </div>
            <p style={{ fontSize:'14px', color:'var(--t2)', lineHeight:1.72, whiteSpace:'pre-wrap' }}>{m.text}</p>
            <button onClick={() => onDelete(m.id)} style={{ position:'absolute', top:'14px', right:'14px', background:'none', border:'none', color:'var(--t4)', cursor:'pointer', padding:'4px', display:'flex' }}>
              <IconX size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
