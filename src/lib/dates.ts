export type BatchDates = {
  programStart: string;
  programEnd: string;
  phases: { key: 'rejab' | 'syaaban' | 'ramadan'; start: string; end: string }[];
};

const MYT_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** ISO date (YYYY-MM-DD) in Asia/Kuala_Lumpur (UTC+8, no DST). */
export function todayMYT(now: Date = new Date()): string {
  return new Date(now.getTime() + MYT_OFFSET_MS).toISOString().slice(0, 10);
}

function dayNum(iso: string): number {
  return Math.round(Date.parse(iso + 'T00:00:00Z') / DAY_MS);
}

export function daysUntil(dateIso: string, today: string): number {
  return dayNum(dateIso) - dayNum(today);
}

export function programWeek(b: BatchDates, today: string): { week: number; total: number } | null {
  const since = dayNum(today) - dayNum(b.programStart);
  if (since < 0) return null;
  const total = Math.ceil((dayNum(b.programEnd) - dayNum(b.programStart)) / 7);
  const week = Math.min(Math.floor(since / 7) + 1, total);
  return { week, total };
}

export function currentPhase(b: BatchDates, today: string): BatchDates['phases'][number] | null {
  return b.phases.find((p) => p.start <= today && today <= p.end) ?? null;
}

export function formatDMY(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
