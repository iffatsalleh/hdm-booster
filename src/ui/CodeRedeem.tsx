// "Ada kod akses?" form: normalise -> POST /api/codes/redeem -> refresh session so new items unlock now.
import { useState } from 'preact/hooks';
import { api } from '../lib/api';
import { bm } from '../lib/errors';
import { itemNames, prepareCode, redeemSuccessText } from '../lib/redeem';
import { refresh, useSession } from '../state/session';
import { Button } from './Button';
import { ErrorText } from './Form';

export function CodeRedeem(p: { id?: string; title?: string; onRedeemed?: (items: string[]) => void; autoFocus?: boolean }) {
  const s = useSession();
  const id = p.id ?? 'kod';
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string[] | null>(null);

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    setDone(null);
    const c = prepareCode(code);
    if (!c.ok) {
      setErr(c.error);
      document.getElementById(id)?.focus();
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const r = await api<{ items: string[] }>('POST', '/api/codes/redeem', { code: c.code });
      const items = Array.isArray(r?.items) ? r.items : [];
      await refresh();
      setCode('');
      setDone(items);
      p.onRedeemed?.(items);
    } catch (x) {
      setErr(bm(x));
    } finally {
      setBusy(false);
    }
  };

  const names = done ? itemNames(done, s.catalog?.items) : [];
  return (
    <form onSubmit={submit} noValidate>
      <h3 style="font-size:16px"><label for={id}>{p.title ?? 'Ada kod akses?'}</label></h3>
      <div class="row" style="margin-top:10px;align-items:stretch">
        <input id={id} class={'input' + (err ? ' err' : '')} placeholder="HDMB-XXXX-XXXX" autocomplete="off" autocapitalize="characters"
          spellcheck={false} style="min-width:0;flex:1;text-transform:uppercase" value={code} autoFocus={p.autoFocus}
          aria-invalid={err ? 'true' : undefined} aria-describedby={err ? `${id}-err` : undefined}
          onInput={(e) => { setCode((e.currentTarget as HTMLInputElement).value); if (err) setErr(null); }} />
        <Button type="submit" loading={busy}>Tebus</Button>
      </div>
      <ErrorText id={`${id}-err`} text={err} />
      {done ? (
        <div class="callout green" role="status" style="margin-top:12px">
          <i class="ph-fill ph-check-circle" aria-hidden="true" />
          <span>
            {redeemSuccessText(done)}
            {names.length ? <span style="display:block;font-weight:500;margin-top:4px">{names.join(', ')}</span> : null}
          </span>
        </div>
      ) : null}
    </form>
  );
}
