// #/admin/audit — audit_logs, newest first (server order), filter by action / actor.
import { useMemo, useState } from 'preact/hooks';
import { dateTimeMYT } from '../../lib/admin';
import { adminApi, AdminShell, ErrorBox, Loading, Select, useLoad, type Row } from './ui';

export function Audit() {
  const list = useLoad(() => adminApi<Row[]>('GET', '/api/admin/audit?limit=200'), []);
  const people = useLoad(() => adminApi<Row[]>('GET', '/api/admin/participants'), []);
  const names = useMemo(() => new Map((people.data ?? []).map((u) => [String(u.id), String(u.full_name ?? u.email ?? u.id)])), [people.data]);
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const rows = list.data ?? [];
  const actions = [...new Set(rows.map((r) => String(r.action)))].sort();
  const actors = [...new Set(rows.map((r) => String(r.actor ?? '')))].filter(Boolean);
  const shown = rows.filter((r) => (!action || r.action === action) && (!actor || r.actor === actor));

  return (
    <AdminShell section="audit" title="Audit">
      <section class="card">
        <div class="toolbar">
          <Select id="au-actor" ariaLabel="Pelaku" sm style="width:auto" value={actor} onChange={setActor}
            options={[{ value: '', label: 'Semua pelaku' }, ...actors.map((a) => ({ value: a, label: names.get(a) ?? a }))]} />
          <Select id="au-action" ariaLabel="Tindakan" sm style="width:auto" value={action} onChange={setAction}
            options={[{ value: '', label: 'Semua tindakan' }, ...actions.map((a) => ({ value: a, label: a }))]} />
        </div>
        {list.error ? <ErrorBox text={list.error} retry={() => void list.reload()} /> : null}
        {list.loading && !list.data ? <Loading /> : null}
        {list.data ? (
          <div class="tbl-wrap">
            <table class="t">
              <thead><tr><th>Masa</th><th>Pelaku</th><th>Tindakan</th><th>Sasaran</th><th>Butiran</th></tr></thead>
              <tbody>
                {shown.map((r) => {
                  const id = String(r.id);
                  const detail = r.detail == null ? '' : JSON.stringify(r.detail);
                  return (
                    <tr key={id}>
                      <td style="white-space:nowrap">{dateTimeMYT(r.at as string)}</td>
                      <td><b>{names.get(String(r.actor)) ?? String(r.actor ?? '—')}</b></td>
                      <td><span class="mono">{String(r.action)}</span></td>
                      <td><span class="small muted">{String(r.target_type ?? '')}</span> <span class="mask">{String(r.target_id ?? '')}</span></td>
                      <td>
                        {open === id ? <pre class="pre">{JSON.stringify(r.detail, null, 2)}</pre> : <span class="trunc">{detail}</span>}
                        {detail ? <> <button type="button" class="linkbtn small" onClick={() => setOpen(open === id ? null : id)}>{open === id ? 'tutup' : 'lihat'}</button></> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!shown.length ? <p class="small muted" style="padding:16px 0">Tiada entri.</p> : null}
          </div>
        ) : null}
        {list.data ? <div class="pager"><span>{shown.length} daripada {rows.length} entri terkini</span></div> : null}
      </section>
    </AdminShell>
  );
}
