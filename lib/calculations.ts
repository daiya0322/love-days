export function getDaysTogether(startDate: string): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

export interface Milestone {
  days: number;
  label: string;
  date: Date;
  isPast: boolean;
}

const MILESTONES = [100, 200, 365, 500, 1000, 1500, 2000, 3650];

export function getMilestones(startDate: string): Milestone[] {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return MILESTONES.map(days => {
    const date = new Date(start);
    date.setDate(date.getDate() + days - 1);
    const isPast = date <= today;
    const label = days >= 365
      ? `${Math.round(days / 365)}周年`
      : `${days}日`;
    return { days, label, date, isPast };
  });
}

export function getNextMilestone(startDate: string): { milestone: Milestone; daysLeft: number } | null {
  const milestones = getMilestones(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = milestones.find(m => !m.isPast && m.date > today);
  if (!next) return null;
  const daysLeft = Math.ceil((next.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { milestone: next, daysLeft };
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')}`;
}
