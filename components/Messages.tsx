'use client';
import { useState } from 'react';
import { Message } from '@/lib/storage';

interface Props { messages: Message[]; partner1: string; partner2: string; onAdd: (msg: Message) => void; onDelete: (id: string) => void; }

export default function Messages({ messages, partner1, partner2, onAdd, onDelete }: Props) {
  const [text, setText] = useState('');
  const [from, setFrom] = useState(partner1);
  const [open, setOpen] = useState(false);

  function handleAdd() {
    if (!text.trim()) return;
    onAdd({ id: Date.now().toString(), text: text.trim(), from, createdAt: new Date().toISOString() });
    setText('');
    setOpen(false);
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <h3 style={{ fontSize:'13px', fontWeight:700, letterSpacing:'0.12em', color:'var(--t3)', textTransform:'uppercase' }}>ラブレター 💌</h3>
        <button onClick={() => setOpen(!open)} className="btn-rose" style={{ padding:'7px 14px', fontSize:'12px' }}>+ 書く</button>
      </div>

      {open && (
        <div className="card" style={{ padding:'16px', marginBottom:'12px', display:'flex', flexDirection:'column', gap:'12px', animation:'fadeUp 0.3s ease both' }}>
          <div style={{ display:'flex', gap:'8px' }}>
            {[partner1, partner2].map(p => (
              <button key={p} onClick={() => setFrom(p)} style={{
                flex:1, padding:'9px', borderRadius:'10px', border:'1px solid', cursor:'pointer', fontSize:'13px', fontWeight:600, transition:'all 0.2s',
                background: from === p ? 'linear-gradient(135deg,#FF6B9D,#FF9A8B)' : 'rgba(255,255,255,0.05)',
                borderColor: from === p ? 'transparent' : 'var(--card-bd)',
                color: from === p ? 'white' : 'var(--t2)',
              }}>{p} より</button>
            ))}
          </div>
          <textarea className="inp" placeholder="気持ちを書いてね... 💕" value={text} onChange={e => setText(e.target.value)} rows={4} style={{ padding:'12px 14px', fontSize:'14px', resize:'none', lineHeight:1.6 }} />
          <button className="btn-rose" onClick={handleAdd} style={{ padding:'12px', fontSize:'14px' }}>送る 💌</button>
        </div>
      )}

      {messages.length === 0 && !open && (
        <div className="card" style={{ padding:'24px', textAlign:'center', color:'var(--t3)', fontSize:'13px' }}>
          最初のラブレターを書いてみよう 💌
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {[...messages].reverse().map(m => (
          <div key={m.id} className="card" style={{ padding:'16px', position:'relative', animation:'fadeUp 0.4s ease both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
              <span style={{ fontSize:'20px' }}>💌</span>
              <span style={{ fontSize:'12px', fontWeight:700, color:'var(--rose)' }}>{m.from} より</span>
              <span style={{ fontSize:'11px', color:'var(--t3)', marginLeft:'auto' }}>{new Date(m.createdAt).toLocaleDateString('ja-JP')}</span>
            </div>
            <p style={{ fontSize:'14px', color:'var(--t2)', lineHeight:1.7, whiteSpace:'pre-wrap', margin:0 }}>{m.text}</p>
            <button onClick={() => onDelete(m.id)} style={{ position:'absolute', top:'12px', right:'12px', background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:'16px', lineHeight:1 }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
