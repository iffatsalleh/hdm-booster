// #/admin/export — CSV of participants, purchases and codes from the admin list endpoints (toCsv, MYT dates).
import { useState } from 'preact/hooks';
import { codesExportRows, exportFilename, fetchAllPages, participantsCsvRows, purchasesCsvRows } from '../../lib/admin';
import { Button } from '../../ui/Button';
import { toast } from '../../ui/Toast';
import { act, adminApi, AdminShell, downloadCsv, useLoad, type Row } from './ui';

type Kind = 'peserta' | 'pembelian' | 'kod';
const CARDS: { kind: Kind; title: string; icon: string; text: string; path: string; rows: (l: Row[]) => Record<string, unknown>[] }[] = [
  { kind: 'peserta', title: 'Peserta', icon: 'users-three', text: 'Nama, emel, telefon, status onboarding, hak akses',
    path: '/api/admin/participants', rows: participantsCsvRows },
  { kind: 'pembelian', title: 'Pembelian', icon: 'receipt', text: 'Order ref, jumlah RM, tarikh bayar, status',
    path: '/api/admin/purchases', rows: purchasesCsvRows },
  { kind: 'kod', title: 'Kod akses', icon: 'key', text: 'Kod, pakej, batch, status, tarikh tebus',
    path: '/api/admin/codes', rows: codesExportRows },
];

type Summary = { participants: number; purchases: Record<string, number>; codes: Record<string, number> };
const total = (o: Record<string, number> | undefined) => Object.values(o ?? {}).reduce((a, b) => a + b, 0);

export function Exports() {
  const sum = useLoad(() => adminApi<Summary>('GET', '/api/admin/summary'), []);
  const [busy, setBusy] = useState<Kind | null>(null);
  const counts: Record<Kind, number | null> = {
    peserta: sum.data?.participants ?? null,
    pembelian: sum.data ? total(sum.data.purchases) : null,
    kod: sum.data ? total(sum.data.codes) : null,
  };

  const run = async (c: (typeof CARDS)[number]) => {
    setBusy(c.kind);
    // every page (?offset=) until the server's total is reached
    const list = await act(() => fetchAllPages((offset) => adminApi<Row[]>('GET', `${c.path}?offset=${offset}`)));
    setBusy(null);
    if (!list) return;
    downloadCsv(exportFilename(c.kind), c.rows(list));
    toast(`${list.length} rekod dieksport.`, 'green');
  };

  return (
    <AdminShell section="export" title="Export">
      <section class="grid3">
        {CARDS.map((c) => (
          <div class="card" key={c.kind}>
            <div class="row"><span class="ic blue"><i class={`ph ph-${c.icon}`} aria-hidden="true" /></span>
              <div><div class="small muted" style="font-weight:700">{c.title}</div><div class="num" style="font-size:30px">{counts[c.kind] ?? '—'}</div></div></div>
            <p class="small muted" style="margin:8px 0 14px">{c.text}</p>
            <Button variant="outline" block icon="ph-bold ph-download-simple" loading={busy === c.kind} onClick={() => void run(c)}>Muat turun CSV</Button>
          </div>
        ))}
      </section>
      <p class="small muted" style="margin-top:12px">Tarikh dalam fail mengikut waktu Malaysia (MYT). Fail mengandungi semua rekod.</p>
    </AdminShell>
  );
}
