# HDM BOOSTER — Reka Bentuk Sistem v2 (HornetHive + Cloudflare Workers + Firebase Auth + Apps Script)

Tarikh: 13/11/2026 · Status: diterima pemilik ("start terus buat sistem") — keputusan pereka ditanda **[pereka]** dan boleh dibetulkan pemilik.

Dokumen ini menggantikan reka bentuk v1 (Supabase, arkib di tag git `arkib/supabase-v1`). Fakta program, katalog item, pakej, ciri peserta, privasi/kesihatan dan reka bentuk visual dalam `PROMPT-SISTEM-HDM-BOOSTER.md` ("MD asal") **kekal terpakai** kecuali yang diubah di sini.

---

## 1. Niat & kenapa

Pemilik (seorang diri, bukan developer) menjual program transformasi badan 3 bulan HDM BOOSTER melalui borang BCL.my, **ikut batch tahunan** (Rejab–Ramadan), untuk jangka panjang. Pembeli mesti dapat akses ikut pakej secara automatik dan guna sistem setiap hari untuk rekod progress.

Pemilik memilih HornetHive kerana **kos**: percuma pada mulanya, dan bila membesar hanya RM7/bulan (Starter) berbanding ~RM110/bulan untuk naik taraf Supabase. Pemilik **sanggup bayar** pelan Starter bila perlu.

**Kejayaan:** peserta beli → terus boleh daftar → nampak hanya apa yang dibeli → rekod setiap hari tanpa masalah login atau gagal simpan.

## 2. Matlamat, bukan-matlamat, anti-matlamat

**Matlamat**
- Akses automatik selepas bayaran BCL, ikut pakej (Pakej A / B; Upgrade A→B melalui kod sahaja).
- Ciri peserta MD asal §6, diperingkatkan ikut tarikh (§10 di bawah).
- Menu Admin dalam app yang sama: `superadmin` (pemilik) dan `coach` (Coach Iffat, lihat sahaja + pengumuman).
- Kos rendah: RM0 secara lalai; HornetHive Starter (RM84/tahun) diterima.

**Bukan-matlamat**
- Panel admin berasingan / Google Sheet sebagai pusat kawalan.
- Akaun admin untuk Coach Toy.
- PWA penuh / web push (Blogspot). Diganti emel + panduan "Tambah ke Skrin Utama".
- Domain sendiri (guna `*.blogspot.com`).
- WhatsApp automatik (kekal butang `wa.me`).
- Data wajib kekal di Malaysia (bukan sebab pemilihan; Firebase & Cloudflare memproses data di luar negara — dinyatakan dalam notis privasi).

**Anti-matlamat (gagal walaupun "berfungsi")**
- **Peserta tak boleh login, atau rekod harian gagal disimpan / hilang.** Keutamaan nombor satu.
- Peserta nampak/ubah data peserta lain, atau Pakej A buka item Pakej B melalui apa-apa jalan (UI, API Worker, Apps Script, URL terus).
- Sebarang kunci HornetHive dalam browser / repo.
- Janji hasil berat badan (MD asal §10).

## 3. Seni bina

```
 Pembeli ──bayar──► BCL.my ──webhook──► Apps Script (doPost)
                                          │ sahkan via BCL API
                                          │ POST /internal/purchase (HMAC)
                                          ▼
 Peserta/Admin ◄──► App SPA (Blogspot) ──ID token──► Cloudflare Worker ──kunci dml──► HornetHive (Postgres 18)
        │                 │                              │  ▲
        │                 └──login/reset──► Firebase Auth │  └─ tiket ebook bertandatangan (HMAC, 5 min)
        │                                                ▼
        └──────────── tiket ──────────────► Apps Script ──► Google Drive (ebook, gambar, sijil, backup)
```

### 3.1 Pembahagian kerja

| Komponen | Tanggungjawab |
|---|---|
| **Blogspot** | Hos satu halaman SPA (Preact, hash routing). Paparan sahaja. JS/CSS dari jsDelivr (repo GitHub awam). |
| **Firebase Auth** | Identiti peserta: log masuk emel + kata laluan, sesi kekal (refresh token), emel "lupa kata laluan" (templat BM). **Pendaftaran awam dimatikan** — akaun hanya dicipta oleh Worker. |
| **Cloudflare Worker** | **Satu-satunya pintu ke data.** Sahkan ID token Firebase, tentukan `uid` dari token sahaja, semak peranan & entitlement, panggil HornetHive dengan kunci `dml` (Worker secret). Had cubaan, cache katalog, keluarkan tiket ebook. |
| **HornetHive** | Semua data berstruktur. Logik transaksi (tebus kod, tuntut pembelian, tindakan admin) sebagai fungsi Postgres yang menerima `p_uid` dari Worker. |
| **Apps Script** | BCL webhook + polling sandaran, sajikan ebook dari Drive (selepas sahkan tiket Worker), muat naik gambar (Peringkat 3), emel transaksi & peringatan, backup malam ke Drive, PDF report/sijil (Peringkat 3). |
| **Google Drive** | Ebook PDF, cover, gambar, PDF report/sijil, backup. Semua private milik pemilik. |

**Prinsip:** trafik harian (login, rekod, dashboard) = browser → Firebase / Worker → HornetHive. Apps Script hanya untuk kerja jarang/berat (had ~30 pelaksanaan serentak, 1–3 s).

### 3.2 Model keselamatan (ganti RLS)

HornetHive tiada RLS per-pengguna. Keselamatan dibina dalam tiga lapis:

1. **Kunci (database permission)** — kunci `dml` hanya dalam Worker secret; kunci `read` hanya dalam Apps Script Script Properties (backup); kunci `ddl` hanya di komputer pemilik/builder untuk migrasi. Setiap kunci dihadkan kepada database HDM sahaja. **Tiada kunci dalam browser.** Origin browser tidak didaftarkan di HornetHive.
2. **Pengesahan (Worker)** — setiap permintaan `/api/*` (kecuali senarai awam eksplisit: `check-purchase`, `register`, `sijil/:no`) mesti ada `Authorization: Bearer <Firebase ID token>`. Worker sahkan tandatangan (JWKS Google `securetoken`), `aud` = projek Firebase, `iss`, `exp`. `uid` diambil dari token **sahaja**; sebarang `user_id` dalam badan permintaan diabaikan.
3. **Kebenaran (Worker + fungsi SQL)** — setiap endpoint diisytihar dengan peranan yang dibenarkan (`peserta`, `coach`, `superadmin`) dan item entitlement yang diperlukan. Fungsi SQL menerima `p_uid` sebagai parameter pertama dan sentiasa menapis `where user_id = p_uid` untuk data peserta. Peranan dibaca dari jadual `user_roles`.

**Ganti "barisan kedua" RLS:** setiap endpoint ada ujian keselamatan automatik (peserta A cuba baca/ubah data peserta B; Pakej A cuba item B; coach cuba tindakan superadmin; tanpa token; token tamat). Suite ini wajib lulus sebelum setiap deploy.

### 3.3 Akses data dari Worker **[pereka]**
- Worker guna HornetHive `POST /query` (SQL satu kenyataan, parameter `$1…`) — **bukan** endpoint REST senarai (ada cache 5 minit yang boleh paparkan data lama selepas simpan). Builder mesti sahkan `/query` tidak di-cache.
- Bacaan gabungan untuk satu skrin = satu fungsi SQL yang memulangkan `jsonb` (contoh `app_home(p_uid)`), supaya **satu skrin ≈ satu panggilan API HornetHive** (bajet 500K/bulan pelan percuma).
- Katalog (items, packages, ebooks, batch semasa, app_settings awam) di-cache dalam Cache API Worker 5 minit dan dalam browser.
- Migrasi: fail SQL dalam `db/migrations/`, dijalankan oleh skrip `scripts/migrate.mjs` dengan kunci `ddl` (pecah fail kepada kenyataan, menghormati blok `$$`), rekod dalam jadual `schema_migrations`. Builder sahkan HornetHive membenarkan `create function … language plpgsql`, `create trigger`, `pgcrypto`/`gen_random_uuid()`; jika tidak, logik dipindah ke Worker.

### 3.4 Persekitaran **[pereka]**
- Pelan **HornetHive Starter (RM84/tahun)** dari awal: database `hdm_dev` dan `hdm_prod` (+1 simpanan). Pemilik sudah bersetuju membayar.
- Dua projek Firebase (`hdm-dev`, `hdm-prod`), dua Worker (`hdm-api-dev`, `hdm-api`), dua deployment Apps Script.

### 3.5 Frontend
- Preact + TypeScript + Tailwind, dibina ke `dist/app.js` + `dist/app.css` (nama tetap), dihantar melalui jsDelivr; template Blogspot dibersihkan sepenuhnya.
- `window.HDM_CONFIG = { firebase: {apiKey, authDomain, projectId}, apiUrl, gasUrl }` — nilai awam sahaja.
- Mobile-first 375px, tab bar: Utama · Rekod · Ebook · Cabaran · Akaun (+ Admin untuk staf). Font, warna, ikon ikut MD asal §11. Mod gelap opsyen.
- UI dilakar dahulu di **Superdesign** (skrin utama, daftar/masuk, library, pembaca, TDEE, group, akaun, admin) sebelum kod UI.

## 4. Batch (kohort)
Kekal seperti v1:
- Jadual `batches`: nama, jualan dibuka/ditutup, mula/tamat program, tarikh setiap fasa (jsonb), status. Admin cipta batch baharu setiap tahun tanpa ubah kod.
- Pembelian masuk ke batch yang sedang dibuka untuk jualan pada tarikh bayaran.
- Fasa semasa, Minggu X/Y, cabaran, pengumuman, analisis, report & sijil ikut batch peserta.
- Peserta lama beli semula → akaun sama, batch baharu.
- Ebook & TDEE akses selama-lamanya; tracker/cabaran/report ikut batch (baca sahaja selepas tamat); group ditetapkan per batch.

## 5. Aliran pembelian → akses (TERAS)

### 5.1 BCL (laluan utama)
1. Pembeli isi borang BCL (nama, emel, telefon) dan bayar.
2. BCL panggil Apps Script `doPost?src=bcl&k=<kunci>`.
3. Apps Script sahkan semula order: `GET https://bcl.my/api/transactions/{order}` (Bearer token) — mesti `status = 3`, `is_paid = true`, jenis `live`. Dedupe ikut no. order.
4. Padan pakej melalui `bcl_form_map` (formable_id dan/atau jumlah ± RM3 dan/atau nilai medan). Borang tiada dalam pemetaan → diabaikan (dilog). Borang HDM tak padan → `perlu_semakan`.
5. Apps Script `POST {Worker}/internal/purchase` dengan tandatangan HMAC (`INTERNAL_SECRET`, cap masa ±5 min). Worker panggil `upsert_purchase(...)`: simpan `purchases` (emel huruf kecil, telefon `60…`), salin entitlement pakej, pilih batch, auto-tuntut ke akaun sedia ada jika emel **dan** telefon padan, beratur emel alu-aluan sekali sahaja.
6. Apps Script hantar emel "Pembayaran diterima — daftar akaun" + pautan `#/daftar` (baris gilir; kuota MailApp ~100/hari, lebihan ditangguh, admin nampak "belum diemel").
7. Jaring keselamatan: trigger 10 minit menyemak transaksi BCL terkini dan memproses yang belum ada.

Nota: medan BCL disahkan dengan satu order ujian dan log payload sebenar sebelum siap (sumber v1: integrasi pihak ketiga cave-lms).

### 5.2 Pendaftaran
- `#/daftar`: emel + telefon + nama + kata laluan + akuan privasi.
- Browser → `POST /api/register` (awam, had 5 gagal/15 min per IP). Worker semak `purchases` padan emel **dan** telefon:
  - padan & belum ada akaun → Worker cipta akaun Firebase (Admin API, service account), cipta `profiles`, tuntut semua pembelian yang padan, pulang ok → browser log masuk dengan emel + kata laluan;
  - tiada padanan → "Emel/telefon ini tiada rekod pembelian. Pastikan sama seperti semasa beli di BCL, atau WhatsApp 60134417042.";
  - emel sudah ada akaun → "Emel ini sudah ada akaun. Sila log masuk atau tekan Lupa Kata Laluan."
- Kerana pendaftaran awam Firebase dimatikan, "squatter" (orang lain daftar dengan emel pembeli) tidak boleh berlaku.
- Sandaran jika tetapan "matikan sign-up" memerlukan pelan Firebase berbayar (builder sahkan): akaun Firebase **tanpa** baris `profiles` dianggap yatim dan tiada akses langsung (Worker tolak semua `/api/*` selain `register`). Bila pembeli sebenar mendaftar dan emel + telefon padan pembelian, Worker padam akaun yatim itu melalui Admin API dan cipta semula.
- Pembelian baharu dengan emel+telefon akaun sedia ada → dituntut automatik.
- Naik taraf A→B: butang WhatsApp → pemilik urus bayaran beza → beri item melalui Admin (pemberian manual atau kod Upgrade A→B).

### 5.3 Kod akses (sandaran)
Kekal MD asal §5.1–5.4: format `HDMB-XXXX-XXXX`, abjad `ABCDEFGHJKMNPQRSTUVWXYZ23456789`, rawak kriptografi, tebus di `#/aktif` / `#/akaun/kod`, 5 gagal/15 min per pengguna & IP, status `belum_guna|aktif|dibatalkan`, tindakan admin (batal, aktif semula, lepaskan, pindah, tukar entitlement, lanjut tarikh) dengan audit.

### 5.4 Entitlement
Entitlement = gabungan pembelian dituntut + kod aktif belum tamat + pemberian manual belum ditarik. Dikira oleh fungsi SQL `entitlements_for(p_uid)`; digunakan Worker untuk setiap semakan. Pembatalan berkesan serta-merta (tiada cache entitlement di Worker).

Item berkunci tetap dipaparkan (mangga + "Tersedia dalam Pakej Complete" + butang Naik taraf WhatsApp).

## 6. Ebook & fail Drive
- Browser minta `POST /api/ebook/:id/ticket` → Worker semak entitlement → pulang tiket `{ebookId, uid, exp}` ditandatangani HMAC (`TICKET_SECRET`, 5 min) + metadata.
- Browser panggil Apps Script `ebook.meta` / `ebook.chunk` dengan tiket. Apps Script sahkan tandatangan & tamat tempoh (tiada panggilan Firebase/HornetHive), baca fail Drive (ID dari `DRIVE_EBOOK_MAP` yang Worker sertakan dalam tiket — **[pereka]**: tiket membawa `fileId` supaya Apps Script tak perlu akses DB), pulang potongan 4 MB base64.
- Frontend render dengan pdf.js, watermark nama + telefon dilukis ke canvas, cache IndexedDB ikut `id:versi`.
- Gambar (Peringkat 3a) guna corak tiket yang sama untuk muat naik/papar.

## 7. Menu Admin
Kekal skop v1 §6, melalui endpoint Worker `/api/admin/*`:
- **Superadmin:** ringkasan, pembelian (cari, tapis, "Perlu semakan", tetapkan pakej, pindah, batal/pulih, proses semula order, hantar semula emel, WhatsApp), pemetaan BCL, kod akses, peserta (profil, entitlement, pemberian manual, **reset kata laluan** melalui Firebase Admin API, WhatsApp), kandungan (batch & fasa, ebook, group, pakej & item, templat), export CSV, audit log, **penggunaan API HornetHive bulan ini**, log ralat webhook.
- **Coach:** ringkasan + peserta (baca sahaja) + pengumuman.
- Setiap mutasi admin menulis `audit_logs`.

## 8. Had & kos

| Perkhidmatan | Had relevan | Pendekatan |
|---|---|---|
| HornetHive Starter (RM84/thn) | 3 DB, 5 GB, 2.5M panggilan/bulan | 1 panggilan/skrin, cache katalog; papar penggunaan di Admin |
| Cloudflare Workers Free | 100K permintaan/hari, 10 ms CPU | Pengesahan JWT dengan JWKS di-cache |
| Firebase Auth (Spark) | 50K MAU; emel reset terbina | Pendaftaran awam dimatikan |
| Apps Script | ~30 serentak, 6 min, MailApp ~100/hari | Hanya kerja jarang; baris gilir emel |
| Google Drive | 15 GB | Mampat gambar ≤300 KB |

## 9. Kebolehpercayaan
- Login: sesi Firebase kekal; "Lupa kata laluan" terbina; reset oleh admin; mesej ralat BM yang memberi tindakan.
- Simpan rekod (Peringkat 2): upsert unik `(user_id, tarikh)`; jika gagal/offline simpan dalam peranti dan cuba semula automatik dengan status "Belum dihantar / Disimpan"; butang dikunci semasa hantar.
- Tarikh/hari dikira dalam `Asia/Kuala_Lumpur`.
- Backup: Apps Script eksport semua jadual setiap malam (kunci `read`) ke Drive, simpan 30 hari; ditambah backup manual HornetHive sebelum setiap migrasi.
- Sebelum 01/12: ujian hujung-ke-hujung dengan order BCL ujian & live; ujian beban ~200 permintaan serentak ke Worker; suite keselamatan lulus; senarai semak Definition of Done MD asal §13 (tanpa PWA/import CSV).

## 10. Peringkat & tarikh akhir

| Peringkat | Tarikh akhir | Skop |
|---|---|---|
| 1 | **sebelum 01/12/2026** | Skema & migrasi, Worker (auth, kebenaran, endpoint teras), Firebase (daftar/masuk/lupa), webhook BCL + polling, pembelian, entitlement, onboarding, library ebook + pembaca watermark, TDEE, kad group, kod akses; Admin: pemetaan BCL, pembelian, kod, peserta, kandungan, export, audit; backup |
| 2 | sebelum 10/12/2026 | Dashboard Progress Saya, daily tracker + sejarah + carta, Cabaran #1, pengumuman, emel peringatan; Admin: progress peserta, tidak aktif, akses coach |
| 3a | sebelum 10/01/2027 | Gambar progress, Cabaran #2 |
| 3b | sebelum 08/02/2027 | Mod Ramadan, Cabaran #3 |
| 3c | sebelum 10/03/2027 | Graduation Report, sijil + pengesahan QR, analisis penuh |

## 11. Pendekatan yang dipertimbangkan

| Pendekatan | Untung | Rugi | Keputusan |
|---|---|---|---|
| Supabase (v1) | RLS & auth terbina, satu servis | Naik taraf ~RM110/bulan | Ditolak pemilik (kos jangka panjang) |
| HornetHive + Apps Script sahaja (auth sendiri) | 2 servis | Had serentak Apps Script → risiko gagal simpan; kata laluan diurus sendiri | Ditolak (anti-matlamat #1) |
| HornetHive + Cloudflare (auth sendiri) | 3 servis | Hash kata laluan, sesi, emel reset ditulis sendiri | Ditolak (risiko lebih tinggi) |
| **HornetHive + Cloudflare + Firebase + Apps Script** | Risiko paling rendah, login & reset terbina, kos rendah | 4 servis; keselamatan bergantung pada kod Worker | **Dipilih pemilik** |

## 12. Keputusan pereka (untuk disemak pemilik)
1. Worker guna `/query` + fungsi SQL pulang `jsonb`, bukan REST senarai (elak cache 5 minit, jimat panggilan).
2. Pendaftaran awam Firebase dimatikan; akaun dicipta oleh Worker selepas padanan emel + telefon.
3. Apps Script tidak sentuh HornetHive untuk ebook; ia hanya percaya tiket HMAC dari Worker.
4. Apps Script menghantar pembelian melalui Worker (`/internal/purchase`, HMAC), bukan terus ke HornetHive — logik pembelian di satu tempat.
5. HornetHive Starter dari hari pertama untuk dev + prod.
6. Ebook & TDEE akses selama-lamanya; tracker/cabaran/report ikut batch; group per batch (dari v1).
7. Had sesi 2 peranti digugurkan buat masa ini (Firebase percuma tiada kawalan terbina).

## 13. Diserahkan kepada builder
- Rangka kerja router Worker (contoh Hono) dan pustaka JWT (contoh `jose`).
- Skema jadual tepat (bermula dari MD asal §8 + `purchases`, `bcl_form_map`, `bcl_webhook_log`, `email_queue`, `redeem_attempts`, `schema_migrations`; `user_id` = Firebase uid `text`).
- Cara pecah & jalankan migrasi pada HornetHive; sahkan sokongan plpgsql/trigger/pgcrypto.
- Strategi cache Worker & had cubaan.
- Cara penghantaran jsDelivr + template Blogspot.
- README BM: setup HornetHive, Firebase (matikan sign-up, templat emel BM, domain dibenarkan), Cloudflare (`wrangler secret`), Apps Script (Script Properties, trigger), BCL webhook, Blogspot, cipta superadmin pertama, mulakan batch baharu.

## 14. Rujukan
- `PROMPT-SISTEM-HDM-BOOSTER.md` (MD asal)
- Reka bentuk v1: tag git `arkib/supabase-v1`
- HornetHive docs: https://hornethive.io/docs/rest-api , https://hornethive.io/docs/javascript
- Integrasi BCL pihak ketiga: github.com/H4fizWasabie/cave-lms PR #178, #188, #213
