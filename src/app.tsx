import { useEffect } from 'preact/hooks';
import { guard, navigate, OPEN_ROUTES, useRoute, type Route } from './router';
import { signOut, startSession, refresh, useSession, type SessionState } from './state/session';
import { ToastHost } from './ui/Toast';
import { Empty } from './ui/Empty';
import { Button } from './ui/Button';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Forgot } from './pages/auth/Forgot';
import { Home } from './pages/Home';
import { Help } from './pages/Help';
import { Rekod } from './pages/Rekod';
import { NotFound, Placeholder } from './pages/Placeholder';
import { Onboarding } from './pages/Onboarding';
import { Tdee } from './pages/Tdee';
import { Groups } from './pages/Groups';
import { Account } from './pages/account/Account';
import { Codes } from './pages/account/Codes';
import { Aktif } from './pages/Aktif';
import { Library } from './pages/ebooks/Library';
import { Reader } from './pages/ebooks/Reader';
import { Admin } from './pages/admin/Admin';

function Loading() {
  return (
    <div class="phone no-tabs" style="display:grid;place-items:center" aria-busy="true">
      <div style="text-align:center">
        <span class="wordmark">HDM <b>BOOSTER</b></span>
        <p class="muted small" style="margin-top:10px"><i class="ph-bold ph-spinner spin" aria-hidden="true" /> Memuatkan…</p>
      </div>
    </div>
  );
}

function SessionError({ s }: { s: SessionState }) {
  const noProfile = s.errorReason === 'tiada_profil';
  return (
    <div class="phone no-tabs">
      <main class="page" style="padding-top:48px">
        <Empty icon="ph-bold ph-warning-circle" tone="yellow" title={noProfile ? 'Akaun belum lengkap' : 'Tidak dapat memuatkan data'} text={s.error}>
          {!noProfile ? <Button block onClick={() => void refresh()}>Cuba lagi</Button> : null}
          <Button variant={noProfile ? 'primary' : 'ghost'} block style="margin-top:8px" onClick={() => void signOut()}>Log keluar</Button>
        </Empty>
      </main>
    </div>
  );
}

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case 'masuk': return <Login next={route.query?.next} />;
    case 'daftar': return <Register />;
    case 'lupa': return <Forgot />;
    case 'home': return <Home />;
    case 'bantuan': return <Help />;
    case 'rekod':
    case 'cabaran': return <Rekod route={route.name} />;
    case 'onboarding': return <Onboarding />;
    case 'tdee': return <Tdee />;
    case 'group': return <Groups />;
    case 'akaun': return <Account />;
    case 'akaun_kod': return <Codes />;
    case 'aktif': return <Aktif />;
    case 'ebook': return <Library />;
    case 'ebook_read': return <Reader key={route.params.id} id={route.params.id} />;
    case 'admin': return <Admin route={route} />;
    case 'tiada': return <NotFound />;
    default: return <Placeholder route={route.name} />;
  }
}

export function App() {
  const route = useRoute();
  const s = useSession();
  useEffect(() => startSession(), []);

  const redirect = guard(route, { status: s.status, onboarded: !!s.profile?.onboarded_at, roles: s.roles });
  useEffect(() => {
    if (redirect) navigate(redirect, true);
  }, [redirect]);

  const pub = OPEN_ROUTES.has(route.name);
  let body;
  if (s.status === 'error' && !pub) body = <SessionError s={s} />;
  else if (redirect || (s.status === 'loading' && !pub)) body = <Loading />;
  else body = <Page route={route} />;

  return (
    <>
      {body}
      <ToastHost />
    </>
  );
}
