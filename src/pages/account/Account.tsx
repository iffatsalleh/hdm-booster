// Akaun (mockup akaun.html): name, read-only email/phone, packages & codes, redeem, password, PDPA, logout.
import { useState } from 'preact/hooks';
import { api } from '../../lib/api';
import { bm } from '../../lib/errors';
import { DEFAULT_SUPPORT_WA } from '../../lib/config';
import { initials, packageLabel } from '../../lib/home';
import { passwordChangeError, pdpaDeleteText, validatePasswordChange, type PwErrors } from '../../lib/account';
import { waLink } from '../../lib/wa';
import { changePassword, refresh, setting, signOut, useSession } from '../../state/session';
import { Layout } from '../../ui/Layout';
import { Button } from '../../ui/Button';
import { Callout, Card, HealthNote } from '../../ui/Card';
import { Field } from '../../ui/Field';
import { CodeRedeem } from '../../ui/CodeRedeem';
import { toast } from '../../ui/Toast';
import { dmy, useAccess } from './Codes';

const RO = 'background:#f8fafc;color:var(--muted)';

function NameEditor({ name, onDone }: { name: string; onDone: () => void }) {
  const [v, setV] = useState(name);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = async (e: Event) => {
    e.preventDefault();
    const n = v.trim().replace(/\s+/g, ' ');
    if (!n || n.length > 100) {
      setErr('Sila masukkan nama penuh (maksimum 100 aksara).');
      return;
    }
    setBusy(true);
    try {
      await api('PUT', '/api/me/name', { full_name: n });
      await refresh();
      toast('Nama dikemas kini.', 'green');
      onDone();
    } catch (x) {
      setErr(bm(x));
      setBusy(false);
    }
  };
  return (
    <form onSubmit={save} noValidate>
      <Field id="nama" label="Nama penuh" autocomplete="name" value={v} onInput={(x) => { setV(x); setErr(null); }} error={err} />
      <div class="grid2" style="margin-top:10px">
        <Button variant="outline" sm onClick={onDone}>Batal</Button>
        <Button type="submit" sm loading={busy}>Simpan</Button>
      </div>
    </form>
  );
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [conf, setConf] = useState('');
  const [errs, setErrs] = useState<PwErrors>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    const v = validatePasswordChange(cur, next, conf);
    setErrs(v);
    setFormErr(null);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      await changePassword(cur, next);
      toast('Kata laluan telah ditukar.', 'green');
      onDone();
    } catch (x) {
      const m = passwordChangeError(x);
      if (m?.field) setErrs({ [m.field]: m.message });
      else setFormErr(m?.message ?? bm(x));
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} noValidate style="padding:8px 0 14px">
      <Field id="pw-cur" label="Kata laluan semasa" type="password" autocomplete="current-password" value={cur} onInput={setCur} error={errs.current} />
      <Field id="pw-new" label="Kata laluan baharu" type="password" autocomplete="new-password" value={next} onInput={setNext}
        error={errs.next} hint="Sekurang-kurangnya 8 aksara" />
      <Field id="pw-conf" label="Taip semula kata laluan baharu" type="password" autocomplete="new-password" value={conf} onInput={setConf} error={errs.confirm} />
      {formErr ? <Callout tone="red" icon="ph-fill ph-warning-circle" style="margin-top:12px">{formErr}</Callout> : null}
      <p class="small" style="margin-top:10px"><a href="#/lupa">Lupa kata laluan semasa?</a></p>
      <div class="grid2" style="margin-top:12px">
        <Button variant="outline" sm onClick={onDone}>Batal</Button>
        <Button type="submit" sm loading={busy}>Tukar</Button>
      </div>
    </form>
  );
}

export function Account() {
  const s = useSession();
  const { data, err, reload } = useAccess();
  const [editName, setEditName] = useState(false);
  const [pw, setPw] = useState(false);
  const [out, setOut] = useState(false);
  const p = s.profile;
  const pkg = packageLabel(s.entitlements, s.catalog?.packages ?? []);
  const items = (s.catalog?.items ?? []).filter((i) => s.entitlements.has(i.key)).sort((a, b) => a.sort - b.sort);
  const wa = setting(s, 'support_wa', DEFAULT_SUPPORT_WA);

  return (
    <Layout route="akaun">
      <Card>
        {editName ? (
          <NameEditor name={p?.full_name ?? ''} onDone={() => setEditName(false)} />
        ) : (
          <div class="row">
            <span class="avatar" style="width:56px;height:56px;font-size:20px;flex:none" aria-hidden="true">{initials(p?.full_name)}</span>
            <div style="min-width:0">
              <h2 style="font-size:20px;overflow-wrap:anywhere">
                {p?.full_name ?? '-'}{' '}
                <button type="button" onClick={() => setEditName(true)} aria-label="Ubah nama"
                  style="background:none;border:0;padding:4px;cursor:pointer;vertical-align:middle">
                  <i class="ph ph-pencil-simple" style="color:var(--blue);font-size:18px" aria-hidden="true" />
                </button>
              </h2>
            </div>
          </div>
        )}
        <div class="field"><label for="ak-e">Emel</label><input id="ak-e" class="input" value={p?.email ?? ''} readOnly style={RO} /></div>
        <div class="field"><label for="ak-p">No. telefon</label><input id="ak-p" class="input" value={p?.phone ?? ''} readOnly style={RO} /></div>
        <p class="tiny subtle" style="margin-top:8px">Hubungi admin untuk tukar emel/telefon</p>
      </Card>

      <div class="section-title"><h2>Pakej &amp; akses</h2></div>
      <Card>
        <span class={`badge ${pkg.id === 'tiada' ? 'grey' : 'blue'}`}><i class="ph-bold ph-seal-check" aria-hidden="true" /> {pkg.label}</span>
        {err ? (
          <p class="small muted" style="margin-top:8px">{err} <a href="#/akaun" onClick={(e) => { e.preventDefault(); reload(); }}>Cuba lagi</a></p>
        ) : !data ? (
          <p class="small muted" style="margin-top:8px"><i class="ph-bold ph-spinner spin" aria-hidden="true" /> Memuatkan…</p>
        ) : (
          <>
            {data.purchases.map((x) => (
              <p key={x.id} class="small muted" style="margin-top:8px">
                {[x.package_name, x.order_ref, dmy(x.paid_at), x.amount_rm != null ? `RM${Number(x.amount_rm)}` : ''].filter(Boolean).join(' · ')}
              </p>
            ))}
            {data.codes.map((c) => (
              <p key={c.id} class="small muted" style="margin-top:8px">
                Kod {c.code}{c.package_name ? ` · ${c.package_name}` : ''}{c.redeemed_at ? ` · ${dmy(c.redeemed_at)}` : ''}
              </p>
            ))}
            {!data.purchases.length && !data.codes.length ? (
              <p class="small muted" style="margin-top:8px">Tiada rekod pembelian atau kod pada akaun ini.</p>
            ) : null}
          </>
        )}
        {items.length ? (
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px" aria-label="Akses anda">
            {items.map((i) => <span key={i.key} class="chip">{i.name}</span>)}
          </div>
        ) : null}
      </Card>

      <Card>
        <CodeRedeem id="ak-kod" onRedeemed={reload} />
        <p class="tiny subtle" style="margin-top:8px"><a href="#/akaun/kod">Lihat kod yang telah ditebus</a></p>
      </Card>

      <Card style="padding-top:4px;padding-bottom:4px;margin-top:12px">
        <a class="listrow" href="#/akaun" aria-expanded={pw} onClick={(e) => { e.preventDefault(); setPw(!pw); }}>
          <i class="ph-bold ph-lock-key" aria-hidden="true" /> Tukar kata laluan <i class={`ph ${pw ? 'ph-caret-down' : 'ph-caret-right'}`} aria-hidden="true" />
        </a>
        {pw ? <PasswordForm onDone={() => setPw(false)} /> : null}
        <a class="listrow" href="#/bantuan"><i class="ph-bold ph-lifebuoy" aria-hidden="true" /> Bantuan <i class="ph ph-caret-right" aria-hidden="true" /></a>
        <a class="listrow" href={waLink(wa, pdpaDeleteText(p?.full_name, p?.email))} target="_blank" rel="noopener noreferrer">
          <i class="ph-bold ph-whatsapp-logo" aria-hidden="true" /> Minta padam data (PDPA) <i class="ph ph-caret-right" aria-hidden="true" />
        </a>
      </Card>

      <Button variant="danger-t" block icon="ph-bold ph-sign-out" loading={out} style="margin-top:12px"
        onClick={async () => { setOut(true); try { await signOut(); } finally { setOut(false); } }}>
        Log keluar
      </Button>
      <HealthNote />
    </Layout>
  );
}
