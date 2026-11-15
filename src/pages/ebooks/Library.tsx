// Ebook library (mockup library-ebook.html): catalog.ebooks from GET /api/me; open iff the item is entitled.
import { useSession, type CatalogEbook, type Reading } from '../../state/session';
import { coverTitle, dmy, ebookNo, isEbookOpen, knownPages, recentProgress } from '../../lib/reader';
import { Layout } from '../../ui/Layout';
import { HealthNote } from '../../ui/Card';
import { Empty } from '../../ui/Empty';
import { LockBadge } from '../../ui/LockBadge';
import { UpgradeButton, upgradeHref } from '../../ui/Upgrade';

const safeImg = (u: string | null) => (u && /^https:\/\//i.test(u) ? u : null);

export function Cover({ e }: { e: CatalogEbook }) {
  const img = safeImg(e.cover_url);
  return (
    <div class={`cover g${((e.sort - 1) % 4 + 4) % 4 + 1}`} style={img ? 'padding:0' : undefined}>
      {img ? (
        <img src={img} alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover" />
      ) : (
        <>
          <span class="no">{ebookNo(e)}</span>
          <span class="tt">{coverTitle(e.title)}</span>
        </>
      )}
    </div>
  );
}

function progressOf(e: CatalogEbook, rows: Reading[]) {
  const row = rows.find((r) => r.ebook_id === e.id);
  const mine = recentProgress(e.id);
  const page = mine?.last_page ?? row?.last_page ?? 0;
  const finished = !!mine?.finished || !!row?.finished_at;
  return { page, finished, total: knownPages(e.id) };
}

function OpenCard({ e, rows }: { e: CatalogEbook; rows: Reading[] }) {
  const p = progressOf(e, rows);
  const updated = dmy(e.file_updated_at);
  const pct = p.finished ? 100 : p.total && p.page ? Math.min(100, Math.round((p.page / p.total) * 100)) : 0;
  return (
    <a class="card ebook" href={`#/ebook/${encodeURIComponent(e.id)}`} style="color:inherit">
      <Cover e={e} />
      <h3>{e.title}</h3>
      <span class="badge green"><i class="ph-bold ph-lock-key-open" aria-hidden="true" /> Terbuka</span>
      {e.description ? <p class="tiny muted" style="margin-top:6px">{e.description}</p> : null}
      {updated ? <p class="tiny muted" style="margin-top:6px">Dikemas kini {updated}</p> : null}
      {p.finished || p.page > 0 ? (
        <>
          <div class="bar" style="margin-top:8px"><span style={`width:${pct}%`} /></div>
          <p class="tiny muted" style="margin-top:4px">
            {p.finished ? 'Selesai dibaca' : p.total ? `Hal. ${p.page}/${p.total}` : `Hal. ${p.page}`}
          </p>
        </>
      ) : null}
    </a>
  );
}

function LockedCard({ e }: { e: CatalogEbook }) {
  const updated = dmy(e.file_updated_at);
  return (
    <article class="card ebook locked">
      <div class="dim"><Cover e={e} /></div>
      <h3>{e.title}</h3>
      <LockBadge />
      <p class="tiny muted" style="margin-top:6px">Tersedia dalam Pakej Complete</p>
      {updated ? <p class="tiny muted" style="margin-top:2px">Dikemas kini {updated}</p> : null}
      <UpgradeButton sm style="margin-top:8px" />
    </article>
  );
}

export function Library() {
  const s = useSession();
  const ebooks = [...(s.catalog?.ebooks ?? [])].sort((a, b) => a.sort - b.sort);
  const open = ebooks.filter((e) => isEbookOpen(e, s.entitlements)).length;
  const locked = ebooks.length - open;

  return (
    <Layout route="ebook">
      <h1 style="font-size:24px">Ebook saya</h1>
      <p class="small muted" style="margin-top:2px">{open} daripada {ebooks.length} dibuka</p>
      {ebooks.length === 0 ? (
        <div style="margin-top:14px">
          <Empty icon="ph-bold ph-books" title="Tiada ebook lagi" text="Ebook akan dipaparkan di sini apabila tersedia." />
        </div>
      ) : (
        <div class="grid2" style="margin-top:14px">
          {ebooks.map((e) => (isEbookOpen(e, s.entitlements) ? <OpenCard key={e.id} e={e} rows={s.reading} /> : <LockedCard key={e.id} e={e} />))}
        </div>
      )}
      <HealthNote />
      {locked > 0 ? (
        <>
          <div style="height:64px" aria-hidden="true" />
          <a class="btn yellow block sticky-cta" href={upgradeHref(s)} target="_blank" rel="noopener noreferrer">
            <i class="ph-fill ph-lock-key" aria-hidden="true" /> {locked} ebook lagi dalam Pakej Complete — Naik taraf
          </a>
        </>
      ) : null}
    </Layout>
  );
}
