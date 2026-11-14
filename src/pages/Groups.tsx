// Group Support (mockup group.html): GET /api/groups (my_groups). Locked groups have no invite_url.
import { useEffect, useState } from 'preact/hooks';
import { api } from '../lib/api';
import { bm } from '../lib/errors';
import { useSession } from '../state/session';
import { Layout } from '../ui/Layout';
import { Button } from '../ui/Button';
import { Callout, HealthNote } from '../ui/Card';
import { Empty } from '../ui/Empty';
import { LockBadge } from '../ui/LockBadge';
import { UpgradeButton } from '../ui/Upgrade';

export type Group = {
  id: string;
  item_key: string;
  name: string;
  coach: string | null;
  description: string | null;
  invite_url: string | null;
  locked: boolean;
};

/** "Coach Iffat Salleh" -> "IS". */
export function coachInitials(coach: string | null): string {
  const w = String(coach ?? '').replace(/^coach\s+/i, '').replace(/["“”']/g, '').trim().split(/\s+/).filter(Boolean);
  return ((w[0]?.[0] ?? '') + (w[1]?.[0] ?? '')).toUpperCase() || 'G';
}

const safeUrl = (u: string | null) => (u && /^https:\/\//i.test(u) ? u : null);

function GroupCard({ g }: { g: Group }) {
  const head = (
    <>
      <div class="row">
        <span class="avatar" style="width:48px;height:48px;flex:none" aria-hidden="true">{coachInitials(g.coach)}</span>
        <div style="min-width:0"><h3 style="font-size:17px">{g.name}</h3>{g.coach ? <p class="small muted">{g.coach}</p> : null}</div>
      </div>
      {g.description ? <p class="small" style="margin-top:10px">{g.description}</p> : null}
    </>
  );
  if (g.locked) {
    return (
      <section class="card locked">
        <div class="dim">{head}</div>
        <div style="margin-top:10px"><LockBadge /></div>
        <p class="small muted" style="margin-top:8px">Tersedia dalam Pakej Complete</p>
        <UpgradeButton style="margin-top:10px" />
      </section>
    );
  }
  const url = safeUrl(g.invite_url);
  return (
    <section class="card">
      {head}
      <div style="margin-top:10px"><span class="badge green"><i class="ph-bold ph-lock-key-open" aria-hidden="true" /> Terbuka</span></div>
      {url ? (
        <Button href={url} external variant="green" block icon="ph-bold ph-whatsapp-logo" style="margin-top:12px">Sertai Group</Button>
      ) : (
        <p class="small muted" style="margin-top:10px">Pautan group belum tersedia. Sila semak semula kemudian atau hubungi admin.</p>
      )}
    </section>
  );
}

export function Groups() {
  const s = useSession();
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [n, setN] = useState(0);
  // Re-fetch when entitlements change (e.g. after redeeming a code).
  const entKey = [...s.entitlements].sort().join(',');

  useEffect(() => {
    let live = true;
    setErr(null);
    api<Group[]>('GET', '/api/groups')
      .then((g) => live && setGroups(Array.isArray(g) ? g : []))
      .catch((e) => live && setErr(bm(e)));
    return () => {
      live = false;
    };
  }, [entKey, n]);

  return (
    <Layout route="group" title="Group Support" subtitle={s.batch?.name}>
      {err ? (
        <Empty icon="ph-bold ph-warning-circle" tone="yellow" title="Tidak dapat memuatkan group" text={err}>
          <Button block onClick={() => setN(n + 1)}>Cuba lagi</Button>
        </Empty>
      ) : !groups ? (
        <p class="muted small" aria-busy="true"><i class="ph-bold ph-spinner spin" aria-hidden="true" /> Memuatkan…</p>
      ) : groups.length === 0 ? (
        <Empty icon="ph-bold ph-users-three" title="Tiada group lagi" text="Group untuk batch anda belum dibuka. Sila semak semula kemudian." />
      ) : (
        <div class="stack">{groups.map((g) => <GroupCard key={g.id} g={g} />)}</div>
      )}
      <Callout tone="yellow" icon="ph-fill ph-warning" style="margin-top:12px">Pautan group dikhaskan untuk peserta. Jangan kongsi.</Callout>
      <HealthNote />
    </Layout>
  );
}
