// Onboarding (mockup onboarding.html): Profil · Badan · Sasaran on one page -> PUT /api/me/onboarding.
// Also reached from TDEE "Ubah" by an onboarded member to update the same data.
import { useMemo, useState } from 'preact/hooks';
import { api } from '../lib/api';
import { bm } from '../lib/errors';
import {
  profileToForm, suggestProtein, validateOnboarding, type OnboardingErrors, type OnboardingForm,
} from '../lib/onboarding';
import { navigate } from '../router';
import { refresh, signOut, useSession } from '../state/session';
import { Button } from '../ui/Button';
import { Callout } from '../ui/Card';
import { ActivityPicker, CheckBox, NumField, Seg } from '../ui/Form';
import { toast } from '../ui/Toast';

const HEALTH =
  'Jika anda ada penyakit kronik, mengambil ubat tertentu, hamil atau menyusukan anak, dapatkan nasihat doktor dahulu sebelum mengubah rutin puasa, pemakanan atau senaman.';

// Field order on the page, for focusing the first error.
const ORDER: (keyof OnboardingForm)[] = [
  'sex', 'age', 'height', 'weight', 'bodyFat', 'waist', 'activity', 'target', 'protein', 'healthAck', 'privacyAck',
];
const IDS: Record<keyof OnboardingForm, string> = {
  sex: 'ob-sex', age: 'ob-age', height: 'ob-height', weight: 'ob-weight', bodyFat: 'ob-bf', waist: 'ob-waist',
  activity: 'ob-act', target: 'ob-target', protein: 'ob-prot', healthAck: 'ob-health', privacyAck: 'ob-privacy',
};

export function Onboarding() {
  const s = useSession();
  const editing = !!s.profile?.onboarded_at;
  const initial = useMemo(() => {
    const f = profileToForm(s.profile);
    if (!f.protein) f.protein = suggestProtein(f.weight);
    return f;
  }, []);
  const [f, setF] = useState<OnboardingForm>(initial);
  // Protein follows the weight (1.8 g/kg) until the user types their own value.
  const [protTouched, setProtTouched] = useState(!!s.profile?.protein_target_g);
  const [errs, setErrs] = useState<OnboardingErrors>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(false);

  const set = <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) => {
    setF((o) => {
      const n = { ...o, [k]: v };
      if (k === 'weight' && !protTouched) n.protein = suggestProtein(String(v));
      return n;
    });
    if (errs[k]) setErrs((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    const r = validateOnboarding(f);
    setErrs(r.errors);
    setFormErr(null);
    if (!r.payload) {
      const first = ORDER.find((k) => r.errors[k]);
      if (first) document.getElementById(IDS[first])?.focus();
      return;
    }
    setBusy(true);
    try {
      await api('PUT', '/api/me/onboarding', r.payload);
      await refresh();
      toast(editing ? 'Data anda telah dikemas kini.' : 'Data disimpan. Selamat datang ke HDM BOOSTER!', 'green');
      navigate(editing ? '#/tdee' : '#/', true);
    } catch (x) {
      setFormErr(bm(x));
      setBusy(false);
    }
  };

  return (
    <div class="phone no-tabs">
      <section class="hero hero-band" style="border-radius:0 0 24px 24px">
        <span class="wordmark">HDM <b>BOOSTER</b></span>
        <h1 style="font-size:24px;margin-top:16px">{editing ? 'Kemas kini data anda' : 'Kenal anda dahulu'}</h1>
        <p class="small">{editing ? 'Data ini digunakan untuk kira sasaran anda.' : 'Sekali sahaja. Data ini untuk kira sasaran anda.'}</p>
        <div class="steps" aria-hidden="true">
          <div class="s on"><i />1 Profil</div><div class="s on"><i />2 Badan</div><div class="s on"><i />3 Sasaran</div>
        </div>
      </section>
      <main class="page">
        <form onSubmit={submit} noValidate>
          <section class="card">
            <div class="step-h"><span class="n">1</span><h2>Profil</h2></div>
            <Seg id={IDS.sex} label="Jantina" value={f.sex} options={[['L', 'Lelaki'], ['P', 'Perempuan']]}
              onChange={(v) => set('sex', v)} error={errs.sex} />
            <NumField id={IDS.age} label="Umur" unit="tahun" value={f.age} onInput={(v) => set('age', v)} error={errs.age} />
          </section>

          <section class="card">
            <div class="step-h"><span class="n">2</span><h2>Badan</h2></div>
            <NumField id={IDS.height} label="Tinggi" unit="cm" decimal value={f.height} onInput={(v) => set('height', v)} error={errs.height} />
            <NumField id={IDS.weight} label="Berat" unit="kg" decimal value={f.weight} onInput={(v) => set('weight', v)} error={errs.weight} />
            <NumField id={IDS.bodyFat} label={<>Lemak badan <span class="subtle">(opsyen)</span></>} unit="%" decimal placeholder="cth. 25"
              value={f.bodyFat} onInput={(v) => set('bodyFat', v)} error={errs.bodyFat} />
            <NumField id={IDS.waist} label={<>Ukuran pinggang <span class="subtle">(opsyen)</span></>} unit="cm" decimal placeholder="cth. 92"
              value={f.waist} onInput={(v) => set('waist', v)} error={errs.waist} />
            <ActivityPicker id={IDS.activity} value={f.activity} onChange={(v) => set('activity', v)} error={errs.activity} />
          </section>

          <section class="card">
            <div class="step-h"><span class="n">3</span><h2>Sasaran</h2></div>
            <NumField id={IDS.target} label={<>Berat sasaran <span class="subtle">(opsyen)</span></>} unit="kg" decimal placeholder="cth. 72"
              value={f.target} onInput={(v) => set('target', v)} error={errs.target} />
            <NumField id={IDS.protein} label="Sasaran protein harian" unit="g" value={f.protein}
              onInput={(v) => { setProtTouched(true); set('protein', v); }} error={errs.protein}
              hint="Dicadang 1.8 g/kg berat badan, boleh ubah" />
            <div class="callout yellow" style="margin-top:16px">
              <i class="ph-fill ph-first-aid-kit" aria-hidden="true" /><span>{HEALTH}</span>
            </div>
            <CheckBox id={IDS.healthAck} checked={f.healthAck} onChange={(v) => set('healthAck', v)} error={errs.healthAck} style="margin-top:14px">
              Saya faham dan akan dapatkan nasihat doktor jika perlu
            </CheckBox>
            <CheckBox id={IDS.privacyAck} checked={f.privacyAck} onChange={(v) => set('privacyAck', v)} error={errs.privacyAck} style="margin-top:12px">
              Saya bersetuju data badan saya disimpan untuk program ini seperti dalam{' '}
              <a href="#/onboarding" onClick={(e) => { e.preventDefault(); setNotice(!notice); }} aria-expanded={notice}
                aria-controls="ob-pdpa">Notis Privasi (PDPA)</a>
            </CheckBox>
            {notice ? (
              <div id="ob-pdpa" class="callout blue small" style="margin-top:10px;display:block;font-weight:500;line-height:1.5">
                <p>Data badan yang anda masukkan (jantina, umur, tinggi, berat, ukuran dan sasaran) digunakan untuk mengira
                  sasaran anda dan laporan program. Data disimpan melalui penyedia awan (Google Firebase, Cloudflare) yang
                  mungkin memproses data <b>di luar Malaysia</b>. Data anda tidak dijual. Anda boleh meminta pembetulan atau
                  pemadaman data melalui WhatsApp 60134417042.</p>
              </div>
            ) : null}
          </section>

          {formErr ? <Callout tone="red" icon="ph-fill ph-warning-circle" style="margin-top:12px">{formErr}</Callout> : null}

          <div class="grid2" style="margin-top:16px">
            {editing ? (
              <Button href="#/tdee" variant="outline">Kembali</Button>
            ) : (
              <Button variant="outline" onClick={() => void signOut()}>Log keluar</Button>
            )}
            <Button type="submit" loading={busy}>{editing ? 'Simpan' : 'Simpan & mula'}</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
