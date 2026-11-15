// #/admin/kandungan — content CRUD: batches & phases, ebooks, groups, packages & items, message templates.
import { useState } from 'preact/hooks';
import { Button } from '../../ui/Button';
import { act, adminApi, AdminShell, useLoad, type Row } from './ui';
import { CrudTable } from './Crud';

const TABS = [
  ['batch', 'Batch & Fasa'], ['ebook', 'Ebook'], ['group', 'Group'], ['pakej', 'Pakej & Item'], ['templat', 'Templat & tetapan'],
] as const;
type Tab = (typeof TABS)[number][0];

const C = (t: string) => `/api/admin/content/${t}`;

export function Content() {
  const [tab, setTab] = useState<Tab>('batch');
  const [ver, setVer] = useState(0);
  const bump = () => setVer((v) => v + 1);
  // option lists from the live tables (refreshed when a table changes)
  const items = useLoad(() => adminApi<Row[]>('GET', C('items')), [ver]);
  const batches = useLoad(() => adminApi<Row[]>('GET', C('batches')), [ver]);
  const pkgs = useLoad(() => adminApi<Row[]>('GET', C('packages')), [ver]);
  const itemOpts = (kind?: string) => (items.data ?? []).filter((i) => !kind || i.kind === kind)
    .map((i) => ({ value: String(i.key), label: `${String(i.name)} (${String(i.key)})` }));
  const batchOpts = (batches.data ?? []).map((b) => ({ value: String(b.id), label: String(b.name) }));
  const pkgOpts = (pkgs.data ?? []).map((k) => ({ value: String(k.id), label: String(k.name) }));

  return (
    <AdminShell section="kandungan" title="Kandungan">
      <div class="tabs" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} class={tab === k ? 'on' : undefined} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div class="stack-c">
        {tab === 'batch' ? (
          <CrudTable title="Batch" base={C('batches')} deleteAction="content.delete" onChange={bump}
            idOf={(r) => String(r.id)} labelOf={(r) => String(r.name)}
            newRow={() => ({ status: 'akan_datang', phases: [] })}
            cols={[
              { key: 'name', label: 'Nama', type: 'text', required: true },
              { key: 'sales_open_at', label: 'Jualan dibuka', type: 'datetime' },
              { key: 'sales_close_at', label: 'Jualan ditutup', type: 'datetime' },
              { key: 'program_start', label: 'Program bermula', type: 'date' },
              { key: 'program_end', label: 'Program tamat', type: 'date' },
              { key: 'status', label: 'Status', type: 'select', required: true,
                options: ['akan_datang', 'berjalan', 'tamat'].map((v) => ({ value: v, label: v })) },
              { key: 'phases', label: 'Fasa', type: 'phases' },
            ]} />
        ) : null}
        {tab === 'ebook' ? (
          <CrudTable title="Ebook" base={C('ebooks')} deleteAction="content.delete"
            idOf={(r) => String(r.id)} labelOf={(r) => String(r.title)}
            newRow={() => ({ allow_download: false, sort: 0 })}
            extra={(r, reload) => <MarkUpdated row={r} reload={reload} />}
            cols={[
              { key: 'number', label: 'No.', type: 'number' },
              { key: 'title', label: 'Tajuk', type: 'text', required: true },
              { key: 'item_key', label: 'Item', type: 'select', required: true, options: itemOpts('ebook') },
              { key: 'description', label: 'Penerangan', type: 'textarea', list: false },
              { key: 'cover_url', label: 'URL kulit', type: 'text', list: false },
              { key: 'file_drive_id', label: 'Drive file ID', type: 'text', mono: true },
              { key: 'allow_download', label: 'Benarkan muat turun', type: 'bool' },
              { key: 'file_updated_at', label: 'Dikemas kini', type: 'datetime' },
              { key: 'sort', label: 'Susunan', type: 'number', list: false },
            ]} />
        ) : null}
        {tab === 'group' ? (
          <CrudTable title="Group" base={C('groups')} deleteAction="content.delete"
            idOf={(r) => String(r.id)} labelOf={(r) => String(r.name)}
            cols={[
              { key: 'name', label: 'Nama', type: 'text', required: true },
              { key: 'item_key', label: 'Item', type: 'select', required: true, options: itemOpts('group') },
              { key: 'batch_id', label: 'Batch', type: 'select', options: batchOpts, hint: 'Kosong = semua batch.' },
              { key: 'coach', label: 'Coach', type: 'text' },
              { key: 'description', label: 'Penerangan', type: 'textarea', list: false },
              { key: 'invite_url', label: 'Pautan jemputan', type: 'text', mono: true },
            ]} />
        ) : null}
        {tab === 'pakej' ? (
          <>
            <CrudTable title="Pakej" base={C('packages')} deleteAction="content.delete" onChange={bump}
              idOf={(r) => String(r.id)} labelOf={(r) => String(r.name)} newRow={() => ({ sellable: true })}
              cols={[
                { key: 'id', label: 'ID', type: 'text', pk: true, required: true, mono: true },
                { key: 'name', label: 'Nama', type: 'text', required: true },
                { key: 'price_rm', label: 'Harga RM', type: 'number', required: true },
                { key: 'sellable', label: 'Dijual', type: 'bool' },
              ]} />
            <CrudTable title="Item dalam pakej" base={C('package_items')} deleteAction="content.delete"
              idOf={(r) => `${String(r.package_id)}:${String(r.item_key)}`} labelOf={(r) => `${String(r.package_id)} → ${String(r.item_key)}`}
              cols={[
                { key: 'package_id', label: 'Pakej', type: 'select', pk: true, required: true, options: pkgOpts },
                { key: 'item_key', label: 'Item', type: 'select', pk: true, required: true, options: itemOpts() },
              ]} />
            <CrudTable title="Item" base={C('items')} deleteAction="content.delete" onChange={bump}
              idOf={(r) => String(r.key)} labelOf={(r) => String(r.name)} newRow={() => ({ active: true, sort: 0, kind: 'modul' })}
              cols={[
                { key: 'key', label: 'Kunci', type: 'text', pk: true, required: true, mono: true },
                { key: 'name', label: 'Nama', type: 'text', required: true },
                { key: 'kind', label: 'Jenis', type: 'select', required: true,
                  options: ['modul', 'ebook', 'tool', 'group'].map((v) => ({ value: v, label: v })) },
                { key: 'sort', label: 'Susunan', type: 'number' },
                { key: 'active', label: 'Aktif', type: 'bool' },
              ]} />
          </>
        ) : null}
        {tab === 'templat' ? (
          <CrudTable title="Templat mesej & tetapan" base={C('app_settings')} deleteAction="content.delete"
            idOf={(r) => String(r.key)} labelOf={(r) => String(r.key)} newRow={() => ({ public: false })}
            note={<p class="small muted" style="margin-bottom:10px">Pemegang tempat: <code>{'{nama}'}</code>, <code>{'{kod}'}</code>, <code>{'{pautan}'}</code>. Tetapan awam (public) dihantar kepada semua peserta; templat WhatsApp mesti kekal tidak awam.</p>}
            cols={[
              { key: 'key', label: 'Kunci', type: 'text', pk: true, required: true, mono: true },
              { key: 'value', label: 'Nilai', type: 'setting' },
              { key: 'public', label: 'Awam', type: 'bool' },
            ]} />
        ) : null}
      </div>
    </AdminShell>
  );
}

function MarkUpdated({ row, reload }: { row: Row; reload: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button sm variant="outline" loading={busy} onClick={async () => {
      setBusy(true);
      const r = await act(() => adminApi('PUT', `${C('ebooks')}/${row.id}`, { file_updated_at: new Date().toISOString() }),
        'Ebook ditanda dikemas kini. Peserta akan memuat turun salinan baharu.');
      setBusy(false);
      if (r) reload();
    }}>Tanda dikemas kini</Button>
  );
}
