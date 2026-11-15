// #/admin/pembelian — admin_purchases list (status tabs incl. "Perlu semakan", batch, search) and row actions:
// set_package, assign, cancel (confirm), restore, reprocess (Apps Script), resend welcome, WhatsApp (belum_dituntut).
import { useEffect, useState } from 'preact/hooks';
import { appUrl, buildQuery, dateTimeMYT, listTotal, purchaseWaText } from '../../lib/admin';
import { waLink } from '../../lib/wa';
import { useSession } from '../../state/session';
import { Button } from '../../ui/Button';
import { toast } from '../../ui/Toast';
import {
  act, ActionsButton, adminApi, AdminShell, confirmed, ErrorBox, Loading, Modal, PickParticipant, PkgBadge, SearchBox,
  Select, StatusBadge, useLoad, useSettings, type Row,
} from './ui';

const TABS: [string, string][] = [
  ['', 'Semua'], ['perlu_semakan', 'Perlu semakan'], ['belum_dituntut', 'Belum dituntut'], ['dituntut', 'Dituntut'],
  ['dibatalkan', 'Dibatalkan'],
];

export function Purchases(p: { query?: Record<string, string> }) {
  const s = useSession();
  const [status, setStatus] = useState(p.query?.status ?? '');
  const [batchId, setBatchId] = useState('');
  const [q, setQ] = useState(p.query?.q ?? '');
  const list = useLoad(
    () => adminApi<Row[]>('GET', '/api/admin/purchases' + buildQuery({ status, batch_id: batchId, q })),
    [status, batchId, q],
  );
  const review = useLoad(() => adminApi<Row[]>('GET', '/api/admin/purchases?status=perlu_semakan'), [list.data]);
  const batches = useLoad(() => adminApi<Row[]>('GET', '/api/admin/content/batches'), []);
  const tpl = useSettings(true);
  const [pkgFor, setPkgFor] = useState<Row | null>(null);
  const [assignFor, setAssignFor] = useState<Row | null>(null);
  const pkgs = s.catalog?.packages ?? [];

  // links such as #/admin/pembelian?status=perlu_semakan (Ringkasan) pick the tab
  useEffect(() => setStatus(p.query?.status ?? ''), [p.query?.status]);
  useEffect(() => setQ(p.query?.q ?? ''), [p.query?.q]);
  const tab = setStatus;

  const action = async (row: Row, action: string, payload: Row = {}, okText = 'Pembelian dikemas kini.') => {
    const r = await act(() => adminApi('POST', `/api/admin/purchases/${row.id}/action`, { action, payload }), okText);
    if (r) void list.reload();
  };

  const actionsFor = (row: Row) => [
    { label: 'Tetapkan pakej', icon: 'package', run: () => setPkgFor(row) },
    { label: 'Pindah ke akaun', icon: 'arrows-left-right', run: () => setAssignFor(row), hidden: row.status === 'dibatalkan' },
    {
      label: 'Proses semula order', icon: 'arrows-clockwise',
      run: async () => {
        const r = await act(() => adminApi<{ ok: boolean; reason?: string }>('POST', `/api/admin/purchases/${row.id}/reprocess`));
        if (!r) return;
        toast(r.ok ? 'Order diproses semula.' : `Apps Script: ${r.reason ?? 'tidak berjaya'}`, r.ok ? 'green' : 'yellow', 6000);
        void list.reload();
      },
    },
    {
      label: 'Hantar semula emel', icon: 'envelope-simple', hidden: !row.email,
      run: async () => {
        const r = await act(() => adminApi<{ to_email: string }>('POST', `/api/admin/purchases/${row.id}/resend-welcome`));
        if (r) toast(`Emel dimasukkan ke baris gilir untuk ${r.to_email}.`, 'green');
      },
    },
    {
      label: 'WhatsApp pembeli', icon: 'whatsapp-logo', hidden: row.status !== 'belum_dituntut' || !row.phone,
      run: () => {
        const text = purchaseWaText(tpl('wa_template_purchase'), row.buyer_name as string, appUrl(location));
        window.open(waLink(String(row.phone), text), '_blank', 'noopener');
      },
    },
    { label: 'Pulih', icon: 'arrow-counter-clockwise', hidden: row.status !== 'dibatalkan', run: () => action(row, 'restore', {}, 'Pembelian dipulihkan.') },
    {
      label: 'Batal pembelian', icon: 'prohibit', danger: true, hidden: row.status === 'dibatalkan',
      run: async () => {
        const ok = await confirmed('purchase.cancel', {
          title: 'Batal pembelian?', confirm: 'Ya, batal', danger: true,
          text: <>Order <b>{String(row.order_ref)}</b> ({String(row.buyer_name ?? '—')}) akan dibatalkan. Akses daripada pembelian ini akan ditarik. Anda boleh memulihkannya kemudian.</>,
        });
        if (ok) await action(row, 'cancel', {}, 'Pembelian dibatalkan.');
      },
    },
  ];

  const reviewN = review.data?.length ?? 0;
  return (
    <AdminShell section="pembelian" title="Pembelian">
      <div class="toolbar">
        <SearchBox placeholder="Cari nama, emel, telefon, no. order" value={q} onSearch={setQ} />
        <Select id="pu-batch" ariaLabel="Batch" sm value={batchId} onChange={setBatchId} style="width:auto"
          options={[{ value: '', label: 'Semua batch' }, ...(batches.data ?? []).map((b) => ({ value: String(b.id), label: String(b.name) }))]} />
      </div>
      <div class="tabs" role="tablist">
        {TABS.map(([v, l]) => (
          <button key={v} type="button" role="tab" aria-selected={status === v} class={status === v ? 'on' : undefined} onClick={() => tab(v)}>
            {l}{v === 'perlu_semakan' && reviewN ? ` (${reviewN})` : ''}
          </button>
        ))}
      </div>
      <div class="card" style="padding:0 16px 16px">
        {list.error ? <div style="padding-top:16px"><ErrorBox text={list.error} retry={() => void list.reload()} /></div> : null}
        {list.loading && !list.data ? <Loading /> : null}
        {list.data ? (
          <div class="tbl-wrap">
            <table class="t">
              <thead><tr><th>Order ref</th><th>Nama</th><th>Emel</th><th>Telefon</th><th>Pakej</th><th>Jumlah</th><th>Tarikh bayar</th><th>Status</th><th><span class="sr-only">Tindakan</span></th></tr></thead>
              <tbody>
                {list.data.map((r) => (
                  <tr key={String(r.id)}>
                    <td><span class="mono">{String(r.order_ref)}</span></td>
                    <td><b>{String(r.buyer_name ?? '—')}</b>{r.claimed_by ? <div><a class="small" href={`#/admin/peserta/${encodeURIComponent(String(r.claimed_by))}`}>Lihat peserta</a></div> : null}</td>
                    <td>{String(r.email ?? '—')}{r.squatter_suspect ? (
                      <div style="margin-top:4px"><span class="badge red" title="Belum dituntut lebih 24 jam, tetapi ada akaun lain berdaftar dengan emel ini">
                        <i class="ph-fill ph-warning" aria-hidden="true" /> Akaun lain guna emel ini</span></div>) : null}</td>
                    <td>{String(r.phone ?? '—')}</td>
                    <td><PkgBadge id={r.package_id} name={r.package_name} /></td>
                    <td class="num">{r.amount_rm != null ? `RM${r.amount_rm}` : '—'}</td>
                    <td>{dateTimeMYT(r.paid_at as string)}</td>
                    <td><StatusBadge s={r.status} />{r.review_reason ? <div class="tiny" style="color:var(--red-d);margin-top:4px;max-width:220px">{String(r.review_reason)}</div> : null}</td>
                    <td><ActionsButton title={String(r.order_ref)} actions={actionsFor(r)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.data.length ? <p class="small muted" style="padding:16px 0">Tiada pembelian.</p> : null}
          </div>
        ) : null}
        {list.data ? <div class="pager"><span>{list.data.length < listTotal(list.data) ? `${list.data.length} terkini daripada ${listTotal(list.data)} pembelian (guna carian / Export untuk semua)` : `${list.data.length} pembelian`}</span></div> : null}
      </div>

      {pkgFor ? (
        <SetPackage row={pkgFor} pkgs={pkgs} onClose={() => setPkgFor(null)}
          onSave={async (id) => { setPkgFor(null); await action(pkgFor, 'set_package', { package_id: id }, 'Pakej ditetapkan.'); }} />
      ) : null}
      {assignFor ? (
        <Modal title={`Pindah ${String(assignFor.order_ref)} ke akaun`} onClose={() => setAssignFor(null)}>
          <p class="small muted" style="margin-bottom:10px">Pilih peserta yang akan menerima pembelian ini.</p>
          <PickParticipant onPick={async (uid) => { const row = assignFor; setAssignFor(null); await action(row, 'assign', { user_id: uid }, 'Pembelian dipindahkan.'); }} />
        </Modal>
      ) : null}
    </AdminShell>
  );
}

function SetPackage(p: { row: Row; pkgs: { id: string; name: string }[]; onClose: () => void; onSave: (id: string) => void }) {
  const [v, setV] = useState(String(p.row.package_id ?? p.pkgs[0]?.id ?? ''));
  return (
    <Modal title={`Tetapkan pakej: ${String(p.row.order_ref)}`} onClose={p.onClose}>
      <Select id="set-pkg" label="Pakej" value={v} onChange={setV} options={p.pkgs.map((k) => ({ value: k.id, label: k.name }))} />
      <p class="hint">Hak akses pembelian akan ditetapkan semula mengikut item pakej.</p>
      <div class="row" style="justify-content:flex-end;margin-top:16px">
        <Button variant="outline" sm onClick={p.onClose}>Batal</Button>
        <Button sm disabled={!v} onClick={() => p.onSave(v)}>Simpan</Button>
      </div>
    </Modal>
  );
}
