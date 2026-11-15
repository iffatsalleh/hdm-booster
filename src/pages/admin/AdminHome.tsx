// #/admin — Ringkasan: admin_summary tiles (coach + superadmin), perlu-semakan list (superadmin), Hyperdrive info.
import { isSuperadmin } from '../../lib/admin';
import { useSession } from '../../state/session';
import { Button } from '../../ui/Button';
import { adminApi, AdminShell, ErrorBox, Loading, useLoad, type Row } from './ui';

type Summary = {
  participants: number;
  onboarded: number;
  purchases: Record<string, number>;
  codes: Record<string, number>;
  perlu_semakan: number;
};

const n = (v: number | undefined) => (v ?? 0).toLocaleString('en-US');

export function AdminHome() {
  const s = useSession();
  const sa = isSuperadmin(s.roles);
  const sum = useLoad(() => adminApi<Summary>('GET', '/api/admin/summary'), []);
  const review = useLoad(
    () => (sa ? adminApi<Row[]>('GET', '/api/admin/purchases?status=perlu_semakan') : Promise.resolve([] as Row[])),
    [sa],
  );
  const d = sum.data;
  const codesTotal = d ? Object.values(d.codes).reduce((a, b) => a + b, 0) : 0;

  return (
    <AdminShell section="ringkasan" title="Ringkasan">
      {sum.error ? <ErrorBox text={sum.error} retry={() => void sum.reload()} /> : null}
      {!d && sum.loading ? <Loading /> : null}
      {d ? (
        <>
          <section class="stats">
            <div class="stat">
              <div class="label"><i class="ph ph-receipt" aria-hidden="true" /> Pembelian dituntut</div>
              <div class="value">{n(d.purchases.dituntut)}</div>
              <div class="small muted">Dibatalkan: {n(d.purchases.dibatalkan)}</div>
            </div>
            <div class="stat">
              <div class="label"><i class="ph ph-user-minus" aria-hidden="true" /> Belum daftar</div>
              <div class="value">{n(d.purchases.belum_dituntut)}</div>
              {sa ? <a class="btn green sm" href="#/admin/pembelian?status=belum_dituntut"><i class="ph-fill ph-whatsapp-logo" aria-hidden="true" /> Lihat &amp; WhatsApp</a>
                : <div class="small muted">Pembelian belum dituntut</div>}
            </div>
            <div class={'stat' + (d.perlu_semakan ? ' alert' : '')}>
              <div class="label" style={d.perlu_semakan ? 'color:var(--red-d)' : undefined}>
                <i class={d.perlu_semakan ? 'ph-fill ph-warning' : 'ph ph-check-circle'} aria-hidden="true" /> Perlu semakan
              </div>
              <div class="value">{n(d.perlu_semakan)}</div>
              <div class="small" style={d.perlu_semakan ? 'color:var(--red-d);font-weight:700' : 'color:var(--muted)'}>
                {d.perlu_semakan ? 'Tindakan diperlukan' : 'Tiada isu'}
              </div>
            </div>
            <div class="stat">
              <div class="label"><i class="ph ph-users-three" aria-hidden="true" /> Peserta berdaftar</div>
              <div class="value">{n(d.participants)}</div>
              <div class="small muted">{n(d.onboarded)} selesai data permulaan</div>
            </div>
          </section>

          <section class="cols">
            <div class="card">
              <div class="card-h"><h2>Kod akses</h2>{sa ? <Button href="#/admin/kod" sm icon="ph-bold ph-plus">Jana kod</Button> : null}</div>
              <div class="tbl-wrap">
                <table class="t">
                  <thead><tr><th>Status</th><th>Bilangan</th></tr></thead>
                  <tbody>
                    <tr><td><b>Belum guna</b></td><td class="num">{n(d.codes.belum_guna)}</td></tr>
                    <tr><td><b>Aktif (ditebus)</b></td><td class="num">{n(d.codes.aktif)}</td></tr>
                    <tr><td><b>Dibatalkan</b></td><td class="num">{n(d.codes.dibatalkan)}</td></tr>
                    <tr><td class="muted">Jumlah dijana</td><td class="num">{n(codesTotal)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            {sa ? (
              <div class="card">
                <div class="card-h"><h2>Perlu semakan</h2><span class={'badge ' + (d.perlu_semakan ? 'red' : 'green')}>{n(d.perlu_semakan)} order</span></div>
                {review.error ? <ErrorBox text={review.error} /> : null}
                {review.loading && !review.data ? <Loading /> : null}
                {(review.data ?? []).slice(0, 5).map((p) => (
                  <div class="li" key={String(p.id)}>
                    <div style="min-width:0">
                      <span class="mono num" style="font-size:13px">{String(p.order_ref)}</span> · <b>{String(p.buyer_name ?? '—')}</b>
                      <div class="small muted">{String(p.review_reason ?? '')}</div>
                    </div>
                    <Button href="#/admin/pembelian?status=perlu_semakan" sm variant="outline">Semak</Button>
                  </div>
                ))}
                {review.data && !review.data.length ? <p class="small muted">Tiada order perlu disemak.</p> : null}
              </div>
            ) : (
              <div class="card">
                <div class="card-h"><h2>Peserta</h2></div>
                <p class="small muted" style="margin-bottom:12px">Lihat profil, hak akses dan rekod pembelian peserta (baca sahaja).</p>
                <Button href="#/admin/peserta" sm variant="outline" icon="ph ph-users-three">Buka senarai peserta</Button>
              </div>
            )}
          </section>
        </>
      ) : null}

      <section class="card" style="margin-top:16px">
        <div class="card-h"><h2>Penggunaan pangkalan data</h2><span class="badge grey"><i class="ph ph-database" aria-hidden="true" /> Hyperdrive</span></div>
        <div class="callout blue">
          <i class="ph-fill ph-info" aria-hidden="true" />
          <span>Had percuma Hyperdrive: <b class="num">100,000</b> query sehari. Semak penggunaan sebenar di papan pemuka Cloudflare.</span>
        </div>
        <div style="margin-top:12px">
          <Button href="https://dash.cloudflare.com/" external sm variant="outline" icon="ph ph-arrow-square-out">Buka papan pemuka Cloudflare</Button>
        </div>
      </section>
    </AdminShell>
  );
}
