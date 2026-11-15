// #/admin/kod — generate codes (bulk → CSV kod,pakej,batch; single for a buyer → Salin + WhatsApp), list/filter,
// row actions: cancel / release (confirm), reactivate, transfer, set items, extend.
import { useMemo, useState } from 'preact/hooks';
import {
  appUrl, buildQuery, codesCsvRows, codesFilename, codeWaText, dateMYT, dateTimeMYT, fromLocalInput,
} from '../../lib/admin';
import { waLink } from '../../lib/wa';
import { useSession } from '../../state/session';
import { Button } from '../../ui/Button';
import { Field } from '../../ui/Field';
import { toast } from '../../ui/Toast';
import {
  act, ActionsButton, adminApi, AdminShell, confirmed, copyText, downloadCsv, ErrorBox, Loading, Modal,
  PickParticipant, PkgBadge, SearchBox, Select, StatusBadge, useLoad, useSettings, type Row,
} from './ui';

/** date input (YYYY-MM-DD) → end of that day in MYT, or null. */
const endOfDay = (d: string) => (d ? fromLocalInput(`${d}T23:59`) : null);

export function Codes() {
  const s = useSession();
  const pkgs = s.catalog?.packages ?? [];
  const items = s.catalog?.items ?? [];
  const [status, setStatus] = useState('');
  const [batchId, setBatchId] = useState('');
  const [q, setQ] = useState('');
  const list = useLoad(() => adminApi<Row[]>('GET', '/api/admin/codes' + buildQuery({ status, batch_id: batchId, q })), [status, batchId, q]);
  const batches = useLoad(() => adminApi<Row[]>('GET', '/api/admin/content/batches'), []);
  const people = useLoad(() => adminApi<Row[]>('GET', '/api/admin/participants'), []);
  const names = useMemo(() => new Map((people.data ?? []).map((u) => [String(u.id), String(u.full_name ?? u.email ?? u.id)])), [people.data]);
  const tpl = useSettings(true);
  const batchOpts = [{ value: '', label: 'Tiada batch' }, ...(batches.data ?? []).map((b) => ({ value: String(b.id), label: String(b.name) }))];

  const [transferFor, setTransferFor] = useState<Row | null>(null);
  const [itemsFor, setItemsFor] = useState<Row | null>(null);
  const [extendFor, setExtendFor] = useState<Row | null>(null);

  const action = async (row: Row, action: string, payload: Row = {}, okText = 'Kod dikemas kini.') => {
    const r = await act(() => adminApi('POST', `/api/admin/codes/${row.id}/action`, { action, payload }), okText);
    if (r) void list.reload();
  };

  const waFor = (code: string, name: unknown, phone: unknown) =>
    window.open(waLink(String(phone ?? ''), codeWaText(tpl('wa_template_code'), { nama: name as string, kod: code }, appUrl(location))),
      '_blank', 'noopener');

  const actionsFor = (row: Row) => [
    { label: 'Salin kod', icon: 'copy', run: () => copyText(String(row.code)) },
    { label: 'WhatsApp pembeli', icon: 'whatsapp-logo', hidden: !row.buyer_phone || row.status !== 'belum_guna',
      run: () => waFor(String(row.code), row.buyer_name, row.buyer_phone) },
    { label: 'Aktifkan semula', icon: 'arrow-counter-clockwise', hidden: row.status !== 'dibatalkan',
      run: () => action(row, 'reactivate', {}, 'Kod diaktifkan semula.') },
    { label: 'Pindah ke akaun lain', icon: 'arrows-left-right', hidden: !row.redeemed_by, run: () => setTransferFor(row) },
    { label: 'Tetapkan item', icon: 'list-checks', run: () => setItemsFor(row) },
    { label: 'Tarikh tamat akses', icon: 'calendar-blank', run: () => setExtendFor(row) },
    {
      label: 'Lepaskan (boleh ditebus semula)', icon: 'link-break', danger: true, hidden: !row.redeemed_by,
      run: async () => {
        const ok = await confirmed('code.release', {
          title: 'Lepaskan kod?', confirm: 'Ya, lepaskan', danger: true,
          text: <>Kod <b>{String(row.code)}</b> akan dilepaskan daripada {names.get(String(row.redeemed_by)) ?? 'penebus'} dan boleh ditebus semula. Penebus kehilangan item kod ini.</>,
        });
        if (ok) await action(row, 'release', {}, 'Kod dilepaskan.');
      },
    },
    {
      label: 'Batal kod', icon: 'prohibit', danger: true, hidden: row.status === 'dibatalkan',
      run: async () => {
        const ok = await confirmed('code.cancel', {
          title: 'Batal kod?', confirm: 'Ya, batal', danger: true,
          text: <>Kod <b>{String(row.code)}</b> akan dibatalkan.{row.redeemed_by ? ' Penebus akan kehilangan item kod ini.' : ''}</>,
        });
        if (ok) await action(row, 'cancel', {}, 'Kod dibatalkan.');
      },
    },
  ];

  return (
    <AdminShell section="kod" title="Kod Akses">
      <div class="cols-2-3">
        <div class="stack-c">
          <Generate pkgs={pkgs} batchOpts={batchOpts} onDone={() => void list.reload()} waFor={waFor} />
        </div>
        <div class="card">
          <div class="toolbar">
            <SearchBox placeholder="Cari kod, nama atau label" value={q} onSearch={setQ} />
            <Select id="kod-status" ariaLabel="Status" sm style="width:auto" value={status} onChange={setStatus}
              options={[{ value: '', label: 'Semua status' }, { value: 'belum_guna', label: 'belum_guna' }, { value: 'aktif', label: 'aktif' }, { value: 'dibatalkan', label: 'dibatalkan' }]} />
            <Select id="kod-batch" ariaLabel="Batch" sm style="width:auto" value={batchId} onChange={setBatchId}
              options={[{ value: '', label: 'Semua batch' }, ...batchOpts.slice(1)]} />
          </div>
          {list.error ? <ErrorBox text={list.error} retry={() => void list.reload()} /> : null}
          {list.loading && !list.data ? <Loading /> : null}
          {list.data ? (
            <div class="tbl-wrap">
              <table class="t">
                <thead><tr><th>Kod</th><th>Pakej</th><th>Status</th><th>Ditebus oleh</th><th>Tarikh tebus</th><th>Tamat</th><th><span class="sr-only">Tindakan</span></th></tr></thead>
                <tbody>
                  {list.data.map((r) => (
                    <tr key={String(r.id)}>
                      <td><span class="mono">{String(r.code)}</span>{r.batch_label || r.buyer_name ? <div class="tiny muted">{String(r.buyer_name ?? r.batch_label)}</div> : null}</td>
                      <td><PkgBadge id={r.package_id} name={r.package_name} /></td>
                      <td><StatusBadge s={r.status} /></td>
                      <td>{r.redeemed_by ? <a href={`#/admin/peserta/${encodeURIComponent(String(r.redeemed_by))}`}>{names.get(String(r.redeemed_by)) ?? String(r.redeemed_by)}</a> : '—'}</td>
                      <td>{r.redeemed_at ? dateTimeMYT(r.redeemed_at as string) : '—'}</td>
                      <td>{r.access_ends_at ? dateMYT(r.access_ends_at as string) : '—'}</td>
                      <td><ActionsButton title={String(r.code)} actions={actionsFor(r)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!list.data.length ? <p class="small muted" style="padding:16px 0">Tiada kod.</p> : null}
            </div>
          ) : null}
          {list.data ? <div class="pager"><span>{list.data.length} kod{list.data.length >= 200 ? ' (had 200 terkini)' : ''}</span></div> : null}
        </div>
      </div>

      {transferFor ? (
        <Modal title={`Pindah ${String(transferFor.code)}`} onClose={() => setTransferFor(null)}>
          <p class="small muted" style="margin-bottom:10px">Pilih peserta baharu untuk kod ini.</p>
          <PickParticipant onPick={async (uid) => { const r = transferFor; setTransferFor(null); await action(r, 'transfer', { user_id: uid }, 'Kod dipindahkan.'); }} />
        </Modal>
      ) : null}
      {itemsFor ? (
        <SetItems row={itemsFor} items={items} onClose={() => setItemsFor(null)}
          onSave={async (keys) => { const r = itemsFor; setItemsFor(null); await action(r, 'set_entitlements', { items: keys }, 'Item kod dikemas kini.'); }} />
      ) : null}
      {extendFor ? (
        <Extend row={extendFor} onClose={() => setExtendFor(null)}
          onSave={async (d) => { const r = extendFor; setExtendFor(null); await action(r, 'extend', { access_ends_at: endOfDay(d) }, 'Tarikh tamat dikemas kini.'); }} />
      ) : null}
    </AdminShell>
  );
}

function Generate(p: { pkgs: { id: string; name: string }[]; batchOpts: { value: string; label: string }[]; onDone: () => void;
  waFor: (code: string, name: unknown, phone: unknown) => void }) {
  const [mode, setMode] = useState<'pukal' | 'pembeli'>('pukal');
  const [pkg, setPkg] = useState(p.pkgs[0]?.id ?? '');
  const [count, setCount] = useState('20');
  const [batchId, setBatchId] = useState('');
  const [label, setLabel] = useState('');
  const [ends, setEnds] = useState('');
  const [buyer, setBuyer] = useState({ name: '', phone: '', email: '', order_ref: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [single, setSingle] = useState<Row | null>(null);

  const submit = async (e: Event) => {
    e.preventDefault();
    setErr(null);
    const n = mode === 'pukal' ? Number(count) : 1;
    if (!pkg) return setErr('Sila pilih pakej.');
    if (!Number.isInteger(n) || n < 1 || n > 500) return setErr('Bilangan kod mesti antara 1 dan 500.');
    if (mode === 'pembeli' && !buyer.name.trim()) return setErr('Sila masukkan nama pembeli.');
    const b = mode === 'pembeli'
      ? Object.fromEntries(Object.entries(buyer).map(([k, v]) => [k, v.trim() || null]).filter(([, v]) => v))
      : null;
    setBusy(true);
    const lbl = mode === 'pukal' ? label.trim() : (label.trim() || `Pembeli: ${buyer.name.trim()}`);
    const r = await act(() => adminApi<Row[]>('POST', '/api/admin/codes/generate', {
      package_id: pkg, count: n, batch_id: batchId || null, label: lbl || null, access_ends_at: endOfDay(ends), buyer: b,
    }));
    setBusy(false);
    if (!r) return;
    if (mode === 'pukal') {
      downloadCsv(codesFilename(lbl), codesCsvRows(r));
      toast(`${r.length} kod dijana. Fail CSV dimuat turun.`, 'green');
    } else {
      setSingle(r[0] ?? null);
      toast('Kod dijana.', 'green');
    }
    p.onDone();
  };

  return (
    <>
      <form class="card" onSubmit={submit}>
        <h2 style="margin-bottom:12px">Jana kod</h2>
        <div class="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'pukal'} class={mode === 'pukal' ? 'on' : undefined} onClick={() => setMode('pukal')}>Pukal</button>
          <button type="button" role="tab" aria-selected={mode === 'pembeli'} class={mode === 'pembeli' ? 'on' : undefined} onClick={() => setMode('pembeli')}>Untuk pembeli</button>
        </div>
        <Select id="gen-pkg" label="Pakej" value={pkg} onChange={setPkg} options={p.pkgs.map((k) => ({ value: k.id, label: k.name }))} />
        {mode === 'pukal' ? (
          <div class="field"><label for="gen-n">Bilangan (1–500)</label>
            <input id="gen-n" class="input" type="number" min={1} max={500} inputMode="numeric" value={count}
              onInput={(e) => setCount((e.currentTarget as HTMLInputElement).value)} /></div>
        ) : (
          <>
            <Field id="gen-name" label="Nama pembeli" value={buyer.name} onInput={(v) => setBuyer({ ...buyer, name: v })} />
            <Field id="gen-phone" label="Telefon (untuk WhatsApp)" type="tel" inputMode="tel" value={buyer.phone} onInput={(v) => setBuyer({ ...buyer, phone: v })} />
            <Field id="gen-email" label="Emel (opsyen)" type="email" value={buyer.email} onInput={(v) => setBuyer({ ...buyer, email: v })} />
            <Field id="gen-ref" label="No. order (opsyen)" value={buyer.order_ref} onInput={(v) => setBuyer({ ...buyer, order_ref: v })} />
          </>
        )}
        <Select id="gen-batch" label="Batch" value={batchId} onChange={setBatchId} options={p.batchOpts} />
        <Field id="gen-label" label={mode === 'pukal' ? 'Label batch' : 'Label (opsyen)'} value={label} onInput={setLabel}
          placeholder={mode === 'pukal' ? 'cth. Giveaway Instagram Nov' : undefined} />
        <div class="field"><label for="gen-ends">Tarikh tamat akses (opsyen)</label>
          <input id="gen-ends" class="input" type="date" value={ends} onInput={(e) => setEnds((e.currentTarget as HTMLInputElement).value)} /></div>
        {err ? <p class="error" role="alert"><i class="ph-fill ph-warning-circle" aria-hidden="true" /><span>{err}</span></p> : null}
        <Button type="submit" block loading={busy} style="margin-top:18px" icon={mode === 'pukal' ? 'ph-bold ph-download-simple' : 'ph-bold ph-key'}>
          {mode === 'pukal' ? 'Jana & muat turun CSV' : 'Jana kod untuk pembeli'}
        </Button>
      </form>
      {single ? (
        <div class="card">
          <h2 style="margin-bottom:4px">Untuk pembeli tertentu</h2>
          <p class="small muted" style="margin-bottom:12px">Kod dijana untuk {String(single.buyer_name ?? '—')}{single.order_ref ? ` (${String(single.order_ref)})` : ''} — {String(single.package_name ?? single.package_id)}</p>
          <div style="background:var(--blue-t);border-radius:14px;padding:18px;text-align:center"><div class="code-big">{String(single.code)}</div></div>
          <div class="row" style="margin-top:12px;flex-wrap:wrap">
            <Button variant="outline" sm icon="ph ph-copy" onClick={() => void copyText(String(single.code))}>Salin</Button>
            <Button variant="green" sm icon="ph-fill ph-whatsapp-logo" onClick={() => p.waFor(String(single.code), single.buyer_name, single.buyer_phone)}>Hantar via WhatsApp</Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SetItems(p: { row: Row; items: { key: string; name: string }[]; onClose: () => void; onSave: (keys: string[]) => void }) {
  const [sel, setSel] = useState<Set<string>>(new Set((p.row.entitlements as string[] | undefined) ?? []));
  const toggle = (k: string) => {
    const n = new Set(sel);
    if (n.has(k)) n.delete(k);
    else n.add(k);
    setSel(n);
  };
  return (
    <Modal title={`Item kod ${String(p.row.code)}`} onClose={p.onClose}>
      <div style="max-height:320px;overflow:auto">
        {p.items.map((i) => (
          <label key={i.key} class="check" style="padding:6px 0">
            <input type="checkbox" checked={sel.has(i.key)} onChange={() => toggle(i.key)} /> {i.name} <span class="tiny subtle">{i.key}</span>
          </label>
        ))}
      </div>
      <div class="row" style="justify-content:flex-end;margin-top:16px">
        <Button variant="outline" sm onClick={p.onClose}>Batal</Button>
        <Button sm onClick={() => p.onSave([...sel].sort())}>Simpan</Button>
      </div>
    </Modal>
  );
}

function Extend(p: { row: Row; onClose: () => void; onSave: (d: string) => void }) {
  const cur = p.row.access_ends_at ? dateMYT(p.row.access_ends_at as string).split('/').reverse().join('-') : '';
  const [d, setD] = useState(cur);
  return (
    <Modal title={`Tarikh tamat: ${String(p.row.code)}`} onClose={p.onClose}>
      <div class="field"><label for="ext-d">Tarikh tamat akses</label>
        <input id="ext-d" class="input" type="date" value={d} onInput={(e) => setD((e.currentTarget as HTMLInputElement).value)} /></div>
      <p class="hint">Kosongkan untuk akses tanpa tarikh tamat.</p>
      <div class="row" style="justify-content:flex-end;margin-top:16px">
        <Button variant="outline" sm onClick={p.onClose}>Batal</Button>
        <Button sm onClick={() => p.onSave(d)}>Simpan</Button>
      </div>
    </Modal>
  );
}
