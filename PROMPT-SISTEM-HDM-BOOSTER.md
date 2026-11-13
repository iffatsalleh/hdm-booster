# PROMPT: Bina Sistem HDM BOOSTER (Member Area + Kod Akses)

> Salin semua teks di bawah garis ini dan tampal ke AI builder / AI coding tool anda.

---

## 1. Peranan & matlamat

Anda ialah full-stack developer senior. Bina sebuah **web app member area** bernama **HDM BOOSTER** untuk program transformasi badan 3 bulan (Rejab → Syaaban → Ramadan 1448H). Semua teks antara muka dalam **Bahasa Melayu Malaysia**, mata wang **RM**, tarikh **DD/MM/YYYY**, zon masa **Asia/Kuala_Lumpur (UTC+8)**.

Pembeli membeli pakej di landing page (borang BCL). Selepas bayaran, mereka diberikan **kod akses unik**. **Kod itulah yang menentukan apa yang mereka boleh akses** dalam sistem (ebook, group, tools). Peserta guna sistem ini setiap hari untuk rekod progress, baca ebook, ikut cabaran bulanan dan akhirnya dapat Graduation Report + sijil.

Bina secara berperingkat (Seksyen 12). Siapkan Fasa 1 dengan lengkap dan boleh diguna sebelum teruskan.

## 2. Tech stack (cadangan, boleh tukar)

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS, mobile-first (kebanyakan peserta guna telefon).
- **Backend / DB / Auth / Storage:** Supabase (Postgres + Row Level Security + Auth + Storage private bucket).
- **Carta:** Recharts atau Chart.js.
- **PDF (Graduation Report & sijil):** jana di server (contoh `@react-pdf/renderer`).
- **Hosting:** Vercel.
- Ikon: Phosphor Icons. Font: Outfit (heading), Quicksand (body), Inter 800 (angka).
- Jadikan app **PWA** (boleh "Add to Home Screen", ikon & splash HDM BOOSTER).

## 3. Fakta program (mesti tepat di seluruh sistem)

| Perkara | Nilai |
|---|---|
| Nama | HDM BOOSTER |
| Tempoh program | 10/12/2026 (1 Rejab 1448H) hingga 10/03/2027 (1 Syawal 1448H) |
| Fasa 1 | **REJAB · Fat Loss Foundation** — kurangkan lemak, bina rutin pemakanan. Cabaran #1: **FAT LOSS CHALLENGE** |
| Fasa 2 | **SYAABAN · Lean Body & Muscle Boost** — lebih lean, otot terjaga. Cabaran #2: **MUSCLE BOOST CHALLENGE** |
| Fasa 3 | **RAMADAN · Ramadan Booster Protocol** — kekal momentum sepanjang puasa. Cabaran #3: **RAMADAN BODY BOOST** |
| Coach | Coach Iffat Salleh (HDM / pemakanan), Coach Anuar Yusof "Toy" (Muscle Mania / otot) |
| WhatsApp sokongan | 60134417042 |

Tarikh mula/tamat setiap fasa mesti boleh diubah oleh admin (jangan hardcode). Sistem kira "Minggu X / Y" dan "Fasa semasa" berdasarkan tarikh ini.

## 4. Katalog item (entitlement)

Setiap item yang boleh dikunci/dibuka ada **kunci (key)** tetap:

| Key | Item | Jenis |
|---|---|---|
| `sistem` | Akses sistem HDM BOOSTER (dashboard, tracker, cabaran) | modul |
| `ebook_strategi` | 01 Ebook Strategi HDM BOOSTER (Updated Version) | ebook |
| `ebook_muscle_mania` | 02 Ebook MUSCLE MANIA | ebook |
| `ebook_traditional_remedy` | 03 Ebook TRADITIONAL REMEDY | ebook |
| `ebook_tas` | 04 Ebook TAS | ebook |
| `ebook_food_swap` | 05 Ebook FOOD SWAP MATRIX | ebook |
| `ebook_emergency` | 06 Ebook HDM EMERGENCY PROTOCOL | ebook |
| `ebook_supplement` | 07 Ebook HDM SUPPLEMENT STACK | ebook |
| `tdee` | 08 CALCULATOR TDEE | tool |
| `graduation` | 09 GRADUATION REPORT (+ sijil) | modul |
| `group_hdm` | 10 Group Support HDM (Coach Iffat) | pautan group |
| `group_muscle_mania` | 11 Group Support MUSCLE MANIA (Coach Toy) | pautan group |

**Pakej (template entitlement):**
- **Pakej A — HDM BOOSTER BASIC (RM100):** `sistem`, `ebook_strategi`, `tdee`, `graduation`, `group_hdm`
- **Pakej B — HDM BOOSTER COMPLETE (RM150):** semua 12 item.

Admin boleh tambah item baharu (contoh ebook bonus) dan tambah pakej baharu tanpa ubah kod.

## 5. Sistem kod akses (TERAS sistem)

### 5.1 Format kod
- Contoh: `HDMB-A7K3-Q9XP` (awalan `HDMB-` + 8 aksara rawak dalam 2 kumpulan).
- Guna aksara yang tak mengelirukan sahaja: `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (tiada 0/O, 1/I/L).
- Jana dengan generator rawak kriptografi. Mesti unik. Input pengguna: abaikan huruf kecil/besar, ruang dan sengkang.
- Jangan dedahkan pakej dalam kod itu sendiri (pakej dibaca dari DB).

### 5.2 Data kod
Setiap kod menyimpan: `code`, `package_id`, `entitlements` (senarai key, disalin dari pakej semasa dijana; admin boleh tambah/buang item untuk kod tertentu), `batch_label` (contoh "Batch Rejab 1448"), `status` (`belum_guna` / `aktif` / `dibatalkan`), `redeemed_by` (user id), `redeemed_at`, `access_starts_at`, `access_ends_at`, `buyer_name`, `buyer_phone`, `buyer_email`, `order_ref` (no. order BCL), `note`, `created_by`, `created_at`.

### 5.3 Aliran penebusan (peserta)
1. Peserta buka `/aktif` → masukkan kod.
2. Sistem semak: wujud? status `belum_guna`? belum tamat tempoh? Mesej ralat yang jelas dalam BM untuk setiap kes ("Kod tidak sah", "Kod ini telah digunakan", "Kod ini telah dibatalkan, sila hubungi admin").
3. Kod sah → paparkan ringkasan pakej ("Anda akan dapat akses: …") → peserta isi nama penuh, no. telefon (format 60…), emel, kata laluan (atau login emel magic link) → akaun dicipta.
4. Kod terikat pada **satu akaun sahaja** (`status = aktif`). Kod yang sama tak boleh ditebus semula.
5. Peserta yang sudah ada akaun boleh tebus **kod tambahan** di `/akaun/kod` (contoh naik taraf A → B, atau kod bonus). Entitlement peserta = **gabungan semua kod aktif** miliknya.
6. Had cubaan: maksimum 5 cubaan gagal setiap 15 minit setiap IP/akaun (anti brute-force). Log semua cubaan.

### 5.4 Kod naik taraf (upgrade)
- Admin boleh jana pakej khas "Upgrade A → B" (RM50) yang mengandungi item B yang tiada dalam A.
- Bila ditebus, item baharu terbuka serta-merta.

### 5.5 Semakan akses (wajib di server)
- Semua semakan entitlement dibuat **di server / RLS**, bukan di frontend sahaja.
- Fail ebook disimpan dalam **bucket private**. Pautan hanya dijana sebagai **signed URL jangka pendek** (contoh 5 minit) selepas server sahkan entitlement.
- Item yang dikunci tetap **dipaparkan** di library dengan ikon mangga + label "Tersedia dalam Pakej Complete" + butang "Naik taraf" (pautan WhatsApp/borang upgrade). Ini membantu jualan upgrade.

### 5.6 Admin: urus kod
- **Jana kod pukal:** pilih pakej, bilangan (1–500), batch label, tarikh akses → jana → muat turun CSV (`kod, pakej, batch`).
- **Jana satu kod untuk pembeli tertentu:** isi nama, telefon, emel, no. order → jana → butang **"Hantar via WhatsApp"** (buka `wa.me/<telefon>?text=` dengan mesej templat berisi kod + pautan `/aktif` + langkah ringkas). Templat mesej boleh diedit admin.
- **Senarai kod:** cari (kod, nama, telefon, order), tapis (pakej, status, batch), lihat siapa tebus & bila.
- **Tindakan:** batalkan kod (akses ditarik serta-merta), aktifkan semula, tukar pakej/entitlement, lanjutkan tarikh tamat, **pindah kod ke akaun lain** (kes peserta salah daftar), lepaskan ikatan (reset ke `belum_guna`). Semua tindakan direkod dalam audit log.
- **Import CSV pembeli** dari export BCL → jana kod untuk setiap baris secara automatik, padankan pakej ikut nama produk/harga.
- (Opsyen, Fasa 3) **Webhook pembayaran:** jika BCL menyokong webhook/callback, endpoint `/api/webhook/bcl` menerima order berbayar → jana kod → hantar emel automatik. Sahkan tandatangan/secret. Jika tiada webhook, kekalkan aliran manual + import CSV.

## 6. Ciri peserta

### 6.1 Dashboard ("Progress Saya")
- Kad atas: fasa semasa (contoh "FASA 2 · SYAABAN"), **Minggu X / Y**, **Cabaran X / 3**, **Rekod N hari**, bar perjalanan 3 bulan (%).
- Kad metrik: berat semasa, perubahan berat sejak mula (kg), peratus lemak badan (jika direkod), **streak** hari aktif.
- Carta trend berat (berat sebenar vs garis sasaran).
- Daily tracker mini (I S R K J S A) untuk minggu ini, hari yang ada rekod ditanda.
- Pengumuman terkini dari admin/coach.
- Pintasan: "Rekod hari ini", "Baca ebook", "Kalkulator TDEE", "Group support".
- Kiraan countdown ke tarikh mula program jika belum bermula (sebelum 10/12/2026: paparan "Program bermula dalam…", tracker dibuka untuk rekod data permulaan sahaja).

### 6.2 Onboarding (sekali selepas akaun dicipta)
Kumpul data permulaan: jantina, umur, tinggi (cm), berat permulaan (kg), lemak badan % (opsyen), ukuran pinggang (cm, opsyen), tahap aktiviti, berat sasaran, gambar "before" (opsyen, **private**, hanya peserta & admin), sasaran protein harian (dicadang auto = 1.6–2.0 g/kg berat badan, boleh ubah). Akuan nota kesihatan (lihat Seksyen 10) mesti ditanda sebelum teruskan.

### 6.3 Daily tracker
Satu rekod setiap hari (boleh edit hari ini & 7 hari lepas sahaja):
- Berat (kg), protein (g), kalori (kcal, opsyen), air (liter), tetingkap intermittent fasting (jam mula–tamat makan, auto kira jam puasa), senaman (ya/tidak + jenis + minit), tidur (jam), mood/tenaga (1–5), nota.
- Pada **Fasa 3 Ramadan**, borang bertukar: puasa (ya/tidak/uzur), sahur (ya/tidak + protein), berbuka, air antara berbuka–sahur, terawih/senaman.
- Selepas simpan: mesej "Rekod hari ini disimpan" + tanda ✓ jika protein ≥ sasaran.
- Streak dikira berdasarkan hari berturut-turut yang ada rekod.

### 6.4 Pemantauan berat & ukuran
- Halaman "Progress": carta berat, lemak badan, ukuran pinggang; jadual sejarah; ringkasan mingguan (purata berat minggu ini vs minggu lepas).
- Muat naik gambar progress mingguan (opsyen, private), paparan sebelah-menyebelah (minggu 1 vs terkini).

### 6.5 Cabaran bulanan
- 3 cabaran ikut fasa. Setiap cabaran ada: tajuk, fokus, tarikh, **senarai misi** (checklist harian/mingguan yang admin tetapkan, contoh "Capai sasaran protein 5 hari minggu ini", "Senaman rintangan 3x seminggu") dan kriteria lulus.
- Peserta tanda misi selesai; sistem kira peratus siap dan lencana "Lulus Cabaran #N".
- Cabaran fasa akan datang dipaparkan berkunci sehingga tarikhnya.

### 6.6 Ebook library
- Grid kad dengan cover, nombor (01–07), tajuk, penerangan ringkas, status (terbuka / berkunci).
- **Pembaca dalam app** (PDF viewer, bukan muat turun terus) dengan **watermark** nama + no. telefon peserta di setiap halaman untuk menghalang perkongsian. Muat turun dibenarkan/dilarang ikut tetapan admin per ebook.
- Simpan halaman terakhir dibaca; tanda "Selesai dibaca".
- Admin boleh muat naik versi baharu ebook (peserta nampak label "Dikemas kini DD/MM/YYYY").

### 6.7 Kalkulator TDEE (`tdee`)
- Input: jantina, umur, tinggi, berat, tahap aktiviti (5 tahap dengan penerangan BM).
- Kira **BMR (Mifflin-St Jeor)**, **TDEE**, cadangan defisit (contoh −15% / −20% / −25% dengan label), sasaran protein (g), dan pecahan makro cadangan.
- Butang "Guna sebagai sasaran saya" → simpan ke profil. Pra-isi dari data onboarding.
- Nota: "Anggaran sahaja, bukan nasihat perubatan."

### 6.8 Group support
- Kad untuk setiap group yang peserta layak (`group_hdm`, `group_muscle_mania`): nama, coach, apa yang dibincang, butang **"Sertai Group"** (pautan jemputan WhatsApp/Telegram yang admin tetapkan).
- Pautan jemputan hanya diambil dari server selepas semakan entitlement (jangan letak dalam kod frontend).
- Group yang tidak layak: dikunci + butang naik taraf.

### 6.9 Graduation Report & sijil (`graduation`)
- Dibuka pada/selepas tarikh tamat program (admin boleh buka awal).
- **Graduation Report (PDF + paparan web):** nama, tarikh program, berat mula → akhir, jumlah perubahan (kg & %), lemak badan mula → akhir, ukuran pinggang, carta trend 3 bulan, jumlah hari direkod, streak terpanjang, cabaran yang lulus, purata protein, gambar before/after (jika peserta pilih untuk masukkan), ucapan dari coach.
- **Sijil penyertaan / tamat program** (PDF, reka bentuk landskap): nama, "telah menamatkan program HDM BOOSTER", tarikh, tandatangan Coach Iffat & Coach Toy, nombor sijil unik + kod QR ke halaman pengesahan `/sijil/<nombor>`.
- Syarat sijil boleh ditetapkan admin (contoh minimum 60 hari rekod, atau lulus 2 daripada 3 cabaran). Jika tidak capai, papar sijil penyertaan biasa.

### 6.10 Lain-lain
- Profil & tukar kata laluan, tetapan peringatan.
- **Peringatan harian** (web push untuk PWA; opsyen emel): "Jangan lupa rekod hari ini".
- Halaman "Bantuan": FAQ ringkas + butang WhatsApp 60134417042.
- Mod gelap opsyen.

## 7. Panel admin (`/admin`)

Peranan: `superadmin`, `admin`, `coach` (coach hanya boleh lihat progress peserta & hantar pengumuman, tak boleh urus kod/kewangan).

- **Ringkasan:** jumlah kod dijana / ditebus / belum ditebus ikut pakej, peserta aktif hari ini, peratus peserta merekod minggu ini, purata perubahan berat, peserta tidak aktif > 5 hari (untuk follow-up WhatsApp).
- **Kod akses:** seperti Seksyen 5.6.
- **Peserta:** senarai + carian, profil penuh, sejarah rekod, carta, entitlement semasa, kod yang ditebus, tindakan (reset kata laluan, gantung akaun, tambah entitlement manual), butang WhatsApp peserta.
- **Kandungan:** urus item & pakej (Seksyen 4), muat naik ebook + cover, tetapan fasa & tarikh, cabaran & misi, pautan group, templat mesej WhatsApp, pengumuman (boleh sasar ikut pakej).
- **Graduation:** buka/tutup akses report, syarat sijil, jana semula PDF.
- **Export CSV:** peserta, kod, rekod harian.
- **Audit log:** siapa buat apa & bila (kod, entitlement, akaun).

## 8. Model data (minimum)

`profiles`, `roles`, `items`, `packages`, `package_items`, `access_codes`, `code_redemptions`, `user_entitlements` (view/kiraan dari kod aktif + tambahan manual), `program_settings` (tarikh fasa), `phases`, `challenges`, `challenge_missions`, `mission_progress`, `daily_logs`, `measurements`, `progress_photos`, `ebooks` (fail, versi, cover, benarkan muat turun), `reading_progress`, `groups` (pautan jemputan), `announcements`, `certificates`, `redeem_attempts`, `audit_logs`.

Aktifkan **Row Level Security** pada semua jadual: peserta hanya boleh baca/tulis data sendiri; admin ikut peranan.

## 9. Keselamatan

- Semakan entitlement di server untuk setiap ebook, pautan group, report dan API.
- Signed URL jangka pendek untuk fail private; gambar progress tidak pernah public.
- Rate limit pada penebusan kod & login.
- Hadkan sesi serentak (contoh maksimum 2 peranti aktif setiap akaun) untuk kurangkan perkongsian akaun; admin boleh log keluar semua sesi peserta.
- Jangan simpan rahsia (service key, webhook secret) di frontend.
- Sandarkan DB secara berkala.

## 10. Privasi & kesihatan (wajib)

- Patuh **PDPA Malaysia**: notis privasi semasa daftar, peserta boleh minta data dipadam, data kesihatan & gambar dianggap sensitif.
- Nota kesihatan semasa onboarding & di footer: *"Jika anda ada penyakit kronik, mengambil ubat tertentu, hamil atau menyusukan anak, dapatkan nasihat doktor dahulu sebelum mengubah rutin puasa, pemakanan atau senaman."*
- Disclaimer: *"Hasil individu berbeza mengikut keadaan kesihatan, pemakanan, aktiviti fizikal dan konsistensi. Tiada jaminan penurunan berat tertentu."*
- Jangan paparkan sebarang janji hasil (contoh "turun 10kg dijamin") dalam sistem.
- Amaran lembut (bukan diagnosis) jika peserta rekod penurunan berat > 1.5 kg seminggu berturut-turut atau kalori sangat rendah: cadangkan berbincang dengan coach/doktor.

## 11. Reka bentuk

- Mobile-first, sesuai di lebar 375px tanpa scroll mendatar; navigasi bawah (tab bar) di telefon: **Utama · Rekod · Ebook · Cabaran · Akaun**; sidebar di desktop.
- Warna: biru utama `#2563eb`, oren aksen `#f97316`, gelap `#0f172a`, hijau kejayaan `#16a34a`; highlight kuning `#facc15` untuk pencapaian.
- Font: Outfit (tajuk), Quicksand (teks), Inter 800 (angka besar & metrik).
- Gaya seiring landing page HDM BOOSTER: kad bersudut bulat, bayang lembut, ikon Phosphor.
- Animasi ringkas (kiraan angka, lencana pop) dan hormati `prefers-reduced-motion`.
- Keadaan kosong yang membantu (contoh "Belum ada rekod. Mulakan rekod pertama anda hari ini.").

## 12. Peringkat pembinaan

**Fasa 1 (MVP, wajib siap dahulu):**
1. Auth + penebusan kod + entitlement (Seksyen 5.1–5.5).
2. Admin: jana kod (pukal & satu), senarai kod, batalkan, hantar via WhatsApp, export CSV.
3. Dashboard asas, onboarding, daily tracker, carta berat.
4. Ebook library dengan kunci + pembaca watermark.
5. Kalkulator TDEE.
6. Kad group support dengan pautan terkunci.

**Fasa 2:** cabaran bulanan & misi, progress foto, pengumuman, peringatan push, mod Ramadan tracker, panel peserta untuk coach.

**Fasa 3:** Graduation Report PDF, sijil + halaman pengesahan QR, import CSV BCL, webhook pembayaran (jika ada), analitik admin.

## 13. Definition of Done

- Kod Pakej A **tidak** boleh membuka ebook 02–07 atau Group MUSCLE MANIA, walaupun URL/API dipanggil terus (uji secara manual).
- Kod Pakej B membuka semua 12 item.
- Kod yang sama gagal ditebus kali kedua; kod dibatalkan menarik akses serta-merta.
- Kod upgrade A → B membuka item tambahan tanpa perlu akaun baharu.
- Semua halaman berfungsi di 375px & desktop, tiada scroll mendatar.
- Fasa semasa & "Minggu X / Y" tepat ikut tarikh 10/12/2026 – 10/03/2027 (zon masa MYT).
- Seed data contoh: 1 superadmin, 3 kod Pakej A, 3 kod Pakej B, 1 kod upgrade, 7 ebook placeholder, 3 cabaran, 2 group.
- Sediakan README: cara setup env, migrasi DB, cipta admin pertama, dan cara jana kod untuk pembeli.
