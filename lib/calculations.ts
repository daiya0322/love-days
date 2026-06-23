// YYYY-MM-DD を日本時間のローカル深夜として解析する
// new Date("YYYY-MM-DD") は UTC 深夜になるため JST では -9h ズレが発生する
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d); // ローカル（JST）の深夜 0:00
}

// 付き合った日を「1日目」として通算日数を返す
export function getDaysTogether(startDate: string): number {
  const start = parseLocalDate(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

export interface Milestone {
  days:     number;
  label:    string;
  date:     Date;
  isPast:   boolean;
  daysLeft: number; // 未達成なら残り日数、達成済みなら 0
}

const MILESTONE_DAYS = [100, 200, 300, 365, 500, 1000];

// 365 の倍数のみ「○周年」、それ以外は「○日」
function milestoneLabel(days: number): string {
  if (days % 365 === 0) return `${days / 365}周年`;
  return `${days}日`;
}

export function getMilestones(startDate: string): Milestone[] {
  const start = parseLocalDate(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return MILESTONE_DAYS.map(days => {
    // 付き合った日 = 1日目なので、○日記念 = start + (days - 1) 日後
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + days - 1);
    const isPast   = date <= today;
    const msLeft   = date.getTime() - today.getTime();
    const daysLeft = isPast ? 0 : Math.ceil(msLeft / 86400000);
    return { days, label: milestoneLabel(days), date, isPast, daysLeft };
  });
}

export function getNextMilestone(startDate: string): { milestone: Milestone; daysLeft: number } | null {
  const next = getMilestones(startDate).find(m => !m.isPast);
  if (!next) return null;
  return { milestone: next, daysLeft: next.daysLeft };
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}
