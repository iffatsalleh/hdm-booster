// Kod akses (#/akaun/kod): redeem form + codes already redeemed on this account.
import { useEffect, useState } from 'preact/hooks';
import { api } from '../../lib/api';
import { bm } from '../../lib/errors';
import { formatDMY, todayMYT } from '../../lib/dates';
import { Layout } from '../../ui/Layout';
import { Card, HealthNote } from '../../ui/Card';
import { CodeRedeem } from '../../ui/CodeRedeem';
import { Button } from '../../ui/Button';

export type AccessPurchase = {
  id: string; order_ref: string | null; package_id: string | null; package_name: string | null; status: string;
  amount_rm: number | string | null; paid_at: string | null; batch_id: string | null; entitlements: string[];
};
export type AccessCode = {
  id: string; code: string; package_id: string | null; package_name: string | null; status: string; batch_id: string | null;
  redeemed_at: string | null; access_starts_at: string | null; access_ends_at: string | null; entitlements: string[];
};
export type AccessSummary = { purchases: AccessPurchase[]; codes: AccessCode[] };

/** Timestamp -> dd/mm/yyyy in MYT ('' when missing). */
export const dmy = (ts: string | null | undefined) => (ts ? formatDMY(todayMYT(new Date(ts))) : '');

export function useAccess(): { data: AccessSummary | null; err: string | null; reload: () => void } {
  const [data, setData] = useState<AccessSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true;
    setErr(null);
    api<AccessSummary>('GET', '/api/me/access')
      .then((d) => live && setData({ purchases: d?.purchases ?? [], codes: d?.codes ?? [] }))
      .catch((e) => live && setErr(bm(e)));
    return () => {
      live = false;
    };
  }, [n]);
  return { data, err, reload: () => setN((x) => x + 1) };
}

export function UnlockedLinks() {
  return (
    <div class="grid2" style="margin-top:12px">
      <Button href="#/ebook" variant="outline" sm icon="ph-bold ph-books">Buka Ebook</Button>
      <Button href="#/group" variant="outline" sm icon="ph-bold ph-users-three">Lihat Group</Button>
    </div>
  );
}

export function Codes() {
  const { data, reload } = useAccess();
  const [ok, setOk] = useState(false);
  return (
    <Layout route="akaun_kod" title="Kod akses" back="#/akaun">
      <Card>
        <CodeRedeem id="kod-akses" onRedeemed={() => { setOk(true); reload(); }} />
        <p class="hint" style="margin-top:10px">Kod diberi oleh admin, contohnya untuk naik taraf. Huruf kecil, ruang dan sengkang tidak mengapa.</p>
        {ok ? <UnlockedLinks /> : null}
      </Card>
      {data && data.codes.length ? (
        <>
          <div class="section-title"><h2>Kod yang telah ditebus</h2></div>
          <Card style="padding-top:4px;padding-bottom:4px">
            {data.codes.map((c) => (
              <div key={c.id} class="listrow" style="font-weight:600">
                <i class="ph-bold ph-ticket" aria-hidden="true" />
                <span style="min-width:0">
                  <span class="num" style="display:block;letter-spacing:.5px">{c.code}</span>
                  <span class="small muted">{[c.package_name, dmy(c.redeemed_at)].filter(Boolean).join(' · ')}</span>
                </span>
              </div>
            ))}
          </Card>
        </>
      ) : null}
      <HealthNote />
    </Layout>
  );
}
