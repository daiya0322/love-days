'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EventRow, EventInput } from '@/lib/supabase';
import { getMilestones, Milestone } from '@/lib/calculations';
import { IconPlus, IconX, IconTrash } from './Icons';

const CATEGORIES = [
  { id: 'デート', color: '#FF1A6E', bg: 'rgba(255,26,110,0.18)' },
  { id: '旅行',   color: '#60A5FA', bg: 'rgba(96,165,250,0.18)' },
  { id: '記念日', color: '#FBB724', bg: 'rgba(251,183,36,0.18)' },
  { id: 'その他', color: '#9CA3AF', bg: 'rgba(156,163,175,0.18)' },
];

const LBL: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'var(--t3)', display: 'block', marginBottom: '8px',
};

function catStyle(category: string) {
  return CATEGORIES.find(c => c.id === category) ?? CATEGORIES[3];
}

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const grid: (Date | null)[] = Array(first.getDay()).fill(null);
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDay; d++) grid.push(new Date(year, month, d));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

interface Props {
  events: EventRow[];
  startDate: string;
  onAdd: (data: EventInput) => Promise<void>;
  onUpdate: (id: string, data: EventInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function CalendarView({ events, startDate, onAdd, onUpdate, onDelete }: Props) {
  const todayFull = new Date();
  const today = new Date(todayFull.getFullYear(), todayFull.getMonth(), todayFull.getDate());

  const [viewYear,    setViewYear]    = useState(today.getFullYear());
  const [viewMonth,   setViewMonth]   = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(today);

  const [showForm,      setShowForm]      = useState(false);
  const [editingEvent,  setEditingEvent]  = useState<EventRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isMounted,     setIsMounted]     = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const [fTitle,    setFTitle]    = useState('');
  const [fDate,     setFDate]     = useState('');
  const [fTime,     setFTime]     = useState('');
  const [fLocation, setFLocation] = useState('');
  const [fMemo,     setFMemo]     = useState('');
  const [fCat,      setFCat]      = useState('デート');
  const [saving,    setSaving]    = useState(false);

  const milestones = getMilestones(startDate);
  const grid = buildGrid(viewYear, viewMonth);
  const DOW = ['日', '月', '火', '水', '木', '金', '土'];

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  }

  function eventsOnDay(date: Date): EventRow[] {
    const ds = toDateStr(date);
    return events
      .filter(e => e.date === ds)
      .sort((a, b) => (a.time_of_day ?? '').localeCompare(b.time_of_day ?? ''));
  }

  function milestonesOnDay(date: Date): Milestone[] {
    return milestones.filter(m => isSameDay(m.date, date));
  }

  function openAdd() {
    const date = selectedDay ? toDateStr(selectedDay) : toDateStr(today);
    setFTitle(''); setFDate(date); setFTime('');
    setFLocation(''); setFMemo(''); setFCat('デート');
    setEditingEvent(null);
    setShowForm(true);
  }

  function openEdit(ev: EventRow) {
    setFTitle(ev.title);
    setFDate(ev.date);
    setFTime(ev.time_of_day ?? '');
    setFLocation(ev.location ?? '');
    setFMemo(ev.memo ?? '');
    setFCat(ev.category);
    setEditingEvent(ev);
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!fTitle.trim() || !fDate) return;
    setSaving(true);
    try {
      const data: EventInput = {
        title: fTitle.trim(),
        date: fDate,
        time_of_day: fTime || null,
        location: fLocation.trim() || null,
        memo: fMemo.trim() || null,
        category: fCat,
      };
      if (editingEvent) await onUpdate(editingEvent.id, data);
      else await onAdd(data);
      const [y, m, d] = fDate.split('-').map(Number);
      const newSelected = new Date(y, m - 1, d);
      setViewYear(newSelected.getFullYear());
      setViewMonth(newSelected.getMonth());
      setSelectedDay(newSelected);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  const selEvents     = selectedDay ? eventsOnDay(selectedDay) : [];
  const selMilestones = selectedDay ? milestonesOnDay(selectedDay) : [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--t3)' }}>Calendar</p>
        <button onClick={openAdd} className="btn-ghost" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          <IconPlus size={14} strokeWidth={1.8} />
          追加
        </button>
      </div>

      {/* Month grid */}
      <div className="glass-sm" style={{ padding: '16px 14px 20px', marginBottom: '10px' }}>

        {/* Month navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <button
            onClick={prevMonth}
            style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: '8px 12px', borderRadius: '10px', fontSize: '16px', lineHeight: 1, fontFamily: 'inherit' }}
          >
            {'<'}
          </button>
          <span style={{ fontFamily: 'var(--font-display, -apple-system)', fontSize: '15px', fontWeight: 700, color: 'var(--t1)', letterSpacing: '0.04em' }}>
            {viewYear}年 {viewMonth + 1}月
          </span>
          <button
            onClick={nextMonth}
            style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: '8px 12px', borderRadius: '10px', fontSize: '16px', lineHeight: 1, fontFamily: 'inherit' }}
          >
            {'>'}
          </button>
        </div>

        {/* Day of week header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: '2px' }}>
          {DOW.map((d, i) => (
            <div
              key={d}
              style={{
                textAlign: 'center', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', padding: '3px 0',
                color: i === 0 ? 'rgba(255,110,110,0.65)' : i === 6 ? 'rgba(96,165,250,0.65)' : 'var(--t4)',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
          {grid.map((date, i) => {
            if (!date) return <div key={i} />;
            const isToday    = isSameDay(date, today);
            const isSelected = selectedDay ? isSameDay(date, selectedDay) : false;
            const dayEvents  = eventsOnDay(date);
            const dayMiles   = milestonesOnDay(date);
            const dow        = date.getDay();

            return (
              <div
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : date)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '6px 2px 5px', borderRadius: '10px', cursor: 'pointer',
                  background: isSelected
                    ? 'var(--accent)'
                    : isToday
                      ? 'rgba(255,26,110,0.13)'
                      : 'transparent',
                  border: isToday && !isSelected
                    ? '1px solid rgba(255,26,110,0.32)'
                    : '1px solid transparent',
                  transition: 'background 0.14s',
                }}
              >
                <span style={{
                  fontSize: '13px', lineHeight: 1.2,
                  fontWeight: isToday || isSelected ? 700 : 400,
                  color: isSelected
                    ? '#fff'
                    : isToday
                      ? 'var(--accent)'
                      : dow === 0
                        ? 'rgba(255,110,110,0.80)'
                        : dow === 6
                          ? 'rgba(96,165,250,0.80)'
                          : 'var(--t2)',
                }}>
                  {date.getDate()}
                </span>
                {(dayEvents.length > 0 || dayMiles.length > 0) && (
                  <div style={{ display: 'flex', gap: '2px', marginTop: '4px', justifyContent: 'center' }}>
                    {dayMiles.slice(0, 1).map((_, j) => (
                      <div
                        key={`m${j}`}
                        style={{ width: '4px', height: '4px', borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.75)' : '#FBB724', flexShrink: 0 }}
                      />
                    ))}
                    {dayEvents.slice(0, 2).map((ev, j) => (
                      <div
                        key={`e${j}`}
                        style={{ width: '4px', height: '4px', borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.75)' : catStyle(ev.category).color, flexShrink: 0 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day details */}
      {selectedDay && (selEvents.length > 0 || selMilestones.length > 0) && (
        <div className="afi">
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--t4)', padding: '4px 4px 10px' }}>
            {viewMonth + 1}/{selectedDay.getDate()}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {selMilestones.map(m => (
              <div key={m.days} className="glass-sm" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#FBB724', background: 'rgba(251,183,36,0.14)', padding: '4px 10px', borderRadius: '20px', flexShrink: 0 }}>
                  記念日
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t1)', flex: 1 }}>{m.label}</span>
              </div>
            ))}

            {selEvents.map(ev => {
              const cs = catStyle(ev.category);
              return (
                <div key={ev.id} className="glass-sm" style={{ padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: cs.color, background: cs.bg, padding: '4px 10px', borderRadius: '20px', flexShrink: 0, marginTop: '1px' }}>
                    {ev.category}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t1)' }}>{ev.title}</p>
                    {ev.time_of_day && (
                      <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '3px' }}>{ev.time_of_day.slice(0, 5)}</p>
                    )}
                    {ev.location && (
                      <p style={{ fontSize: '11px', color: 'var(--t4)', marginTop: '2px' }}>{ev.location}</p>
                    )}
                    {ev.memo && (
                      <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '5px', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{ev.memo}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => openEdit(ev)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: '11px' }}>
                      編集
                    </button>
                    <button
                      onClick={() => setConfirmDelete(ev.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--t4)', cursor: 'pointer', padding: '6px', display: 'flex', opacity: 0.7 }}
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedDay && selEvents.length === 0 && selMilestones.length === 0 && (
        <div className="afi" style={{ textAlign: 'center', padding: '20px 0', color: 'var(--t4)', fontSize: '13px' }}>
          この日の予定はありません
          <button
            onClick={openAdd}
            style={{ display: 'block', margin: '10px auto 0', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }}
          >
            + 追加する
          </button>
        </div>
      )}

      {/* Add / Edit form modal — createPortal で document.body 直下に描画しスタッキングコンテキスト問題を回避 */}
      {isMounted && showForm && createPortal(
        <div
          onClick={() => setShowForm(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(14,5,16,0.90)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass-warm"
            style={{ width: '100%', maxWidth: '480px', borderRadius: '24px 24px 0 0', padding: '24px 24px', paddingBottom: 'max(44px, calc(24px + env(safe-area-inset-bottom)))', maxHeight: '88vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>
                {editingEvent ? '予定を編集' : '予定を追加'}
              </p>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '4px', display: 'flex' }}
              >
                <IconX size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Category */}
              <div>
                <label style={LBL}>カテゴリ</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setFCat(c.id)}
                      style={{
                        padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                        fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.18s', border: '1px solid',
                        background: fCat === c.id ? c.bg : 'transparent',
                        borderColor: fCat === c.id ? c.color : 'var(--bd2)',
                        color: fCat === c.id ? c.color : 'var(--t4)',
                      }}
                    >
                      {c.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={LBL}>予定名</label>
                <input
                  className="inp"
                  placeholder="映画デート"
                  value={fTitle}
                  onChange={e => setFTitle(e.target.value)}
                  style={{ padding: '13px 15px' }}
                />
              </div>

              {/* Date / Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={LBL}>日付</label>
                  <input
                    type="date"
                    className="inp"
                    value={fDate}
                    onChange={e => setFDate(e.target.value)}
                    style={{ padding: '13px 15px', colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label style={LBL}>時間（任意）</label>
                  <input
                    type="time"
                    className="inp"
                    value={fTime}
                    onChange={e => setFTime(e.target.value)}
                    style={{ padding: '13px 15px', colorScheme: 'dark' }}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label style={LBL}>場所（任意）</label>
                <input
                  className="inp"
                  placeholder="渋谷カフェ"
                  value={fLocation}
                  onChange={e => setFLocation(e.target.value)}
                  style={{ padding: '13px 15px' }}
                />
              </div>

              {/* Memo */}
              <div>
                <label style={LBL}>メモ（任意）</label>
                <textarea
                  className="inp"
                  placeholder="..."
                  value={fMemo}
                  onChange={e => setFMemo(e.target.value)}
                  rows={3}
                  style={{ padding: '13px 15px', resize: 'none', lineHeight: 1.6 }}
                />
              </div>

              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={saving || !fTitle.trim() || !fDate}
                style={{ marginTop: '4px', opacity: saving || !fTitle.trim() || !fDate ? 0.5 : 1 }}
              >
                {saving ? '保存中...' : editingEvent ? '更新する' : '追加する'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete confirm — 同じくportalで描画 */}
      {isMounted && confirmDelete && createPortal(
        <div
          onClick={() => setConfirmDelete(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9100, background: 'rgba(14,5,16,0.90)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass-warm asi"
            style={{ padding: '32px 24px', maxWidth: '320px', width: '100%', textAlign: 'center' }}
          >
            <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px' }}>この予定を削除しますか？</p>
            <p style={{ fontSize: '13px', color: 'var(--t3)', marginBottom: '28px' }}>削除すると元に戻せません。</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '14px' }}>
                キャンセル
              </button>
              <button
                onClick={async () => { await onDelete(confirmDelete); setConfirmDelete(null); }}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, background: 'linear-gradient(135deg,#8B0026,#D0003C)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                削除する
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
