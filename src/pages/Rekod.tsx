// #/rekod and #/cabaran before the program opens (mockup rekod.html).
import { Layout } from '../ui/Layout';
import { Card, HealthNote } from '../ui/Card';
import { Button } from '../ui/Button';
import { useSession } from '../state/session';
import { daysUntil, formatDMY, todayMYT } from '../lib/dates';
import type { RouteName } from '../router';

const CHIPS: [string, string][] = [
  ['ph-scales', 'Berat'], ['ph-egg', 'Protein'], ['ph-drop', 'Air'], ['ph-timer', 'Puasa/IF'], ['ph-barbell', 'Senaman'], ['ph-moon', 'Tidur'],
];

export function Rekod({ route }: { route: RouteName }) {
  const s = useSession();
  const start = s.batch?.program_start ?? '2026-12-10';
  const left = Math.max(0, daysUntil(start, todayMYT()));
  return (
    <Layout route={route}>
      <section class="hero">
        <i class="ph-fill ph-calendar-check moon" aria-hidden="true" />
        <span class="pill-t"><i class="ph-fill ph-lock-key" aria-hidden="true" /> Akan dibuka</span>
        <h1 style="font-size:22px;margin:14px 0 6px">Rekod harian &amp; Cabaran #1 dibuka {formatDMY(start)}</h1>
        <div class="glass" style="padding:12px;text-align:center">
          <span class="num" style="font-size:28px;color:var(--yellow)">{left}</span> <span style="font-weight:700">hari lagi</span>
        </div>
      </section>
      <Card style="margin-top:12px">
        <h3 style="font-size:16px">Apa yang akan anda rekod</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
          {CHIPS.map(([ic, t]) => <span key={t} class="chip"><i class={`ph ${ic}`} aria-hidden="true" /> {t}</span>)}
        </div>
      </Card>
      {!s.profile?.onboarded_at ? (
        <Button href="#/onboarding" variant="outline" block style="margin-top:16px">Lengkapkan data permulaan</Button>
      ) : null}
      <HealthNote />
    </Layout>
  );
}
