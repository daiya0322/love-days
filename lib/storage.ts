export interface Photo {
  id: string;
  dataUrl: string;
  caption: string;
  date: string;
}

export interface Message {
  id: string;
  text: string;
  from: string;
  createdAt: string;
}

export interface CoupleData {
  partner1: string;
  partner2: string;
  startDate: string; // YYYY-MM-DD
  photos: Photo[];
  messages: Message[];
}

const KEY = 'love_days_data';

export function getData(): CoupleData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
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
