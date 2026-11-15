// Generic table editor over the Worker's whitelisted CRUD (/api/admin/bcl-map, /api/admin/content/:table).
// Delete always asks in the in-app confirm dialog; updates send only changed non-key columns.
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { dateMYT, dateTimeMYT, fromLocalInput, toLocalInput } from '../../lib/admin';
import { Button } from '../../ui/Button';
import { act, adminApi, confirmed, ErrorBox, Loading, Modal, useLoad, type Row } from './ui';

export type ColType = 'text' | 'textarea' | 'number' | 'bool' | 'date' | 'datetime' | 'select' | 'setting' | 'phases';
export type Col = {
  key: string;
  label: string;
  type: ColType;
  options?: { value: string; label: string }[];
  /** shown in the table (default true) */
  list?: boolean;
  required?: boolean;
  /** primary-key column: editable on create only */
  pk?: boolean;
  hint?: string;
  mono?: boolean;
};

type Props = {
  title: string;
  /** API base, e.g. /api/admin/content/ebooks */
  base: string;
  /** audit-style action for the delete confirmation (content.delete / bcl_map.delete) */
  deleteAction: 'content.delete' | 'bcl_map.delete';
  cols: Col[];
  idOf: (r: Row) => string;
  labelOf: (r: Row) => string;
  newRow?: () => Row;
  extra?: (r: Row, reload: () => void) => ComponentChildren;
  note?: ComponentChildren;
  onChange?: () => void;
};

export function CrudTable(p: Props) {
  const list = useLoad(() => adminApi<Row[]>('GET', p.base), [p.base]);
  const [edit, setEdit] = useState<{ row: Row; isNew: boolean } | null>(null);
  const editable = p.cols.some((c) => !c.pk);
  const shown = p.cols.filter((c) => c.list !== false);
  const reload = () => {
    void list.reload();
    p.onChange?.();
  };

  const del = async (r: Row) => {
    const ok = await confirmed(p.deleteAction, {
      title: 'Padam rekod?', confirm: 'Ya, padam', danger: true,
      text: <><b>{p.labelOf(r)}</b> akan dipadam terus. Tindakan ini tidak boleh dibatalkan.</>,
    });
    if (!ok) return;
    const res = await act(() => adminApi('DELETE', `${p.base}/${encodeURIComponent(p.idOf(r))}`), 'Rekod dipadam.');
    if (res) reload();
  };

  return (
    <div class="card">
      <div class="card-h">
        <h2>{p.title}</h2>
        <Button variant="outline" sm icon="ph-bold ph-plus" onClick={() => setEdit({ row: p.newRow?.() ?? {}, isNew: true })}>Tambah</Button>
      </div>
      {p.note}
      {list.error ? <ErrorBox text={list.error} retry={() => void list.reload()} /> : null}
      {list.loading && !list.data ? <Loading /> : null}
      {list.data ? (
        <div class="tbl-wrap">
          <table class="t">
            <thead><tr>{shown.map((c) => <th key={c.key}>{c.label}</th>)}<th><span class="sr-only">Tindakan</span></th></tr></thead>
            <tbody>
              {list.data.map((r) => (
                <tr key={p.idOf(r)}>
                  {shown.map((c) => <td key={c.key}>{cell(c, r[c.key])}</td>)}
                  <td>
                    <div class="row" style="gap:6px;flex-wrap:nowrap">
                      {p.extra?.(r, reload)}
                      {editable ? <button type="button" class="kebab" aria-label={`Sunting ${p.labelOf(r)}`} onClick={() => setEdit({ row: r, isNew: false })}><i class="ph ph-pencil-simple" aria-hidden="true" /></button> : null}
                      <button type="button" class="kebab" style="color:var(--red)" aria-label={`Padam ${p.labelOf(r)}`} onClick={() => void del(r)}><i class="ph ph-trash" aria-hidden="true" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.data.length ? <p class="small muted" style="padding:16px 0">Tiada rekod.</p> : null}
        </div>
      ) : null}
      {edit ? (
        <EditForm title={`${edit.isNew ? 'Tambah' : 'Sunting'}: ${p.title}`} cols={p.cols} row={edit.row} isNew={edit.isNew}
          onClose={() => setEdit(null)}
          onSave={async (body) => {
            const r = edit.isNew
              ? await act(() => adminApi('POST', p.base, body), 'Rekod ditambah.')
              : await act(() => adminApi('PUT', `${p.base}/${encodeURIComponent(p.idOf(edit.row))}`, body), 'Rekod disimpan.');
            if (r) {
              setEdit(null);
              reload();
            }
          }} />
      ) : null}
    </div>
  );
}

function cell(c: Col, v: unknown): ComponentChildren {
  if (v == null || v === '') return <span class="subtle">—</span>;
  switch (c.type) {
    case 'bool': return <span class={'toggle' + (v ? '' : ' off')} role="img" aria-label={v ? 'Ya' : 'Tidak'} />;
    case 'date': return dateMYT(String(v));
    case 'datetime': return dateTimeMYT(String(v));
    case 'select': return c.options?.find((o) => o.value === String(v))?.label ?? String(v);
    case 'phases': return Array.isArray(v) ? v.map((x: Row) => `${x.key} ${dateMYT(x.start as string)}–${dateMYT(x.end as string)}`).join(', ') : '—';
    case 'setting': return <span class="trunc">{typeof v === 'string' ? v : JSON.stringify(v)}</span>;
    case 'textarea': return <span class="trunc">{String(v)}</span>;
    default: return c.mono ? <span class="mask">{String(v)}</span> : String(v);
  }
}

type Phase = { key: string; start: string; end: string };

/** Form value (string / boolean / phases) for a column. */
function toForm(c: Col, v: unknown): unknown {
  if (c.type === 'bool') return v === true;
  if (c.type === 'datetime') return toLocalInput(v as string);
  if (c.type === 'phases') return Array.isArray(v) ? (v as Phase[]).map((x) => ({ ...x })) : [];
  if (c.type === 'setting') return v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v, null, 2);
  return v == null ? '' : String(v);
}

/** Back to the API value; throws a BM message when invalid. */
function fromForm(c: Col, v: unknown, original: unknown): unknown {
  if (c.type === 'bool') return v === true;
  if (c.type === 'phases') return v;
  const s = String(v ?? '').trim();
  if (!s) {
    if (c.required) throw new Error(`${c.label} wajib diisi.`);
    return null;
  }
  if (c.type === 'number') {
    const n = Number(s);
    if (!Number.isFinite(n)) throw new Error(`${c.label} mesti nombor.`);
    return n;
  }
  if (c.type === 'datetime') return fromLocalInput(s);
  if (c.type === 'setting') {
    if (original === undefined || original === null || typeof original === 'string') return String(v);
    try {
      return JSON.parse(s);
    } catch {
      throw new Error(`${c.label}: JSON tidak sah.`);
    }
  }
  return s;
}

function EditForm(p: { title: string; cols: Col[]; row: Row; isNew: boolean; onClose: () => void; onSave: (b: Row) => Promise<void> }) {
  const [f, setF] = useState<Row>(() => Object.fromEntries(p.cols.map((c) => [c.key, toForm(c, p.row[c.key])])));
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: unknown) => setF((cur) => ({ ...cur, [k]: v }));

  const submit = async (e: Event) => {
    e.preventDefault();
    setErr(null);
    const body: Row = {};
    try {
      for (const c of p.cols) {
        if (c.pk && !p.isNew) continue;
        const v = fromForm(c, f[c.key], p.row[c.key]);
        if (p.isNew || JSON.stringify(v) !== JSON.stringify(p.row[c.key] ?? null)) body[c.key] = v;
      }
    } catch (x) {
      setErr((x as Error).message);
      return;
    }
    if (!Object.keys(body).length) {
      p.onClose();
      return;
    }
    setBusy(true);
    await p.onSave(body);
    setBusy(false);
  };

  return (
    <Modal title={p.title} onClose={p.onClose} wide>
      <form onSubmit={submit}>
        <div class="form-grid">
          {p.cols.map((c) => {
            const id = `crud-${c.key}`;
            const v = f[c.key];
            const disabled = c.pk && !p.isNew;
            if (c.type === 'bool') {
              return (
                <label key={c.key} class="check span2" style="margin-top:8px">
                  <input id={id} type="checkbox" checked={v === true} onChange={(e) => set(c.key, (e.currentTarget as HTMLInputElement).checked)} /> {c.label}
                </label>
              );
            }
            if (c.type === 'phases') return <PhasesEditor key={c.key} value={v as Phase[]} onChange={(x) => set(c.key, x)} />;
            const common = { id, class: 'input', disabled, value: String(v ?? ''),
              onInput: (e: Event) => set(c.key, (e.currentTarget as HTMLInputElement).value) };
            let input;
            if (c.type === 'select') {
              input = (
                <select {...common} onChange={common.onInput}>
                  {!c.required ? <option value="">—</option> : null}
                  {(c.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              );
            } else if (c.type === 'textarea' || c.type === 'setting') {
              input = <textarea {...common} rows={c.type === 'setting' ? 5 : 3} style="min-height:auto" />;
            } else {
              const type = c.type === 'number' ? 'number' : c.type === 'date' ? 'date' : c.type === 'datetime' ? 'datetime-local' : 'text';
              input = <input {...common} type={type} step={c.type === 'number' ? 'any' : undefined} />;
            }
            return (
              <div key={c.key} class={'field' + (c.type === 'textarea' || c.type === 'setting' ? ' span2' : '')}>
                <label for={id}>{c.label}{c.required ? ' *' : ''}</label>
                {input}
                {c.hint ? <p class="hint">{c.hint}</p> : null}
              </div>
            );
          })}
        </div>
        {err ? <p class="error" role="alert"><i class="ph-fill ph-warning-circle" aria-hidden="true" /><span>{err}</span></p> : null}
        <div class="row" style="justify-content:flex-end;margin-top:16px">
          <Button variant="outline" sm onClick={p.onClose}>Batal</Button>
          <Button type="submit" sm loading={busy}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}

const PHASE_KEYS = ['rejab', 'syaaban', 'ramadan'];

function PhasesEditor(p: { value: Phase[]; onChange: (v: Phase[]) => void }) {
  const upd = (i: number, k: keyof Phase, v: string) => p.onChange(p.value.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div class="span2" style="margin-top:14px">
      <b style="color:var(--navy);font-size:14px">Fasa</b>
      {p.value.map((ph, i) => (
        <div key={i} class="row" style="padding:8px 0;border-bottom:1px solid #f1f5f9;flex-wrap:wrap">
          <select class="input sm" style="width:auto" aria-label="Fasa" value={ph.key} onChange={(e) => upd(i, 'key', (e.currentTarget as HTMLSelectElement).value)}>
            {PHASE_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input class="input sm" type="date" aria-label="Mula" style="width:auto" value={ph.start} onInput={(e) => upd(i, 'start', (e.currentTarget as HTMLInputElement).value)} />
          <input class="input sm" type="date" aria-label="Tamat" style="width:auto" value={ph.end} onInput={(e) => upd(i, 'end', (e.currentTarget as HTMLInputElement).value)} />
          <button type="button" class="kebab" aria-label="Buang fasa" onClick={() => p.onChange(p.value.filter((_, j) => j !== i))}><i class="ph ph-x" aria-hidden="true" /></button>
        </div>
      ))}
      <Button variant="outline" sm icon="ph-bold ph-plus" style="margin-top:8px"
        onClick={() => p.onChange([...p.value, { key: PHASE_KEYS[Math.min(p.value.length, 2)], start: '', end: '' }])}>Tambah fasa</Button>
    </div>
  );
}
