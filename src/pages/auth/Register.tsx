// Registration: the Worker creates the Firebase account (never the browser), then we sign in.
import { useState } from 'preact/hooks';
import { Field } from '../../ui/Field';
import { Button } from '../../ui/Button';
import { Callout, HealthNote } from '../../ui/Card';
import { toast } from '../../ui/Toast';
import { api } from '../../lib/api';
import { ApiError, bm } from '../../lib/errors';
import { normalizePhone } from '../../lib/phone';
import { signIn, settled } from '../../state/session';
import { navigate } from '../../router';

type Errs = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'ack' | 'form', string>>;

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [ack, setAck] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState<Errs>({});

  const validate = (): Errs => {
    const e: Errs = {};
    if (!name.trim()) e.name = 'Sila masukkan nama penuh.';
    else if (name.trim().length > 100) e.name = 'Nama maksimum 100 aksara.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Emel tidak sah.';
    if (!normalizePhone(phone)) e.phone = 'Nombor telefon tidak sah. Contoh: 012-345 6789.';
    if (password.length < 8) e.password = 'Kata laluan mesti sekurang-kurangnya 8 aksara.';
    if (!ack) e.ack = 'Sila tandakan persetujuan Notis Privasi untuk meneruskan.';
    return e;
  };

  const submit = async (ev: Event) => {
    ev.preventDefault();
    if (busy) return;
    const e = validate();
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await api('POST', '/api/register', { name: name.trim(), email: email.trim(), phone, password, privacyAck: true });
    } catch (x) {
      const r = x instanceof ApiError ? x.reason : '';
      const msg = bm(x);
      setErrs(r === 'tiada_pembelian' ? { phone: msg } : r === 'sudah_didaftar' ? { email: msg } : { form: msg });
      setBusy(false);
      return;
    }
    try {
      await signIn(email, password);
      await settled();
      navigate('#/onboarding', true);
    } catch (x) {
      // account exists now; let the user sign in by hand
      toast(`Akaun berjaya didaftar. ${bm(x)} Sila log masuk.`, 'yellow', 6000);
      navigate('#/masuk', true);
    }
  };

  return (
    <div class="phone no-tabs">
      <section class="hero hero-band" style="border-radius:0">
        <span class="wordmark">HDM <b>BOOSTER</b></span>
        <h1 style="font-size:26px;margin:18px 0 4px">Daftar akaun</h1>
        <p class="small">Untuk pembeli HDM BOOSTER</p>
      </section>
      <main class="page">
        <Callout tone="blue" icon="ph-fill ph-info">Guna emel &amp; no. telefon yang SAMA seperti semasa beli di BCL.</Callout>
        <form class="card" style="margin-top:12px" onSubmit={submit} noValidate>
          <Field id="n" label="Nama penuh" autocomplete="name" value={name} onInput={setName} error={errs.name} />
          <Field id="e" label="Emel" type="email" autocomplete="email" inputMode="email" value={email} onInput={setEmail} error={errs.email} />
          <Field id="p" label="No. telefon" type="tel" autocomplete="tel" inputMode="tel" placeholder="012-345 6789"
            value={phone} onInput={setPhone} error={errs.phone} />
          <Field id="k" label="Kata laluan" type="password" autocomplete="new-password" value={password} onInput={setPassword}
            error={errs.password} hint="Sekurang-kurangnya 8 aksara" />

          <label class="check" style="margin-top:16px;cursor:pointer">
            <input type="checkbox" class="sr-only" checked={ack} onChange={(e) => setAck((e.currentTarget as HTMLInputElement).checked)}
              aria-describedby={errs.ack ? 'ack-err' : undefined} />
            <span class={'box' + (ack ? '' : ' off')} aria-hidden="true">{ack ? <i class="ph-bold ph-check" /> : null}</span>
            <span>
              Saya bersetuju dengan{' '}
              <a href="#/daftar" onClick={(e) => { e.preventDefault(); setShowNotice(!showNotice); }} aria-expanded={showNotice}
                aria-controls="pdpa">Notis Privasi (PDPA)</a>
            </span>
          </label>
          {showNotice ? (
            <div id="pdpa" class="callout blue small" style="margin-top:10px;display:block;font-weight:500;line-height:1.5">
              <p><b>Notis Privasi (PDPA).</b> Kami mengumpul nama, emel, nombor telefon dan data kesihatan yang anda masukkan
                (contohnya berat, ukuran dan sasaran) untuk menyediakan program HDM BOOSTER, menyemak pembelian anda dan
                menghubungi anda tentang program.</p>
              <p style="margin-top:6px">Akaun log masuk diurus oleh Google Firebase, dan aplikasi ini berjalan melalui Cloudflare.
                Penyedia ini mungkin memproses dan menyimpan data anda di pelayan <b>di luar Malaysia</b>.</p>
              <p style="margin-top:6px">Data anda tidak dijual. Anda boleh meminta salinan, pembetulan atau pemadaman data
                dengan menghubungi kami melalui WhatsApp 60134417042.</p>
            </div>
          ) : null}
          {errs.ack ? (
            <p class="error" id="ack-err"><i class="ph-fill ph-warning-circle" aria-hidden="true" /><span>{errs.ack}</span></p>
          ) : null}
          {errs.form ? <Callout tone="red" icon="ph-fill ph-warning-circle" style="margin-top:12px">{errs.form}</Callout> : null}
          <Button type="submit" block pulse loading={busy} style="margin-top:18px">Daftar</Button>
        </form>
        <p class="linkrow" style="margin-top:16px">Sudah ada akaun? <a href="#/masuk">Log masuk</a></p>
        <p class="linkrow" style="margin-top:8px">Ada kod akses? <a href="#/aktif">Log masuk dahulu</a></p>
        <HealthNote />
      </main>
    </div>
  );
}
