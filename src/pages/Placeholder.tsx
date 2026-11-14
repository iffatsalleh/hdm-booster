// Screens built in later tasks: a card inside the shell so navigation works now.
import { useState } from 'preact/hooks';
import { Layout } from '../ui/Layout';
import { Empty } from '../ui/Empty';
import { Button } from '../ui/Button';
import { signOut } from '../state/session';
import type { RouteName } from '../router';

const TITLES: Partial<Record<RouteName, string>> = {
  onboarding: 'Data permulaan',
  ebook: 'Ebook',
  ebook_read: 'Ebook',
  tdee: 'Kalkulator TDEE',
  group: 'Group Support',
  akaun: 'Akaun',
  akaun_kod: 'Kod akses',
  aktif: 'Aktifkan pakej',
  admin: 'Admin',
};

export function Placeholder({ route }: { route: RouteName }) {
  const [busy, setBusy] = useState(false);
  const title = TITLES[route] ?? 'HDM BOOSTER';
  const showLogout = route === 'akaun' || route === 'onboarding';
  return (
    <Layout route={route} title={title} back="#/" tabs={route !== 'onboarding'}>
      <Empty icon="ph-bold ph-hourglass-medium" tone="blue" title="Akan datang" text="Halaman ini sedang disiapkan.">
        {route !== 'onboarding' ? <Button href="#/" variant="outline" block>Kembali ke Utama</Button> : null}
      </Empty>
      {showLogout ? (
        <Button variant="danger-t" block icon="ph-bold ph-sign-out" loading={busy} style="margin-top:12px"
          onClick={async () => { setBusy(true); try { await signOut(); } finally { setBusy(false); } }}>
          Log keluar
        </Button>
      ) : null}
    </Layout>
  );
}

export function NotFound() {
  return (
    <Layout route="tiada" title="Tidak dijumpai">
      <Empty icon="ph-bold ph-compass" title="Halaman tidak dijumpai" text="Pautan ini tidak wujud.">
        <Button href="#/" block>Kembali ke Utama</Button>
      </Empty>
    </Layout>
  );
}
