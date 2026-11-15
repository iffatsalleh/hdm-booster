// #/admin/* entry: picks the section; a coach opening a superadmin-only section gets "Tiada kebenaran".
import type { Route } from '../../router';
import { canView, parseAdminPath } from '../../lib/admin';
import { useSession } from '../../state/session';
import { Empty } from '../../ui/Empty';
import { Button } from '../../ui/Button';
import { AdminShell, NoAccess } from './ui';
import { AdminHome } from './AdminHome';
import { Purchases } from './Purchases';
import { Codes } from './Codes';
import { Participants } from './Participants';
import { BclMap } from './BclMap';
import { Content } from './Content';
import { Exports } from './Exports';
import { Audit } from './Audit';

export function Admin({ route }: { route: Route }) {
  const s = useSession();
  const { section, uid } = parseAdminPath(route.params.rest);
  if (!section) {
    return (
      <AdminShell section={null} title="Tidak dijumpai">
        <Empty icon="ph-bold ph-compass" title="Halaman admin tidak dijumpai" text="Pautan ini tidak wujud.">
          <Button href="#/admin" variant="outline" sm>Ke Ringkasan</Button>
        </Empty>
      </AdminShell>
    );
  }
  if (!canView(section, s.roles)) {
    return <AdminShell section={section} title="Tiada kebenaran"><NoAccess /></AdminShell>;
  }
  switch (section) {
    case 'ringkasan': return <AdminHome />;
    case 'pembelian': return <Purchases query={route.query} />;
    case 'kod': return <Codes />;
    case 'peserta': return <Participants uid={uid} />;
    case 'bcl': return <BclMap />;
    case 'kandungan': return <Content />;
    case 'export': return <Exports />;
    case 'audit': return <Audit />;
  }
}
