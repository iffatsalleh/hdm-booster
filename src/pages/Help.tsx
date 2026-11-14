import { useState } from 'preact/hooks';
import { Layout } from '../ui/Layout';
import { Card, HealthNote } from '../ui/Card';
import { Button } from '../ui/Button';
import { setting, useSession } from '../state/session';
import { waLink } from '../lib/wa';
import { formatDMY } from '../lib/dates';
import { DEFAULT_SUPPORT_WA } from '../lib/config';

const STEPS = {
  android: [
    'Buka laman ini dalam Chrome.',
    'Tekan menu tiga titik di penjuru atas.',
    'Pilih Tambah ke Skrin Utama, kemudian Tambah.',
  ],
  iphone: [
    'Buka laman ini dalam Safari.',
    'Tekan butang Kongsi (petak dengan anak panah ke atas) di bawah skrin.',
    'Pilih Tambah ke Skrin Utama, kemudian Tambah.',
  ],
};

export function Help() {
  const s = useSession();
  const [os, setOs] = useState<'android' | 'iphone'>(() => (/iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'iphone' : 'android'));
  const wa = setting(s, 'support_wa', DEFAULT_SUPPORT_WA);
  const opens = s.batch ? formatDMY(s.batch.program_start) : '10/12/2026';

  const faq: [string, string][] = [
    ['Saya tak boleh log masuk', `Semak emel dan kata laluan anda. Jika masih gagal, tekan Lupa kata laluan atau WhatsApp kami di ${wa}.`],
    ['Lupa kata laluan', 'Di skrin Log Masuk, tekan Lupa kata laluan. Masukkan emel anda dan kami hantar pautan. Semak juga folder Spam.'],
    ['Kenapa emel/telefon mesti sama dengan BCL?', 'Sistem menyemak rekod pembelian anda di BCL untuk buka akses yang betul. Jika berbeza, akses tidak dapat dipadankan.'],
    ['Bagaimana tebus kod akses?', 'Pergi ke Akaun, masukkan kod format HDMB-XXXX-XXXX pada ruangan Ada kod akses?, kemudian tekan Tebus.'],
    ['Bila Rekod harian dibuka?', `Rekod harian dan Cabaran #1 dibuka pada ${opens}. Sebelum itu, lengkapkan data permulaan anda.`],
  ];

  return (
    <Layout route="bantuan" title="Bantuan">
      {faq.map(([q, a], i) => (
        <details key={q} class="faq" open={i === 0}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
      <Card style="margin-top:16px">
        <h3 style="font-size:17px"><i class="ph-bold ph-device-mobile" style="color:var(--blue)" aria-hidden="true" /> Tambah ke Skrin Utama</h3>
        <div class="seg" role="tablist" aria-label="Jenis telefon" style="margin-top:12px">
          {(['android', 'iphone'] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={os === k} class={os === k ? 'on' : undefined}
              onClick={() => setOs(k)}>
              {k === 'android' ? 'Android' : 'iPhone'}
            </button>
          ))}
        </div>
        <ol class="small" style="margin:12px 0 0 20px;line-height:1.7;font-weight:600;list-style:decimal">
          {STEPS[os].map((t) => <li key={t}>{t}</li>)}
        </ol>
      </Card>
      <Button href={waLink(wa, 'Salam, saya perlukan bantuan HDM BOOSTER.')} external variant="green" block
        icon="ph-bold ph-whatsapp-logo" style="margin-top:16px">
        WhatsApp {wa}
      </Button>
      <HealthNote />
      <p class="health">
        <i class="ph ph-info" aria-hidden="true" />
        Hasil individu berbeza mengikut keadaan kesihatan, pemakanan, aktiviti fizikal dan konsistensi. Tiada jaminan
        penurunan berat tertentu.
      </p>
    </Layout>
  );
}
