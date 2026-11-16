// #/admin/pembelian — admin_purchases list (status tabs incl. "Perlu semakan", batch, search) and row actions:
// set_package / set_buyer / restore (optional batch), assign, cancel (confirm), reprocess (Apps Script, real outcome
// shown), resend welcome, WhatsApp (belum_dituntut), and "Tambah pembelian manual" for buyers who paid outside BCL.
import { useEffect, useState } from 'preact/hooks';
import { appUrl, buildQuery, dateTimeMYT, listTotal, purchaseWaText, reprocessMessage } from '../../lib/admin';
import { waLink } from '../../lib/wa';
import { useSession } from '../../state/session';
import { Button } from '../../ui/Button';
import { toast } from '../../ui/Toast';
import {
  act, ActionsButton, adminApi, AdminShell, confirmed, ErrorBox, Loading, Modal, PickParticipant, PkgBadge, SearchBox,
  Select, StatusBadge, useLoad, useSettings, type Row,
} from './ui';
import { ManualPurchase, RestorePurchase, SetBuyer, SetPackage } from './PurchaseForms';

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
  const [buyerFor, setBuyerFor] = useState<Row | null>(null);
  const [restoreFor, setRestoreFor] = useState<Row | null>(null);
  const [manual, setManual] = useState(false);
  const pkgs = s.catalog?.packages ?? [];

  // links such as #/admin/pembelian?status=perlu_semakan (Ringkasan) pick the tab
  useEffect(() => setStatus(p.query?.status ?? ''), [p.query?.status]);
  useEffect(() => setQ(p.query?.q ?? ''), [p.query?.q]);
  const tab = setStatus;

  const action = async (row: Row, action: string, payload: Row = {}, okText = 'Pembelian dikemas kini.') => {
    const r = await act(() => adminApi<Row>('POST', `/api/admin/purchases/${row.id}/action`, { action, payload }));
    if (!r) return;
    if (r.status === 'perlu_semakan') toast(`${okText} Masih perlu semakan: ${String(r.review_reason ?? '')}`, 'yellow', 8000);
    else toast(action !== 'assign' && r.status === 'dituntut' && row.status !== 'dituntut' ?`${okText} Pembelian dituntut oleh akaun sedia ada.` : okText, 'green');
    void list.reload();
  };

  const actionsFor = (row: Row) => [
    { label: 'Tetapkan pakej', icon: 'package', run: () => setPkgFor(row) },
    { label: 'Betulkan maklumat pembeli', icon: 'user-gear', run: () => setBuyerFor(row), hidden: row.status === 'dibatalkan' },
    { label: 'Pindah ke akaun', icon: 'arrows-left-right', run: () => setAssignFor(row), hidden: row.status === 'dibatalkan' },
    {
      label: 'Proses semula order', icon: 'arrows-clockwise',
      run: async () => {
        const r = await act(() => adminApi<{ ok: boolean; reason?: string; result?: unknown }>('POST', `/api/admin/purchases/${row.id}/reprocess`));
        if (!r) return;
        const m = reprocessMessage(r);
        toast(m.text, m.tone, 8000);
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
    { label: 'Pulih', icon: 'arrow-counter-clockwise', hidden: row.status !== 'dibatalkan', run: () => setRestoreFor(row) },
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
        <Button sm icon="ph-bold ph-plus" onClick={() => setManual(true)}>Tambah pembelian manual</Button>
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
        <SetPackage row={pkgFor} pkgs={pkgs} batches={batches.data ?? []} onClose={() => setPkgFor(null)}
          onSave={async (payload) => { const row = pkgFor; setPkgFor(null); await action(row, 'set_package', payload, 'Pakej ditetapkan.'); }} />
      ) : null}
      {buyerFor ? (
        <SetBuyer row={buyerFor} batches={batches.data ?? []} onClose={() => setBuyerFor(null)}
          onSave={async (payload) => { const row = buyerFor; setBuyerFor(null); await action(row, 'set_buyer', payload, 'Maklumat pembeli dikemas kini.'); }} />
      ) : null}
      {restoreFor ? (
        <RestorePurchase row={restoreFor} batches={batches.data ?? []} onClose={() => setRestoreFor(null)}
          onSave={async (payload) => { const row = restoreFor; setRestoreFor(null); await action(row, 'restore', payload, 'Pembelian dipulihkan.'); }} />
      ) : null}
      {manual ? (
        <ManualPurchase pkgs={pkgs} batches={batches.data ?? []} onClose={() => setManual(false)}
          onSave={async (body) => {
            const r = await act(() => adminApi<Row>('POST', '/api/admin/purchases', body));
            if (!r) return false;
            toast(r.status === 'dituntut'
              ? `${String(r.order_ref)} ditambah ke akaun sedia ada pembeli. Emel makluman akan dihantar.`
              : r.status === 'belum_dituntut'
                ? `${String(r.order_ref)} disimpan. Emel pendaftaran akan dihantar kepada ${String(r.email)}.`
                : `${String(r.order_ref)} disimpan tetapi perlu semakan: ${String(r.review_reason ?? '')}`,
            r.status === 'perlu_semakan' ? 'yellow' : 'green', 8000);
            setQ(String(r.order_ref));
            setStatus('');
            void list.reload();
            return true;
          }} />
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

