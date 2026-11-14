import { useState } from 'preact/hooks';
import { Field } from '../../ui/Field';
import { Button } from '../../ui/Button';
import { Callout, HealthNote } from '../../ui/Card';
import { bm } from '../../lib/errors';
import { waLink } from '../../lib/wa';
import { DEFAULT_SUPPORT_WA } from '../../lib/config';
import { signIn, settled } from '../../state/session';
import { navigate } from '../../router';

export function Login({ next }: { next?: string } = {}) {
  const toAktif = next === 'aktif';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setErr('Sila masukkan emel dan kata laluan.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await signIn(email, password);
      const s = await settled();
      navigate(s.profile && !s.profile.onboarded_at ? '#/onboarding' : toAktif ? '#/aktif' : '#/', true);
    } catch (x) {
      setErr(bm(x));
      setBusy(false);
    }
  };

  return (
    <div class="phone no-tabs">
      <section class="hero hero-band" style="border-radius:0 0 24px 24px;padding-bottom:44px">
        <span class="wordmark">HDM <b>BOOSTER</b></span>
        <div style="margin-top:18px">
          <span class="pill-t"><i class="ph-fill ph-moon-stars" aria-hidden="true" /> Rejab · Syaaban · Ramadan</span>
        </div>
        <h1 style="font-size:26px;margin-top:14px">Selamat kembali</h1>
      </section>
      <main style="padding:0 16px">
        <form class="card overlap" style="margin:-24px 0 0" onSubmit={submit} noValidate>
          {toAktif ? (
            <Callout tone="blue" icon="ph-fill ph-ticket" style="margin-bottom:12px">Ada kod? Log masuk dahulu, kemudian masukkan kod anda.</Callout>
          ) : null}
          <Field id="e" label="Emel" type="email" autocomplete="email" inputMode="email" value={email} onInput={setEmail} />
          <Field id="k" label="Kata laluan" type="password" autocomplete="current-password" value={password} onInput={setPassword} />
          <p style="text-align:right;margin-top:10px;font-size:14px"><a href="#/lupa">Lupa kata laluan?</a></p>
          {err ? <Callout tone="red" icon="ph-fill ph-warning-circle" style="margin-top:12px">{err}</Callout> : null}
          <Button type="submit" block loading={busy} style="margin-top:14px">Log Masuk</Button>
          <div class="divider">Belum ada akaun?</div>
          <Button href="#/daftar" variant="outline" block>Daftar akaun</Button>
        </form>
        <Button
          href={waLink(DEFAULT_SUPPORT_WA, 'Salam, saya perlukan bantuan log masuk HDM BOOSTER.')}
          external
          variant="green-o"
          block
          icon="ph-bold ph-whatsapp-logo"
          style="margin-top:16px"
        >
          Perlukan bantuan? WhatsApp {DEFAULT_SUPPORT_WA}
        </Button>
        <p class="linkrow" style="margin-top:12px"><a href="#/bantuan">Bantuan &amp; soalan lazim</a></p>
        <HealthNote />
      </main>
    </div>
  );
}
