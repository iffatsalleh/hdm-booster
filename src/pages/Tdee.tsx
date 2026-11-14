// Kalkulator TDEE (mockup tdee.html). Needs the `tdee` entitlement, else a lock card with Naik taraf.
import { useMemo, useState } from 'preact/hooks';
import { api } from '../lib/api';
import { bm } from '../lib/errors';
import { ACTIVITY_LEVELS, birthYearToAge, num } from '../lib/onboarding';
import { calcTdee, type TdeeInput } from '../lib/tdee';
import { buildTargets } from '../lib/targets';
import { refresh, useSession, type Profile } from '../state/session';
import { Layout } from '../ui/Layout';
import { Button } from '../ui/Button';
import { Callout, HealthNote } from '../ui/Card';
import { LockBadge } from '../ui/LockBadge';
import { ActivityPicker, NumField, Seg } from '../ui/Form';
import { UpgradeButton } from '../ui/Upgrade';
import { toast } from '../ui/Toast';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

type Draft = { sex: '' | 'L' | 'P'; age: string; height: string; weight: string; activity: 0 | 1 | 2 | 3 | 4 | 5 };

function fromProfile(p: Profile | null): Draft {
  const age = birthYearToAge(p?.birth_year);
  const act = Number(p?.activity_level);
  return {
    sex: p?.sex === 'L' || p?.sex === 'P' ? p.sex : '',
    age: age == null ? '' : String(age),
    height: p?.height_cm == null ? '' : String(p.height_cm),
    weight: p?.start_weight_kg == null ? '' : String(p.start_weight_kg),
    activity: act >= 1 && act <= 5 ? (act as 1 | 2 | 3 | 4 | 5) : 0,
  };
}

function toInput(d: Draft): TdeeInput | null {
  const age = num(d.age);
  const h = num(d.height);
  const w = num(d.weight);
  if (!d.sex || !d.activity || !(age >= 1 && age <= 120) || !(h > 0 && h <= 300) || !(w > 0 && w <= 500)) return null;
  return { sex: d.sex, age, heightCm: h, weightKg: w, activity: d.activity };
}

function Locked() {
  return (
    <Layout route="tdee" title="Kalkulator TDEE">
      <section class="card locked">
        <div class="dim">
          <div class="row"><span class="ic orange"><i class="ph-bold ph-calculator" aria-hidden="true" /></span>
            <div><h3 style="font-size:17px">Kalkulator TDEE</h3><p class="small muted">BMR, TDEE, defisit kalori &amp; makro</p></div></div>
        </div>
        <div style="margin-top:12px"><LockBadge text="Terkunci" /></div>
        <p class="small muted" style="margin-top:8px">Kalkulator TDEE tiada dalam akses anda. Naik taraf pakej, atau aktifkan kod akses jika anda ada.</p>
        <UpgradeButton style="margin-top:12px" />
        <Button href="#/akaun/kod" variant="outline" block icon="ph-bold ph-ticket" style="margin-top:8px">Ada kod akses?</Button>
      </section>
      <HealthNote />
    </Layout>
  );
}

export function Tdee() {
  const s = useSession();
  if (!s.entitlements.has('tdee')) return <Locked />;
  return <Calculator />;
}

function Calculator() {
  const s = useSession();
  const [d, setD] = useState<Draft>(() => fromProfile(s.profile));
  const input = useMemo(() => toInput(d), [d]);
  const [edit, setEdit] = useState(() => !toInput(fromProfile(s.profile)));
  const [pick, setPick] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const r = input ? calcTdee(input) : null;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((o) => ({ ...o, [k]: v }));
  const act = ACTIVITY_LEVELS.find((a) => a.lv === d.activity);
  const savedKcal = s.profile?.kcal_target as number | null | undefined;
  const savedProt = s.profile?.protein_target_g as number | null | undefined;

  const save = async () => {
    if (!input || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const t = buildTargets(input, pick);
      await api('PUT', '/api/me/targets', t);
      await refresh();
      toast(`Sasaran disimpan: ${fmt(t.kcal_target)} kcal & ${t.protein_target_g} g protein sehari.`, 'green');
    } catch (x) {
      setErr(bm(x));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout route="tdee" title="Kalkulator TDEE">
      <section class="card">
        <div class="row between">
          <div style="min-width:0">
            <p class="tiny subtle" style="font-weight:700">DATA ANDA</p>
            <p style="font-weight:700;color:var(--navy)">
              {input
                ? `${d.sex === 'L' ? 'Lelaki' : 'Perempuan'} · ${num(d.age)} tahun · ${num(d.height)} cm · ${num(d.weight)} kg · Tahap ${d.activity} ${act?.name ?? ''}`
                : 'Lengkapkan data di bawah'}
            </p>
          </div>
          <Button variant="outline" sm onClick={() => setEdit(!edit)}>{edit ? 'Tutup' : 'Ubah'}</Button>
        </div>
        {edit ? (
          <div style="margin-top:6px">
            <Seg id="td-sex" label="Jantina" value={d.sex} options={[['L', 'Lelaki'], ['P', 'Perempuan']]} onChange={(v) => set('sex', v)} />
            <NumField id="td-age" label="Umur" unit="tahun" value={d.age} onInput={(v) => set('age', v)} />
            <NumField id="td-h" label="Tinggi" unit="cm" decimal value={d.height} onInput={(v) => set('height', v)} />
            <NumField id="td-w" label="Berat" unit="kg" decimal value={d.weight} onInput={(v) => set('weight', v)} />
            <ActivityPicker id="td-act" value={d.activity} onChange={(v) => set('activity', v)} />
            {!input ? <p class="hint">Isi jantina, umur, tinggi (cm), berat (kg) dan tahap aktiviti untuk melihat keputusan.</p> : null}
            <p class="hint">Perubahan di sini untuk kiraan sahaja. Untuk simpan data badan anda, <a href="#/onboarding">kemas kini data permulaan</a>.</p>
          </div>
        ) : null}
      </section>

      {r ? (
        <>
          <div class="grid2" style="margin-top:12px">
            <div class="card"><p class="small muted" style="font-weight:700">BMR</p><div class="num" style="font-size:30px;color:var(--navy)">{fmt(r.bmr)}</div><p class="small muted">kcal</p></div>
            <div class="card"><p class="small muted" style="font-weight:700">TDEE</p><div class="num" style="font-size:30px;color:var(--blue)">{fmt(r.tdee)}</div><p class="small muted">kcal</p></div>
          </div>

          <div class="section-title"><h2>Cadangan defisit</h2></div>
          <div class="stack" role="radiogroup" aria-label="Pilih defisit kalori">
            {r.deficits.map((x, i) => {
              const on = pick === i;
              return (
                <div key={x.pct} class="card row between" role="radio" tabIndex={0} aria-checked={on}
                  style={`cursor:pointer;${on ? 'border:2px solid var(--blue)' : ''}`}
                  onClick={() => setPick(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPick(i); } }}>
                  <div>
                    <h3 style="font-size:16px">{x.label.replace(/ \(.*\)$/, '')}</h3>
                    <p class="small muted">−{x.pct}%</p>
                    {i === 1 ? <span class="badge yellow" style="margin-top:6px;background:var(--yellow);color:var(--navy)">Disyorkan</span> : null}
                  </div>
                  <div class="num" style="font-size:20px">{fmt(x.kcal)} <span class="small muted">kcal</span></div>
                </div>
              );
            })}
          </div>

          <section class="card" style="margin-top:12px">
            <div class="row"><span class="ic blue"><i class="ph-bold ph-barbell" aria-hidden="true" /></span>
              <div><h3 style="font-size:16px">Sasaran protein</h3>
                <p class="num" style="font-size:20px;color:var(--blue)">{r.proteinG.min}–{r.proteinG.max} <span class="small muted" style="font-family:Quicksand">g/hari</span></p></div></div>
          </section>

          <section class="card" style="margin-top:12px">
            <h3 style="font-size:16px;margin-bottom:12px">Pecahan makro cadangan</h3>
            <div class="macro" role="img"
              aria-label={`Protein ${r.macros.proteinG} g, Lemak ${r.macros.fatG} g, Karbohidrat ${r.macros.carbG} g`}>
              <i style={`flex:${r.macros.proteinG * 4};background:var(--blue)`} />
              <i style={`flex:${r.macros.fatG * 9};background:var(--orange)`} />
              <i style={`flex:${Math.max(0, r.macros.carbG) * 4};background:var(--green)`} />
            </div>
            <div class="legend">
              <span style="--c:var(--blue)">Protein {r.macros.proteinG} g</span>
              <span style="--c:var(--orange)">Lemak {r.macros.fatG} g</span>
              <span style="--c:var(--green)">Karbohidrat {r.macros.carbG} g</span>
            </div>
          </section>

          {savedKcal ? (
            <p class="small muted" style="text-align:center;margin-top:14px">
              Sasaran semasa: <b>{fmt(savedKcal)} kcal</b>{savedProt ? <> · <b>{savedProt} g protein</b></> : null} sehari
            </p>
          ) : null}
          {err ? <Callout tone="red" icon="ph-fill ph-warning-circle" style="margin-top:12px">{err}</Callout> : null}
          <Button block loading={busy} style="margin-top:16px" onClick={save}>Guna sebagai sasaran saya</Button>
        </>
      ) : null}
      <p class="small muted" style="text-align:center;margin-top:10px">Anggaran sahaja, bukan nasihat perubatan.</p>
      <HealthNote />
    </Layout>
  );
}
