import { useState } from 'preact/hooks';
import { Field } from '../../ui/Field';
import { Button } from '../../ui/Button';
import { Callout } from '../../ui/Card';
import { bm } from '../../lib/errors';
import { resetPassword } from '../../state/session';

export function Forgot() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setErr('Emel tidak sah.');
      return;
    }
    setBusy(true);
    setErr(null);
    setSentTo(null);
    try {
      await resetPassword(v);
      setSentTo(v);
    } catch (x) {
      setErr(bm(x));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class="phone no-tabs">
      <header class="titlebar">
        <a class="back" href="#/masuk" aria-label="Kembali"><i class="ph-bold ph-caret-left" aria-hidden="true" /></a>
        <div><h1>Kata laluan</h1></div>
      </header>
      <main class="page">
        <form class="card" style="text-align:center" onSubmit={submit} noValidate>
          <span class="ic blue" style="margin:0 auto"><i class="ph-bold ph-key" aria-hidden="true" /></span>
          <h2 style="font-size:22px;margin-top:12px">Lupa kata laluan?</h2>
          <p class="muted" style="margin-top:6px">Masukkan emel anda. Kami akan hantar pautan untuk tetapkan kata laluan baharu.</p>
          <Field id="e" label="Emel" type="email" autocomplete="email" inputMode="email" value={email} onInput={setEmail}
            error={err} style="text-align:left;margin-top:16px" />
          <Button type="submit" block loading={busy} style="margin-top:16px">Hantar pautan</Button>
        </form>
        {sentTo ? (
          <Callout tone="green" icon="ph-fill ph-check-circle" style="margin-top:12px">
            Pautan telah dihantar ke {sentTo}. Semak inbox &amp; folder Spam.
          </Callout>
        ) : null}
        <p class="linkrow" style="margin-top:16px"><a href="#/masuk">Kembali ke Log Masuk</a></p>
      </main>
    </div>
  );
}
