// #/admin/bcl — BCL form → package mapping (bcl_form_map CRUD via /api/admin/bcl-map), plus "Order tanpa pembelian":
// BCL orders logged as ignored (form not mapped) or failed that never became a purchase, each with "Proses semula".
import { useState } from 'preact/hooks';
import { dateTimeMYT, listTotal } from '../../lib/admin';
import { useSession } from '../../state/session';
import { Button } from '../../ui/Button';
import { Callout } from '../../ui/Card';
import { adminApi, AdminShell, ErrorBox, Loading, reprocessOrderRef, useLoad, type Row } from './ui';
import { CrudTable } from './Crud';

const KIND_LABEL: Record<string, string> = { ignored: 'Borang tiada dalam pemetaan', error: 'Ralat', ralat: 'Ralat' };

function OrphanOrders() {
  const list = useLoad(() => adminApi<Row[]>('GET', '/api/admin/orders/orphans'), []);
  const [busy, setBusy] = useState<string | null>(null);
  const rows = list.data ?? [];
  const reprocess = async (ref: string) => {
    setBusy(ref);
    if (await reprocessOrderRef(ref)) void list.reload();
    setBusy(null);
  };
  return (
    <section class="card">
      <div class="card-h">
        <h2>Order tanpa pembelian</h2>
        <span class={'badge ' + (rows.length ? 'red' : 'green')}>{list.data ? listTotal(rows) : '…'}</span>
      </div>
      <p class="small muted" style="margin-bottom:10px">
        Order BCL yang diabaikan (borangnya tiada dalam pemetaan) atau gagal diproses, dan belum menjadi pembelian.
        Semakan automatik tidak mengulangi order yang diabaikan. Tambah atau betulkan pemetaan di bawah, kemudian tekan <b>Proses semula</b>:
        order disahkan semula dengan BCL dan hasil baharu direkodkan.
      </p>
      {list.error ? <ErrorBox text={list.error} retry={() => void list.reload()} /> : null}
      {list.loading && !list.data ? <Loading /> : null}
      {rows.map((r) => {
        const ref = String(r.order_ref);
        return (
          <div class="li" key={ref}>
            <div style="min-width:0">
              <div class="small subtle">{dateTimeMYT(r.at as string)}{Number(r.attempts) > 1 ? ` · ${String(r.attempts)} kali` : ''}</div>
              <b class="mono num" style="font-size:13px">{ref}</b>{' '}
              <span class="small muted" style="overflow-wrap:anywhere">{String(r.message ?? '')}</span>
            </div>
            <div class="row" style="gap:6px;flex:none">
              <span class="chip" style={r.kind === 'ignored' ? undefined : 'color:var(--red-d)'}>{KIND_LABEL[String(r.kind)] ?? String(r.kind)}</span>
              <Button sm variant="outline" loading={busy === ref} disabled={!!busy} onClick={() => void reprocess(ref)}>Proses semula</Button>
            </div>
          </div>
        );
      })}
      {list.data && !rows.length ? <p class="small muted">Tiada order tertinggal.</p> : null}
    </section>
  );
}

export function BclMap() {
  const s = useSession();
  const pkgs = (s.catalog?.packages ?? []).map((k) => ({ value: k.id, label: k.name }));
  return (
    <AdminShell section="bcl" title="Pemetaan BCL">
      <div class="stack-c">
        <Callout tone="blue" icon="ph-fill ph-info">
          Padankan borang BCL kepada pakej. Order dari borang yang tiada dalam senarai (atau tidak aktif) akan diabaikan
          dan disenaraikan di "Order tanpa pembelian" di bawah.
        </Callout>
        <CrudTable
          title="Pemetaan borang"
          base="/api/admin/bcl-map"
          deleteAction="bcl_map.delete"
          idOf={(r: Row) => String(r.id)}
          labelOf={(r: Row) => `${String(r.formable_id ?? '—')} · RM${String(r.amount_rm ?? '—')}`}
          newRow={() => ({ active: true })}
          cols={[
            { key: 'formable_id', label: 'Formable ID', type: 'text', required: true, mono: true },
            { key: 'amount_rm', label: 'Jumlah RM', type: 'number', hint: 'Padanan jumlah bayaran (±RM3).' },
            { key: 'field_value', label: 'Nama produk / pakej', type: 'text', hint: 'Nama produk dalam borang BCL, ejaan sama (huruf besar/kecil tak kisah). Diutamakan berbanding jumlah, jadi diskaun tidak menjejaskan. Biar Jumlah RM kosong.' },
            { key: 'package_id', label: 'Pakej', type: 'select', options: pkgs, required: true },
            { key: 'active', label: 'Aktif', type: 'bool' },
          ]}
        />
        <OrphanOrders />
      </div>
    </AdminShell>
  );
}
