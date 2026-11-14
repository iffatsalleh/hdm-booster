// #/aktif: activation link sent with a code (signed-out users are sent to #/masuk?next=aktif by the guard).
import { useState } from 'preact/hooks';
import { useSession } from '../state/session';
import { Layout } from '../ui/Layout';
import { Card, HealthNote } from '../ui/Card';
import { CodeRedeem } from '../ui/CodeRedeem';
import { UnlockedLinks } from './account/Codes';

export function Aktif() {
  const s = useSession();
  const [ok, setOk] = useState(false);
  return (
    <Layout route="aktif" title="Aktifkan pakej" back="#/">
      <Card>
        <p class="small muted" style="margin-bottom:12px">
          Log masuk sebagai <b>{s.profile?.email ?? '-'}</b>. Masukkan kod akses yang anda terima untuk membuka pakej anda.
        </p>
        <CodeRedeem id="kod-aktif" title="Kod akses" autoFocus onRedeemed={() => setOk(true)} />
        {ok ? <UnlockedLinks /> : null}
      </Card>
      <HealthNote />
    </Layout>
  );
}
