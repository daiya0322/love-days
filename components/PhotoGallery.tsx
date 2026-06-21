'use client';
import { useRef, useState } from 'react';
import { Photo } from '@/lib/storage';

interface Props { photos: Photo[]; onAdd: (photo: Photo) => void; onDelete: (id: string) => void; }

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
    setPreview(null); setCaption(''); if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <h3 style={{ fontSize:'13px', fontWeight:700, letterSpacing:'0.12em', color:'var(--t3)', textTransform:'uppercase', marginBottom:'14px' }}>2人の思い出 📷</h3>

      {/* 追加ボタン */}
      {!preview && (
        <button onClick={() => inputRef.current?.click()} className="card" style={{
          width:'100%', padding:'18px', cursor:'pointer', border:'1px dashed rgba(255,107,157,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
          fontSize:'13px', color:'var(--rose)', fontWeight:600, background:'rgba(255,107,157,0.04)',
        }}>
          <span style={{ fontSize:'20px' }}>📸</span> 写真を追加する
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />

      {/* プレビュー */}
      {preview && (
        <div className="card" style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
          <img src={preview} alt="preview" style={{ width:'100%', borderRadius:'12px', maxHeight:'200px', objectFit:'cover' }} />
          <input className="inp" placeholder="コメントを追加..." value={caption} onChange={e=>setCaption(e.target.value)} style={{ padding:'11px 14px', fontSize:'13px' }} />
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="btn-rose" onClick={handleAdd} style={{ flex:1, padding:'11px', fontSize:'13px' }}>保存する 💕</button>
            <button onClick={() => setPreview(null)} style={{ padding:'11px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid var(--card-bd)', borderRadius:'12px', color:'var(--t2)', cursor:'pointer', fontSize:'13px' }}>キャンセル</button>
          </div>
        </div>
      )}

      {/* グリッド */}
      {photos.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px', marginTop:'12px' }}>
          {photos.map(p => (
            <div key={p.id} onClick={() => setViewing(p)} style={{ aspectRatio:'1', borderRadius:'12px', overflow:'hidden', cursor:'pointer', position:'relative' }}>
              <img src={p.dataUrl} alt={p.caption} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.2s' }} />
            </div>
          ))}
        </div>
      )}

      {/* ビューワー */}
      {viewing && (
        <div onClick={() => setViewing(null)} style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.92)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <img src={viewing.dataUrl} alt={viewing.caption} style={{ maxWidth:'100%', maxHeight:'70vh', borderRadius:'16px', objectFit:'contain' }} onClick={e => e.stopPropagation()} />
          {viewing.caption && <p style={{ color:'var(--t2)', marginTop:'16px', fontSize:'14px', textAlign:'center' }}>{viewing.caption}</p>}
          <div style={{ display:'flex', gap:'12px', marginTop:'16px' }}>
            <button onClick={e => { e.stopPropagation(); setViewing(null); }} style={{ padding:'10px 20px', background:'rgba(255,255,255,0.1)', border:'1px solid var(--card-bd)', borderRadius:'10px', color:'var(--t1)', cursor:'pointer' }}>閉じる</button>
            <button onClick={e => { e.stopPropagation(); onDelete(viewing.id); setViewing(null); }} style={{ padding:'10px 20px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', color:'#ef4444', cursor:'pointer' }}>削除</button>
          </div>
        </div>
      )}
    </div>
  );
}
