// #/admin/bcl — BCL form → package mapping (bcl_form_map CRUD via /api/admin/bcl-map).
import { useSession } from '../../state/session';
import { Callout } from '../../ui/Card';
import { AdminShell, type Row } from './ui';
import { CrudTable } from './Crud';

export function BclMap() {
  const s = useSession();
  const pkgs = (s.catalog?.packages ?? []).map((k) => ({ value: k.id, label: k.name }));
  return (
    <AdminShell section="bcl" title="Pemetaan BCL">
      <div class="stack-c">
        <Callout tone="blue" icon="ph-fill ph-info">
          Padankan borang BCL kepada pakej. Order dari borang yang tiada dalam senarai (atau tidak aktif) akan diabaikan.
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
            { key: 'field_value', label: 'Nilai medan', type: 'text', hint: 'Opsyen: nilai medan pilihan pada borang.' },
            { key: 'package_id', label: 'Pakej', type: 'select', options: pkgs, required: true },
            { key: 'active', label: 'Aktif', type: 'bool' },
          ]}
        />
      </div>
    </AdminShell>
  );
}
