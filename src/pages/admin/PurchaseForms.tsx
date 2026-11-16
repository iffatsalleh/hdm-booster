// Purchase dialogs (superadmin): set package, fix buyer details, restore, manual purchase. Each optional batch
// select defaults to "automatic" (batch from the payment date); the SQL validates the batch and every field again.
import { useState } from 'preact/hooks';
import { buyerProblem, dateMYT, defaultBatchId } from '../../lib/admin';
import { Button } from '../../ui/Button';
import { Field } from '../../ui/Field';
import { Modal, Select, type Row } from './ui';

type Pkg = { id: string; name: string };
const AUTO = { value: '', label: 'Automatik (ikut tarikh bayaran)' };
const batchLabel = (b: Row) => `${String(b.name)} (${dateMYT(b.sales_open_at as string)} – ${dateMYT(b.sales_close_at as string)})`;
export const batchOptions = (batches: Row[]) => batches.map((b) => ({ value: String(b.id), label: batchLabel(b) }));

const Actions = (p: { onClose: () => void; onSave: () => void; disabled?: boolean; busy?: boolean; save?: string }) => (
  <div class="row" style="justify-content:flex-end;margin-top:16px">
    <Button variant="outline" sm onClick={p.onClose}>Batal</Button>
    <Button sm disabled={p.disabled} loading={p.busy} onClick={p.onSave}>{p.save ?? 'Simpan'}</Button>
  </div>
);

/** Payload batch_id only when one was picked (else the SQL keeps / derives it). */
const withBatch = (payload: Row, batchId: string) => (batchId ? { ...payload, batch_id: batchId } : payload);

export function SetPackage(p: { row: Row; pkgs: Pkg[]; batches: Row[]; onClose: () => void; onSave: (payload: Row) => void }) {
  const [v, setV] = useState(String(p.row.package_id ?? p.pkgs[0]?.id ?? ''));
  const [batch, setBatch] = useState('');
  return (
    <Modal title={`Tetapkan pakej: ${String(p.row.order_ref)}`} onClose={p.onClose}>
      <Select id="set-pkg" label="Pakej" value={v} onChange={setV} options={p.pkgs.map((k) => ({ value: k.id, label: k.name }))} />
      <Select id="set-pkg-batch" label="Batch" value={batch} onChange={setBatch} options={[AUTO, ...batchOptions(p.batches)]} />
      <p class="hint">Hak akses ditetapkan semula mengikut item pakej. Jika order ini "perlu semakan", ia dinilai semula dan pembeli menerima emel pendaftaran apabila lengkap.</p>
      <Actions onClose={p.onClose} disabled={!v} onSave={() => p.onSave(withBatch({ package_id: v }, batch))} />
    </Modal>
  );
}

export function SetBuyer(p: { row: Row; batches: Row[]; onClose: () => void; onSave: (payload: Row) => void }) {
  const [b, setB] = useState({ name: String(p.row.buyer_name ?? ''), email: String(p.row.email ?? ''), phone: String(p.row.phone ?? '') });
  const [batch, setBatch] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const save = () => {
    const problem = buyerProblem(b);
    if (problem) return setErr(problem);
    p.onSave(withBatch({ buyer_name: b.name.trim(), email: b.email.trim(), phone: b.phone.trim() }, batch));
  };
  return (
    <Modal title={`Betulkan pembeli: ${String(p.row.order_ref)}`} onClose={p.onClose}>
      {p.row.review_reason ? <p class="small" style="color:var(--red-d);margin-bottom:10px">Sebab semakan: {String(p.row.review_reason)}</p> : null}
      <Field id="sb-name" label="Nama pembeli" value={b.name} onInput={(v) => setB({ ...b, name: v })} />
      <Field id="sb-email" label="Emel" type="email" value={b.email} onInput={(v) => setB({ ...b, email: v })} />
      <Field id="sb-phone" label="Telefon bimbit" type="tel" inputMode="tel" value={b.phone} onInput={(v) => setB({ ...b, phone: v })}
        hint="Contoh 0123456789. Pembeli mesti daftar dengan emel dan telefon ini." />
      <Select id="sb-batch" label="Batch" value={batch} onChange={setBatch} options={[AUTO, ...batchOptions(p.batches)]} />
      {err ? <p class="error" role="alert"><i class="ph-fill ph-warning-circle" aria-hidden="true" /> <span>{err}</span></p> : null}
      <Actions onClose={p.onClose} onSave={save} />
    </Modal>
  );
}

export function RestorePurchase(p: { row: Row; batches: Row[]; onClose: () => void; onSave: (payload: Row) => void }) {
  const [batch, setBatch] = useState('');
  return (
    <Modal title={`Pulih ${String(p.row.order_ref)}?`} onClose={p.onClose}>
      <p class="small" style="margin-bottom:10px">
        {p.row.claimed_by ? 'Pembelian ini kembali kepada akaun yang menuntutnya.'
          : 'Pembelian ini dinilai semula: jika maklumatnya lengkap, pembeli boleh mendaftar dan menerima emel pendaftaran.'}
      </p>
      <Select id="rs-batch" label="Batch" value={batch} onChange={setBatch} options={[AUTO, ...batchOptions(p.batches)]} />
      <Actions onClose={p.onClose} save="Pulih" onSave={() => p.onSave(withBatch({}, batch))} />
    </Modal>
  );
}

/** Buyer who paid outside BCL: creates a purchase (MANUAL-…), the buyer then registers with the same email + phone. */
export function ManualPurchase(p: { pkgs: Pkg[]; batches: Row[]; onClose: () => void; onSave: (body: Row) => Promise<boolean> }) {
  const [f, setF] = useState({
    package_id: p.pkgs[0]?.id ?? '', batch_id: defaultBatchId(p.batches as { id: unknown }[]), name: '', email: '', phone: '', amount: '',
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    const problem = buyerProblem(f);
    if (problem) return setErr(problem);
    if (f.amount.trim() && !/^\d{1,7}(\.\d{1,2})?$/.test(f.amount.trim())) return setErr('Jumlah RM tidak sah. Contoh: 97 atau 97.50.');
    setErr(null);
    setBusy(true);
    const done = await p.onSave({
      package_id: f.package_id, batch_id: f.batch_id || null, buyer_name: f.name.trim(), email: f.email.trim(),
      phone: f.phone.trim(), amount_rm: f.amount.trim() || null,
    });
    setBusy(false);
    if (done) p.onClose();
  };
  return (
    <Modal title="Tambah pembelian manual" onClose={p.onClose}>
      <p class="small muted" style="margin-bottom:10px">
        Untuk pembeli yang membayar di luar BCL. Selepas disimpan, pembeli menerima emel pendaftaran dan mendaftar dengan
        emel dan telefon yang sama. Jika akaun dengan emel dan telefon ini sudah wujud, akses terus ditambah.
      </p>
      <Select id="mp-pkg" label="Pakej" value={f.package_id} onChange={(v) => setF({ ...f, package_id: v })}
        options={p.pkgs.map((k) => ({ value: k.id, label: k.name }))} />
      <Select id="mp-batch" label="Batch" value={f.batch_id} onChange={(v) => setF({ ...f, batch_id: v })}
        options={[{ value: '', label: 'Batch yang dibuka sekarang' }, ...batchOptions(p.batches)]} />
      <Field id="mp-name" label="Nama pembeli" value={f.name} onInput={(v) => setF({ ...f, name: v })} />
      <Field id="mp-email" label="Emel" type="email" value={f.email} onInput={(v) => setF({ ...f, email: v })} />
      <Field id="mp-phone" label="Telefon bimbit" type="tel" inputMode="tel" value={f.phone} onInput={(v) => setF({ ...f, phone: v })} hint="Contoh 0123456789." />
      <Field id="mp-amount" label="Jumlah RM (opsyen)" inputMode="decimal" value={f.amount} onInput={(v) => setF({ ...f, amount: v })} />
      {err ? <p class="error" role="alert"><i class="ph-fill ph-warning-circle" aria-hidden="true" /> <span>{err}</span></p> : null}
      <Actions onClose={p.onClose} busy={busy} disabled={!f.package_id} save="Simpan pembelian" onSave={() => void save()} />
    </Modal>
  );
}
