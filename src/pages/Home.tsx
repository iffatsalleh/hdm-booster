import { useEffect, useState } from 'preact/hooks';
import { Layout } from '../ui/Layout';
import { Card, HealthNote } from '../ui/Card';
import { Button } from '../ui/Button';
import { LockBadge } from '../ui/LockBadge';
import { setting, useSession, type Batch } from '../state/session';
import { countdownParts, ebookStats, firstName, packageLabel, phaseIndex, startInstant } from '../lib/home';
import { formatDMY, programWeek, todayMYT, daysUntil } from '../lib/dates';
import { fillTemplate, waLink } from '../lib/wa';
import { DEFAULT_SUPPORT_WA } from '../lib/config';

const PHASE_LABEL: Record<string, string> = { rejab: 'Rejab', syaaban: 'Syaaban', ramadan: 'Ramadan' };
const pad = (n: number) => String(n).padStart(2, '0');

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

function Countdown({ batch }: { batch: Batch }) {
  const now = useNow();
  const c = countdownParts(startInstant(batch.program_start), now);
  const days = daysUntil(batch.program_start, todayMYT(new Date(now)));
  const cells: [string, string, boolean][] = [
    [String(c.days), 'Hari', false],
    [pad(c.hours), 'Jam', false],
    [pad(c.minutes), 'Minit', false],
    [pad(c.seconds), 'Saat', true],
  ];
  return (
    <>
      <p class="small" aria-hidden="true">Program bermula dalam</p>
      <span class="sr-only">{`Program bermula dalam ${days} hari`}</span>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px" aria-hidden="true">
        {cells.map(([v, l, y]) => (
          <div key={l} class="glass" style="text-align:center;padding:10px 4px">
            <div class="num" style={`font-size:28px${y ? ';color:var(--yellow)' : ''}`}>{v}</div>
            <div class="tiny" style="color:var(--on-navy-m)">{l}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function Hero({ batch, name }: { batch: Batch | null; name: string }) {
  const now = useNow(60_000);
  const today = todayMYT(new Date(now));
  const started = !!batch && today >= batch.program_start;
  const week = batch && started ? programWeek({ programStart: batch.program_start, programEnd: batch.program_end, phases: batch.phases }, today) : null;
  const pi = batch ? phaseIndex(batch.phases ?? [], today) : -1;
  return (
    <section class="hero">
      <i class="ph-fill ph-moon-stars moon" aria-hidden="true" />
      {batch ? <span class="pill-t"><i class="ph-fill ph-moon-stars" aria-hidden="true" /> {batch.name}</span> : null}
      <h1 style="font-size:24px;margin:14px 0 4px">Assalamualaikum{name ? `, ${name}` : ''}</h1>
      {!batch ? (
        <p class="small">Maklumat batch akan dipaparkan di sini apabila tersedia.</p>
      ) : !started ? (
        <Countdown batch={batch} />
      ) : (
        <div class="glass" style="padding:12px;text-align:center;margin-top:10px">
          <span class="num" style="font-size:28px;color:var(--yellow)">Minggu {week?.week ?? 1} / {week?.total ?? 13}</span>
        </div>
      )}
      {batch?.phases?.length ? (
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:16px">
          {batch.phases.map((p, i) => (
            <div key={p.key}>
              <div style={`height:6px;border-radius:999px;background:${i <= pi ? 'var(--blue)' : 'rgba(255,255,255,.14)'}`} />
              <div class="months" style={`margin-top:6px${i <= pi ? '' : ';color:var(--on-navy-m)'}`}>{PHASE_LABEL[p.key] ?? p.key}</div>
            </div>
          ))}
        </div>
      ) : null}
      {batch ? <p class="tiny" style="margin-top:8px">{formatDMY(batch.program_start)} – {formatDMY(batch.program_end)}</p> : null}
    </section>
  );
}

export function Home() {
  const s = useSession();
  const ent = s.entitlements;
  const pkg = packageLabel(ent, s.catalog?.packages ?? []);
  const eb = ebookStats(s.catalog?.ebooks ?? [], ent);
  const wa = setting(s, 'support_wa', DEFAULT_SUPPORT_WA);
  const upgradeText = fillTemplate(
    setting(s, 'wa_upgrade_text', 'Salam, saya ingin naik taraf ke Pakej Complete HDM BOOSTER. Emel pendaftaran: {emel}'),
    { emel: s.profile?.email ?? '' },
  );
  const opens = s.batch ? formatDMY(s.batch.program_start) : '10/12/2026';
  const hasTdee = ent.has('tdee');

  return (
    <Layout route="home">
      <Hero batch={s.batch} name={firstName(s.profile?.full_name)} />

      <div class="section-title">
        <h2>Pakej anda</h2>
        <span class={`badge ${pkg.id === 'tiada' ? 'grey' : 'blue'}`}><i class="ph-bold ph-seal-check" aria-hidden="true" /> {pkg.label}</span>
      </div>

      <div class="grid2">
        <Card href="#/ebook">
          <span class="ic blue"><i class="ph-bold ph-book-open-text" aria-hidden="true" /></span>
          <h3 style="font-size:16px;margin-top:10px">Baca Ebook</h3>
          <p class="small muted">{eb.open} daripada {eb.total} dibuka</p>
        </Card>
        <Card href="#/tdee">
          <span class="ic orange"><i class="ph-bold ph-calculator" aria-hidden="true" /></span>
          <h3 style="font-size:16px;margin-top:10px">Kalkulator TDEE</h3>
          {hasTdee ? <p class="small muted">Kira kalori harian</p> : <div style="margin-top:4px"><LockBadge text="Terkunci" /></div>}
        </Card>
        <Card href="#/group">
          <span class="ic green"><i class="ph-bold ph-whatsapp-logo" aria-hidden="true" /></span>
          <h3 style="font-size:16px;margin-top:10px">Group Support</h3>
          <p class="small muted">Group WhatsApp bersama coach</p>
        </Card>
        <Card href="#/bantuan">
          <span class="ic slate"><i class="ph-bold ph-lifebuoy" aria-hidden="true" /></span>
          <h3 style="font-size:16px;margin-top:10px">Bantuan</h3>
          <p class="small muted">Soalan lazim &amp; WhatsApp</p>
        </Card>
      </div>

      {eb.locked > 0 ? (
        <Card style="margin-top:12px;border-left:5px solid var(--yellow)">
          <div class="row">
            <span class="ic navy"><i class="ph-fill ph-lock-key" aria-hidden="true" /></span>
            <div style="flex:1">
              <h3 style="font-size:16px"><span class="stabilo">{eb.locked} ebook lagi</span> menanti anda</h3>
              <p class="small muted">Tersedia dalam Pakej Complete</p>
            </div>
          </div>
          <Button href={waLink(wa, upgradeText)} external variant="green-o" block sm icon="ph-bold ph-whatsapp-logo" style="margin-top:12px">
            Naik taraf
          </Button>
        </Card>
      ) : null}

      <Card href="#/rekod" style="margin-top:12px;display:block">
        <div class="row">
          <span class="ic slate"><i class="ph-bold ph-calendar-check" aria-hidden="true" /></span>
          <div>
            <h3 style="font-size:15px">Rekod harian &amp; Cabaran #1</h3>
            <p class="small muted">Dibuka {opens}. Lengkapkan data permulaan anda dahulu.</p>
          </div>
        </div>
      </Card>

      <HealthNote />
    </Layout>
  );
}
