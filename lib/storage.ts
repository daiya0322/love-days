export interface Photo {
  id: string;
  url: string;
  storagePath: string;
  caption: string;
  date: string;
  createdAt: string;
}

export interface Message {
  id: string;
  text: string;
  from: string;
  createdAt: string;
}

export interface CapsuleMessage {
  name: string;
  text: string;
  photoDataUrl?: string;
  isSealed: boolean;
  sealedAt?: string;
}

export interface TimeCapsule {
  id: string;
  title: string;
  openDate: string; // YYYY-MM-DD
  messages: CapsuleMessage[]; // [partner1, partner2]
  isOpened: boolean;
  createdAt: string;
}

export interface CoupleData {
  partner1: string;
  partner2: string;
  startDate: string; // YYYY-MM-DD
  photos: Photo[];
  messages: Message[];
  capsules: TimeCapsule[];
}

const KEY = 'love_days_data';

export function getData(): CoupleData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as CoupleData;
    if (!d.capsules) d.capsules = [];
    // migrate old capsule format (message1/message2 → messages array)
    d.capsules = d.capsules.map(c => {
      if (!c.messages) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const old = c as any;
        return {
          ...c,
          messages: [
            { name: d.partner1, text: old.message1 ?? '', isSealed: !!(old.message1) },
            { name: d.partner2, text: old.message2 ?? '', isSealed: !!(old.message2) },
          ],
        };
      }
      return c;
    });
    return d;
  } catch { return null; }
}

export function saveData(data: CoupleData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
