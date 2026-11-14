// Pure helpers for the home screen (unit-tested).
import type { BatchDates } from './dates';

const DAY = 86_400_000;

/** Program day starts at 00:00 Asia/Kuala_Lumpur (UTC+8). */
export function startInstant(dateIso: string): number {
  return Date.parse(dateIso + 'T00:00:00+08:00');
}

export function countdownParts(targetMs: number, nowMs: number) {
  const left = Math.max(0, targetMs - nowMs);
  const sec = Math.floor(left / 1000);
  return {
    days: Math.floor(left / DAY),
    hours: Math.floor((sec % 86_400) / 3600),
    minutes: Math.floor((sec % 3600) / 60),
    seconds: sec % 60,
    done: left === 0,
  };
}

/** Whole days left until the program starts (00:00 MYT): the same number the countdown grid shows. */
export function daysLeft(startIso: string, nowMs: number): number {
  return countdownParts(startInstant(startIso), nowMs).days;
}

type Pkg = { id: string; name: string; items: string[] };

export function packageLabel(ent: Set<string>, packages: Pkg[]): { id: string; label: string } {
  const holds = (id: string) => {
    const p = packages.find((x) => x.id === id);
    return !!p && p.items.length > 0 && p.items.every((k) => ent.has(k));
  };
  if (holds('complete')) return { id: 'complete', label: 'HDM BOOSTER COMPLETE' };
  if (holds('basic')) return { id: 'basic', label: 'HDM BOOSTER BASIC' };
  if (ent.size > 0) return { id: 'separa', label: 'Akses separa' };
  return { id: 'tiada', label: 'Tiada pakej aktif' };
}

export function ebookStats(ebooks: { item_key: string }[], ent: Set<string>) {
  const open = ebooks.filter((e) => ent.has(e.item_key)).length;
  return { open, total: ebooks.length, locked: ebooks.length - open };
}

export function firstName(full: string | null | undefined): string {
  return String(full ?? '').trim().split(/\s+/)[0] ?? '';
}

export function initials(full: string | null | undefined): string {
  const f = firstName(full);
  return f ? f.slice(0, 2).toUpperCase() : '?';
}

/** Index of the phase to highlight (last highlighted bar): first before the program, last after it. */
export function phaseIndex(phases: BatchDates['phases'], today: string): number {
  if (!phases.length) return -1;
  let idx = 0;
  phases.forEach((p, i) => {
    if (p.start <= today) idx = i;
  });
  return idx;
}
