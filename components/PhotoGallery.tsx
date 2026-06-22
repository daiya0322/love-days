'use client';
import { useRef, useState } from 'react';
import { Photo } from '@/lib/storage';
import { IconCamera, IconPlus, IconX, IconTrash } from './Icons';
interface Props { photos: Photo[]; onAdd: (p: Photo) => void; onDelete: (id: string) => void; }
export default function PhotoGallery({ photos, onAdd, onDelete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string|null>(null);
  const [viewing, setViewing] = useState<Photo|null>(null);
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }
  function handleAdd() {
    if (!preview) return;
    onAdd({ id: Date.now().toString(), dataUrl: preview, caption: caption.trim(), date: new Date().toISOString().slice(0,10) });
    setPreview(null); setCaption('');
    if (inputRef.current) inputRef.current.value = '';
  }
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <p style={{ fontSize:'10px', fontWeight:500, letterSpacing:'0.24em', textTransform:'uppercase', color:'var(--t3)' }}>Memories</p>
        {!preview && (
          <button onClick={() => inputRef.current?.click()} className="btn-ghost" style={{ padding:'8px 14px', display:'flex', alignItems:'center', gap:'6px', fontSize:'12px' }}>
            <IconPlus size={14} strokeWidth={1.8} /> 追加
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
      {preview && (
        <div className="glass-sm" style={{ padding:'16px', marginBottom:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
          <img src={preview} alt="" style={{ width:'100%', borderRadius:'10px', maxHeight:'220px', objectFit:'cover' }} />
          <input className="inp" placeholder="コメント（任意）" value={caption} onChange={e=>setCaption(e.target.value)} style={{ padding:'12px 14px', fontSize:'13px' }} />
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="btn-primary" onClick={handleAdd} style={{ flex:1, padding:'13px', fontSize:'13px' }}>保存</button>
            <button className="btn-ghost" onClick={() => setPreview(null)} style={{ padding:'13px 16px' }}>
              <IconX size={16} />
            </button>
          </div>
        </div>
      )}
      {photos.length === 0 && !preview ? (
        <button onClick={() => inputRef.current?.click()} className="glass" style={{
          width:'100%', padding:'40px 20px', cursor:'pointer', display:'flex', flexDirection:'column',
          alignItems:'center', gap:'12px', border:'1px dashed var(--bd2)', background:'transparent',
        }}>
          <IconCamera size={24} color="var(--t3)" strokeWidth={1.2} />
          <span style={{ fontSize:'13px', color:'var(--t3)', letterSpacing:'0.04em' }}>写真を追加する</span>
        </button>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
          {photos.map(p => (
            <div key={p.id} onClick={() => setViewing(p)} style={{ aspectRatio:'1', borderRadius:'10px', overflow:'hidden', cursor:'pointer' }}>
              <img src={p.dataUrl} alt={p.caption} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          ))}
        </div>
      )}
      {viewing && (
        <div onClick={() => setViewing(null)} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.94)', backdropFilter:'blur(20px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px' }}>
          <img src={viewing.dataUrl} alt="" style={{ maxWidth:'100%', maxHeight:'68vh', borderRadius:'14px', objectFit:'contain' }} onClick={e=>e.stopPropagation()} />
          {viewing.caption && <p style={{ color:'var(--t2)', marginTop:'16px', fontSize:'13px', textAlign:'center', letterSpacing:'0.02em' }}>{viewing.caption}</p>}
          <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
            <button className="btn-ghost" onClick={() => setViewing(null)} style={{ padding:'11px 20px', fontSize:'13px' }}>閉じる</button>
            <button className="btn-ghost" onClick={e => { e.stopPropagation(); onDelete(viewing.id); setViewing(null); }} style={{ padding:'11px 16px', borderColor:'rgba(239,68,68,0.3)', color:'rgba(239,68,68,0.7)' }}>
              <IconTrash size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
