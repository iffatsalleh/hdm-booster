// #/admin/peserta (+ /:uid detail drawer) — coach + superadmin may read; only superadmin sees grant / revoke /
// reset password. The temporary password is shown once (component state only, never stored).
import { useState } from 'preact/hooks';
import { buildQuery, canMutate, dateMYT, dateTimeMYT, listTotal } from '../../lib/admin';
import { birthYearToAge } from '../../lib/onboarding';
import { initials, packageLabel } from '../../lib/home';
import { waLink } from '../../lib/wa';
import { navigate } from '../../router';
import { useSession } from '../../state/session';
import { Button } from '../../ui/Button';
import {
  act, adminApi, AdminShell, confirmed, copyText, ErrorBox, Loading, PkgBadge, SearchBox, Select, StatusBadge, useLoad, type Row,
} from './ui';

type Detail = { profile: Row; roles: string[]; entitlements: string[]; purchases: Row[]; codes: Row[]; grants: Row[] };

const PKG_TONE: Record<string, string> = { complete: 'navy', basic: 'blue', separa: 'violet', tiada: 'grey' };

export function Participants(p: { uid?: string }) {
  const s = useSession();
  const [q, setQ] = useState('');
  const list = useLoad(() => adminApi<Row[]>('GET', '/api/admin/participants' + buildQuery({ q })), [q]);
  const pkgs = s.catalog?.packages ?? [];
  const readOnly = !canMutate(s.roles);

  return (
    <AdminShell section="peserta" title="Peserta"
      head={readOnly ? <span class="chip" title="Coach hanya boleh melihat, tidak boleh mengubah"><i class="ph ph-eye" aria-hidden="true" /> Coach: baca sahaja</span> : null}>
      <div class={'peserta-grid' + (p.uid ? ' has-detail' : '')}>
        <div class="card list-pane">
          <div class="toolbar"><SearchBox placeholder="Cari nama, emel, telefon" value={q} onSearch={setQ} /></div>
          {list.error ? <ErrorBox text={list.error} retry={() => void list.reload()} /> : null}
          {list.loading && !list.data ? <Loading /> : null}
          {list.data ? (
            <div class="tbl-wrap">
              <table class="t">
                <thead><tr><th>Nama</th><th>Emel</th><th>Telefon</th><th>Pakej</th><th>Onboarding</th><th>Daftar pada</th></tr></thead>
                <tbody>
                  {list.data.map((u) => {
                    const pk = packageLabel(new Set((u.entitlements as string[]) ?? []), pkgs);
                    const on = p.uid === u.id;
                    const href = `#/admin/peserta/${encodeURIComponent(String(u.id))}`;
                    return (
                      <tr key={String(u.id)} class="clickable" style={on ? 'background:var(--blue-t)' : undefined} onClick={() => navigate(href)}>
                        <td><a href={href} style="color:inherit"><b>{String(u.full_name ?? '—')}</b></a></td>
                        <td>{String(u.email ?? '—')}</td>
                        <td>{String(u.phone ?? '—')}</td>
                        <td><span class={`badge ${PKG_TONE[pk.id]}`}>{pk.id === 'complete' ? 'Complete' : pk.id === 'basic' ? 'Basic' : pk.id === 'separa' ? 'Separa' : 'Tiada'}</span></td>
                        <td>{u.onboarded_at ? <span aria-label="Selesai">✓</span> : <span aria-label="Belum">–</span>}</td>
                        <td>{dateMYT(u.created_at as string)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!list.data.length ? <p class="small muted" style="padding:16px 0">Tiada peserta.</p> : null}
            </div>
          ) : null}
          {list.data ? <div class="pager"><span>{list.data.length < listTotal(list.data) ? `${list.data.length} terkini daripada ${listTotal(list.data)} peserta (guna carian / Export untuk semua)` : `${list.data.length} peserta`}</span></div> : null}
        </div>
        {p.uid ? <ParticipantDrawer key={p.uid} uid={p.uid} readOnly={readOnly} onChanged={() => void list.reload()} /> : null}
      </div>
    </AdminShell>
  );
}

function ParticipantDrawer(p: { uid: string; readOnly: boolean; onChanged: () => void }) {
  const s = useSession();
  const items = s.catalog?.items ?? [];
  const itemName = (k: string) => items.find((i) => i.key === k)?.name ?? k;
  const d = useLoad(() => adminApi<Detail>('GET', `/api/admin/participants/${encodeURIComponent(p.uid)}`), [p.uid]);
  const [item, setItem] = useState(items[0]?.key ?? '');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [tempPw, setTempPw] = useState<string | null>(null);

  const reload = () => {
    void d.reload();
    p.onChanged();
  };

  const close = (
    <a class="kebab" href="#/admin/peserta" aria-label="Tutup butiran"><i class="ph ph-x" aria-hidden="true" /></a>
  );
  if (d.error) return <aside class="drawer"><div class="row between" style="margin-bottom:10px"><b>Butiran peserta</b>{close}</div><ErrorBox text={d.error} retry={() => void d.reload()} /></aside>;
  if (!d.data) return <aside class="drawer"><Loading /></aside>;
  const { profile: pr, roles, entitlements, purchases, codes, grants } = d.data;
  const name = String(pr.full_name ?? '—');
  const age = birthYearToAge(pr.birth_year);
  const basics = [pr.sex === 'L' ? 'Lelaki' : pr.sex === 'P' ? 'Perempuan' : null, age != null ? `${age} tahun` : null,
    pr.height_cm ? `${pr.height_cm} cm` : null, pr.start_weight_kg ? `${pr.start_weight_kg} kg` : null].filter(Boolean).join(' · ');

  const grant = async (e: Event) => {
    e.preventDefault();
    if (!item) return;
    setBusy('grant');
    const r = await act(() => adminApi('POST', `/api/admin/participants/${encodeURIComponent(p.uid)}/grant`, { item_key: item, reason: reason.trim() || null }), 'Akses ditambah.');
    setBusy(null);
    if (r) {
      setReason('');
      reload();
    }
  };
  const revoke = async (g: Row) => {
    const ok = await confirmed('grant.revoke', {
      title: 'Tarik balik akses?', confirm: 'Ya, tarik balik', danger: true,
      text: <><b>{itemName(String(g.item_key))}</b> akan ditarik balik daripada {name}.</>,
    });
    if (!ok) return;
    const r = await act(() => adminApi('POST', `/api/admin/grants/${g.id}/revoke`), 'Akses ditarik balik.');
    if (r) reload();
  };
  const reset = async () => {
    const ok = await confirmed('participant.reset_password', {
      title: 'Reset kata laluan?', confirm: 'Ya, reset', danger: true,
      text: <>Kata laluan {name} akan diganti dengan kata laluan sementara. Kata laluan lama tidak lagi boleh digunakan.</>,
    });
    if (!ok) return;
    setBusy('reset');
    const r = await act(() => adminApi<{ password: string }>('POST', `/api/admin/participants/${encodeURIComponent(p.uid)}/reset-password`));
    setBusy(null);
    if (r) setTempPw(r.password);
  };

  return (
    <aside class="drawer" aria-label={`Butiran ${name}`}>
      <div class="row between">
        <div class="row" style="min-width:0">
          <span class="avatar">{initials(pr.full_name as string)}</span>
          <div style="min-width:0"><h2 style="font-size:20px;overflow-wrap:anywhere">{name}</h2><div class="small muted" style="overflow-wrap:anywhere">{String(pr.email ?? '')}</div></div>
        </div>
        {close}
      </div>
      {roles.length ? <div class="chips" style="margin-top:8px">{roles.map((r) => <span key={r} class="badge navy">{r}</span>)}</div> : null}
      {p.readOnly ? <p class="tiny muted" style="margin-top:10px"><i class="ph ph-eye" aria-hidden="true" /> Paparan coach: baca sahaja.</p> : null}

      <h3 class="dh">Profil</h3>
      <dl class="kv">
        <dt>Telefon</dt><dd>{String(pr.phone ?? '—')}</dd>
        <dt>Asas</dt><dd>{basics || '—'}</dd>
        <dt>Sasaran</dt><dd>{pr.target_weight_kg ? `${pr.target_weight_kg} kg` : '—'}</dd>
        <dt>Protein</dt><dd>{pr.protein_target_g ? `${pr.protein_target_g} g sehari` : '—'}</dd>
        <dt>Onboarding</dt><dd>{pr.onboarded_at ? dateTimeMYT(pr.onboarded_at as string) : 'Belum'}</dd>
        <dt>Daftar</dt><dd>{dateTimeMYT(pr.created_at as string)}</dd>
      </dl>

      <h3 class="dh">Hak akses ({entitlements.length})</h3>
      <div class="chips">{entitlements.length ? entitlements.map((k) => <span key={k} class="chip">{itemName(k)}</span>) : <span class="small muted">Tiada</span>}</div>

      <h3 class="dh">Pembelian</h3>
      {purchases.length ? purchases.map((x) => (
        <div class="li" key={String(x.id)}><div><span class="mono num" style="font-size:13px">{String(x.order_ref)}</span> <span class="small muted">{dateMYT(x.paid_at as string)}</span> <PkgBadge id={x.package_id} name={x.package_name ?? s.catalog?.packages.find((k) => k.id === x.package_id)?.name} /></div><StatusBadge s={x.status} /></div>
      )) : <p class="small muted">Tiada</p>}

      <h3 class="dh">Kod</h3>
      {codes.length ? codes.map((c) => (
        <div class="li" key={String(c.id)}><div><span class="mono num" style="font-size:13px">{String(c.code)}</span> <span class="small muted">ditebus {dateMYT(c.redeemed_at as string)}</span></div><StatusBadge s={c.status} /></div>
      )) : <p class="small muted">Tiada</p>}

      <h3 class="dh">Pemberian manual</h3>
      {!p.readOnly ? (
        <form onSubmit={grant}>
          <Select id="grant-item" ariaLabel="Item" sm value={item} onChange={setItem} options={items.map((i) => ({ value: i.key, label: i.name }))} />
          <div class="row" style="margin-top:8px">
            <input class="input sm" placeholder="Sebab pemberian" aria-label="Sebab pemberian" value={reason} maxLength={500}
              onInput={(e) => setReason((e.currentTarget as HTMLInputElement).value)} />
            <Button type="submit" sm loading={busy === 'grant'}>Tambah</Button>
          </div>
        </form>
      ) : null}
      {grants.length ? grants.map((g) => (
        <div class="li" key={String(g.id)}>
          <div style="min-width:0"><b>{itemName(String(g.item_key))}</b>
            <div class="small muted">{g.reason ? `Sebab: ${String(g.reason)} · ` : ''}{dateMYT(g.created_at as string)}{g.revoked_at ? ` · ditarik ${dateMYT(g.revoked_at as string)}` : ''}</div></div>
          {g.revoked_at ? <span class="badge grey">ditarik</span>
            : !p.readOnly ? <Button sm variant="danger-t" onClick={() => void revoke(g)}>Tarik balik</Button> : <span class="badge green">aktif</span>}
        </div>
      )) : <p class="small muted" style="margin-top:6px">Tiada</p>}

      <div style="margin-top:16px;display:flex;flex-direction:column;gap:10px">
        {!p.readOnly ? <Button variant="outline" sm icon="ph ph-key" loading={busy === 'reset'} onClick={() => void reset()}>Reset kata laluan</Button> : null}
        {tempPw ? (
          <div class="callout yellow" role="status">
            <i class="ph-fill ph-warning" aria-hidden="true" />
            <div>Kata laluan sementara
              <div class="num" style="font-size:20px;letter-spacing:.08em;margin:4px 0;overflow-wrap:anywhere">{tempPw}</div>
              <div class="row" style="flex-wrap:wrap"><Button variant="outline" sm icon="ph ph-copy" onClick={() => void copyText(tempPw)}>Salin</Button><span class="small">Dipaparkan sekali sahaja</span></div>
            </div>
          </div>
        ) : null}
        {pr.phone ? (
          <Button variant="green" icon="ph-fill ph-whatsapp-logo" external href={waLink(String(pr.phone), `Salam ${name}, `)}>WhatsApp peserta</Button>
        ) : null}
      </div>
    </aside>
  );
}
