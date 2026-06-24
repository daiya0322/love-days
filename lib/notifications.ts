// ── 型定義 ──────────────────────────────────────────────────
export interface NotificationSettings {
  enabled:             boolean;
  anniversaryEnabled:  boolean;
  eventEnabled:        boolean;
  capsuleEnabled:      boolean;
  timingDays:          0 | 1 | 3 | 7; // 当日=0, 前日=1, 3日前=3, 1週間前=7
  notifyTime:          string;          // "HH:MM"
}

const SETTINGS_KEY   = 'love_days_notification_settings';
const SENT_KEY_PREFIX = 'love_days_notif_sent_';

const DEFAULTS: NotificationSettings = {
  enabled:            false,
  anniversaryEnabled: true,
  eventEnabled:       true,
  capsuleEnabled:     true,
  timingDays:         0,
  notifyTime:         '09:00',
};

// ── 設定の読み書き ────────────────────────────────────────────
export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return DEFAULTS; }
}

export function saveNotificationSettings(s: NotificationSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ── 許可系 ───────────────────────────────────────────────────
export function getPermissionState(): 'unsupported' | 'default' | 'granted' | 'denied' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied')  return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

// ── 送信済み管理 ──────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function alreadySent(key: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  const stored = JSON.parse(localStorage.getItem(SENT_KEY_PREFIX + todayStr()) ?? '[]') as string[];
  return stored.includes(key);
}

function markSent(key: string): void {
  if (typeof localStorage === 'undefined') return;
  const sentKey = SENT_KEY_PREFIX + todayStr();
  const stored  = JSON.parse(localStorage.getItem(sentKey) ?? '[]') as string[];
  if (!stored.includes(key)) localStorage.setItem(sentKey, JSON.stringify([...stored, key]));
  // 古い日付のキーを削除
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith(SENT_KEY_PREFIX) && k !== sentKey) localStorage.removeItem(k);
  }
}

// ── 通知送信 ─────────────────────────────────────────────────
async function fire(title: string, body: string): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon:  '/icon-192.png',
          badge: '/icon-192.png',
          tag:   title,
        });
        return;
      }
    }
    new Notification(title, { body, icon: '/icon-192.png' });
  } catch { /* ブラウザが対応していない場合は無視 */ }
}

// ── マイルストーン日付計算 ────────────────────────────────────
function milestoneDate(startDate: string, days: number): Date {
  const [y, m, d] = startDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days - 1); // 付き合った日を1日目とする
  return dt;
}

function diffDays(a: Date, b: Date): number {
  const aMs = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bMs = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((aMs - bMs) / 86400000);
}

// ── メイン: 通知チェック ──────────────────────────────────────
const MILESTONES = [100, 200, 300, 365, 500, 1000];

export async function checkNotifications(params: {
  settings:  NotificationSettings;
  startDate: string;
  events:    Array<{ id: string; title: string; date: string }>;
  capsules:  Array<{ id: string; title: string; openDate: string; isOpened: boolean }>;
}): Promise<void> {
  const { settings, startDate, events, capsules } = params;

  if (!settings.enabled)                                      return;
  if (!('Notification' in window))                            return;
  if (Notification.permission !== 'granted')                  return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 通知時刻を過ぎているかチェック
  const [hh, mm] = settings.notifyTime.split(':').map(Number);
  const notifyAt = new Date();
  notifyAt.setHours(hh, mm, 0, 0);
  if (new Date() < notifyAt) return;

  // ── 記念日通知 ──
  if (settings.anniversaryEnabled) {
    for (const ms of MILESTONES) {
      const mDate = milestoneDate(startDate, ms);
      const targetDate = new Date(mDate);
      targetDate.setDate(targetDate.getDate() - settings.timingDays);

      if (diffDays(targetDate, today) === 0) {
        const key = `anniversary_${ms}_${settings.timingDays}`;
        if (!alreadySent(key)) {
          const title = settings.timingDays === 0
            ? `${ms}日記念日です`
            : settings.timingDays === 1
              ? `明日、${ms}日記念日を迎えます`
              : `${settings.timingDays}日後に、${ms}日記念日を迎えます`;
          await fire(title, '今日は2人の大切な記念日です。');
          markSent(key);
        }
      }
    }
  }

  // ── カレンダー予定通知 ──
  if (settings.eventEnabled) {
    for (const ev of events) {
      const evDate = new Date(ev.date.replace(/-/g, '/'));
      evDate.setHours(0, 0, 0, 0);
      const targetDate = new Date(evDate);
      targetDate.setDate(targetDate.getDate() - settings.timingDays);

      if (diffDays(targetDate, today) === 0) {
        const key = `event_${ev.id}`;
        if (!alreadySent(key)) {
          const title = settings.timingDays === 0
            ? `今日は「${ev.title}」の日です`
            : settings.timingDays === 1
              ? `明日は「${ev.title}」があります`
              : `${settings.timingDays}日後に「${ev.title}」があります`;
          await fire(title, '予定を確認しましょう。');
          markSent(key);
        }
      }
    }
  }

  // ── タイムカプセル通知（当日・前日は常にチェック） ──
  if (settings.capsuleEnabled) {
    for (const cap of capsules) {
      if (cap.isOpened) continue;
      const openDate = new Date(cap.openDate.replace(/-/g, '/'));
      openDate.setHours(0, 0, 0, 0);
      const diff = diffDays(openDate, today);

      if (diff === 0) {
        const key = `capsule_open_${cap.id}`;
        if (!alreadySent(key)) {
          await fire('タイムカプセルを開封できます', '2人のメッセージを確認しましょう。');
          markSent(key);
        }
      } else if (diff === 1) {
        const key = `capsule_tomorrow_${cap.id}`;
        if (!alreadySent(key)) {
          await fire('明日、タイムカプセルの開封日です', '2人へのメッセージが届きます。');
          markSent(key);
        }
      }
    }
  }
}
