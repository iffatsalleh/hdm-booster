# HDM BOOSTER — Reka Bentuk Sistem (Blogspot + Apps Script + Supabase)

Tarikh: 12/11/2026 · Status: draf untuk kelulusan

Dokumen ini **menggantikan seksyen teknikal** dalam `PROMPT-SISTEM-HDM-BOOSTER.md` (selepas ini "MD asal"). Fakta program, katalog item, pakej, ciri peserta, privasi/kesihatan dan reka bentuk visual dalam MD asal **kekal terpakai** kecuali yang diubah di sini.

---

## 1. Niat & kenapa

Pemilik (seorang diri, bukan developer) menjual program transformasi badan 3 bulan HDM BOOSTER melalui borang BCL.my. Pembeli perlu dapat akses ikut pakej yang dibeli, secara automatik, dan guna sistem setiap hari untuk rekod progress.

Kekangan utama pemilik: **kos bulanan RM0**. Sebab itu stack ditukar daripada Next.js/Vercel kepada Blogspot + Google Apps Script + Supabase (pelan percuma), dengan semua fail disimpan di Google Drive.

**Kejayaan:** peserta beli → terus boleh daftar → nampak hanya apa yang dibeli → rekod setiap hari tanpa masalah login atau gagal simpan data.

**Jangka hayat (keputusan pemilik):** program dijual **ikut batch tahunan** (Rejab–Ramadan setiap tahun) dan sistem ini akan digunakan **untuk jangka panjang**. Batch pertama: Rejab 1448 (jualan dibuka 01/12/2026, diet bermula 10/12/2026).

## 2. Matlamat, bukan-matlamat, anti-matlamat

**Matlamat**
- Akses automatik selepas bayaran BCL, ikut pakej (Pakej A / B / Upgrade A→B).
- Semua ciri peserta dalam MD asal (dengan pengecualian di bawah), diperingkatkan ikut tarikh.
- Menu Admin dalam app yang sama untuk pemilik (superadmin) dan Coach Iffat (coach, lihat sahaja).
- Kos RM0/bulan untuk ≥500 peserta.

**Bukan-matlamat**
- Panel admin berasingan atau Google Sheet sebagai pusat kawalan (pemilik tolak secara jelas).
- Coach Toy tidak perlu akaun admin.
- PWA penuh / web push (Blogspot tak benarkan fail di root domain). Diganti dengan emel + panduan shortcut skrin utama.
- Domain sendiri (guna `*.blogspot.com`).
- Penghantaran WhatsApp automatik (API WhatsApp berbayar). WhatsApp kekal butang `wa.me` manual.

**Anti-matlamat (gagal walaupun "berfungsi")**
- **Peserta tak boleh login, atau rekod harian gagal disimpan / hilang.** Ini keutamaan nombor satu pemilik.
- Sebarang kos bulanan berbayar.
- Pakej A boleh buka item Pakej B melalui apa-apa jalan (UI, API, URL terus).
- Janji hasil berat badan (lihat MD asal §10).

## 3. Seni bina

```
 Pembeli ──bayar──► BCL.my ──webhook──► Apps Script (doPost)
                                          │ sahkan via BCL API
                                          ▼
 Peserta/Admin ◄──► App (HTML/JS dalam Blogspot) ◄──► Supabase (Auth + Postgres + RLS + RPC)
                          │                                   ▲
                          └──► Apps Script (Drive, emel) ─────┘ (service role)
                                    │
                                    ▼
                               Google Drive (ebook PDF, gambar, sijil, backup)
```

### 3.1 Pembahagian kerja (keputusan pemilik: diluluskan)

| Komponen | Tanggungjawab |
|---|---|
| **Blogspot** | Hos satu halaman app (SPA). Paparan sahaja. Hash routing (`#/aktif`, `#/rekod`, `#/admin/...`). |
| **Supabase (percuma)** | Auth (emel + kata laluan), semua data berstruktur, semakan entitlement melalui RLS & fungsi RPC `security definer`. **Tiada Supabase Storage, tiada Edge Functions.** |
| **Apps Script** | Kerja yang perlukan Drive, emel atau rahsia luar: webhook BCL + polling sandaran, sajikan ebook & gambar dari Drive selepas semak entitlement, muat naik gambar, emel transaksi & peringatan, backup harian, keep-alive Supabase, jana PDF report/sijil (Peringkat 3). |
| **Google Drive** | Ebook PDF, cover, gambar before/progress, PDF report & sijil, fail backup. Semua **private** milik akaun pemilik; tidak pernah dikongsi secara awam. |

**Prinsip:** trafik harian yang kerap (login, baca/tulis rekod, dashboard, pautan group) terus ke Supabase. Apps Script hanya untuk kerja jarang/berat, kerana had ~30 pelaksanaan serentak dan 1–3 s setiap panggilan.

### 3.2 Frontend
- Satu SPA dimuatkan dalam template Blogspot. Peserta tidak patut nampak elemen Blogspot (header, sidebar, komen, navbar) — template dibersihkan sepenuhnya.
- Kod sumber dalam folder projek ini; output build ialah fail JS/CSS. **Cara penghantaran ke Blogspot diserahkan kepada builder** (contoh: inline dalam template, atau dimuat dari jsDelivr/GitHub). Syarat: percuma, dan pemilik boleh kemas kini tanpa langkah teknikal yang rumit (sediakan skrip/arahan satu langkah).
- Kunci `anon` Supabase boleh berada di frontend; **service role key dan token BCL hanya dalam Apps Script Script Properties.**
- Mobile-first 375px, tab bar bawah: Utama · Rekod · Ebook · Cabaran · Akaun (+ Admin untuk peranan admin/coach). Font, warna, ikon ikut MD asal §11.
- Mod gelap opsyen.

### 3.3 Supabase
- **Auth:** emel + kata laluan. **Pengesahan emel DIMATIKAN** (keputusan pemilik). Sesi kekal (refresh token) supaya peserta tak perlu login semula.
- **SMTP tersuai:** emel "lupa kata laluan" mesti melalui SMTP Gmail pemilik (app password), bukan SMTP terbina Supabase (had beberapa emel sejam).
- **RLS pada semua jadual.** Peserta baca/tulis data sendiri; admin/coach ikut peranan.
- Logik sensitif (tebus kod, tuntut pembelian, tindakan admin) sebagai fungsi Postgres `security definer` yang semak `auth.uid()` dan peranan.
- **Keep-alive:** Apps Script ping Supabase setiap hari (projek percuma "tidur" selepas 7 hari tanpa aktiviti).
- **Backup:** Apps Script eksport semua jadual setiap malam ke folder Drive (simpan 30 hari).

### 3.4 Pengesahan identiti untuk Apps Script
Frontend menghantar access token Supabase (JWT) kepada Apps Script. Apps Script sahkan token (contoh panggil `GET /auth/v1/user`), kemudian semak entitlement di Supabase dengan service role sebelum memulangkan apa-apa dari Drive.

## 3.5 Batch (kohort)

Sistem mesti menyokong banyak batch dari hari pertama (mahal untuk diubah selepas 01/12).
- Jadual `batches`: nama (contoh "Batch Rejab 1448"), tarikh jualan dibuka/ditutup, tarikh mula & tamat program, tarikh setiap fasa, status (`akan_datang` / `berjalan` / `tamat`). Admin cipta batch baharu setiap tahun tanpa ubah kod.
- Setiap pembelian dan setiap peserta-dalam-program terikat pada satu batch. Pembelian BCL masuk ke **batch yang sedang dibuka untuk jualan** pada tarikh bayaran.
- "Fasa semasa", "Minggu X / Y", cabaran, pengumuman (boleh sasar ikut batch), analisis, Graduation Report dan sijil semuanya **ikut batch peserta**, bukan tarikh global.
- Pembeli lewat (beli selepas diet bermula, sebelum jualan ditutup) ikut tarikh batch yang sama; Minggu X dikira dari tarikh mula batch.
- Peserta lama yang beli semula tahun berikutnya: akaun yang sama, disertakan dalam batch baharu (rekod & report setiap batch berasingan; sejarah batch lama kekal boleh dilihat).

**Tempoh akses (keputusan builder/pereka — pemilik boleh ubah):** ebook, kalkulator TDEE dan bahan bacaan kekal boleh diakses **selama-lamanya** selepas dibeli. Tracker, cabaran dan Graduation Report terikat pada batch (selepas batch tamat: baca sahaja). Pautan group ditetapkan **per batch** (setiap batch ada group sendiri), jadi peserta nampak group batch mereka sahaja.

## 4. Aliran pembelian → akses (TERAS)

### 4.1 Automatik melalui BCL (laluan utama)
1. Pembeli isi borang BCL (**nama, emel, telefon** — tiga medan sahaja) dan bayar.
2. BCL panggil URL Web App Apps Script (`doPost`).
3. Webhook BCL **tidak bertandatangan**. Apps Script **wajib sahkan semula** setiap order melalui `GET https://bcl.my/api/transactions/{order}` (header `Authorization: Bearer <BCL_API_TOKEN>`): mesti `status = 3`, `is_paid = true`, jenis `live`. Dedupe ikut no. order.
4. Padankan order kepada pakej melalui jadual pemetaan (`bcl_form_map`) yang pemilik urus di menu Admin. Hanya ada **dua pakej dijual: Pakej A dan Pakej B (tiada pakej upgrade di BCL)**. Belum dipastikan sama ada A dan B ialah dua borang berasingan atau satu borang dengan pilihan — jadi pemetaan mesti menyokong padanan ikut `formable_id` **dan/atau** jumlah bayaran / nilai medan pilihan. Order dari borang yang **tiada dalam pemetaan diabaikan** (dilog sahaja, tidak masuk "Perlu semakan") kerana akaun BCL mungkin menjual produk lain. Order dari borang HDM BOOSTER yang tak dapat dipadankan kepada pakej → senarai "Perlu semakan", tiada akses diberi.
5. Simpan dalam `purchases`: order_ref, nama, emel (huruf kecil), telefon (dinormalkan ke `60…`), package_id, jumlah, status `belum_dituntut`.
6. Emel pembeli: "Pembayaran diterima — daftar akaun HDM BOOSTER" + pautan `#/daftar`.
7. **Jaring keselamatan:** Apps Script tidak boleh membalas HTTP 500 untuk minta BCL cuba semula, jadi trigger masa setiap 10 minit menyemak senarai transaksi BCL terkini dan memproses order berbayar yang belum ada dalam `purchases`.

Nota: maklumat BCL di atas diperoleh dari integrasi pihak ketiga (cave-lms), bukan dokumentasi rasmi. Builder **mesti** sahkan nama medan sebenar (terutama dalam `custom_fields_data` / `main_data`) dengan satu order ujian dan log payload webhook sebenar sebelum siap.

### 4.2 Pendaftaran
- Peserta buka `#/daftar`, isi **emel + no. telefon** (mesti sama seperti di BCL) + nama + kata laluan.
- RPC semak `purchases` padan emel **dan** telefon → jika padan, cipta akaun dan tuntut pembelian (`dituntut`, `claimed_by`). Jika tak padan: mesej BM yang jelas ("Emel/telefon ini tiada rekod pembelian. Pastikan sama seperti semasa beli di BCL, atau hubungi 60134417042").
- Keperluan telefon = keputusan reka bentuk (bukan pemilik) untuk menghalang orang lain mendaftar dengan emel pembeli kerana emel tidak disahkan.
- Pembelian baharu dengan emel yang sudah ada akaun (contoh pembeli A yang kemudian beli B, atau peserta lama yang sertai batch tahun depan) → **dituntut automatik** ke akaun itu; item terbuka serta-merta.
- **Naik taraf A → B:** tiada pakej upgrade di BCL. Butang "Naik taraf" pada item berkunci membuka WhatsApp 60134417042 dengan mesej templat. Pemilik uruskan bayaran beza secara manual, kemudian beri item tambahan melalui Admin (pemberian manual atau kod akses Upgrade A→B). Pakej "Upgrade A→B" kekal sebagai pakej dalaman untuk kod sahaja.
- Akaun boleh wujud tanpa pembelian (contoh signUp dipanggil terus); ia tidak dapat apa-apa entitlement.

### 4.3 Kod akses (laluan sandaran)
Kekal seperti MD asal §5.1–5.4 (format `HDMB-XXXX-XXXX`, status, tebus di `#/aktif` atau `#/akaun/kod`, had 5 cubaan gagal / 15 minit, upgrade). Digunakan untuk: hadiah, kes manual, pembeli yang guna emel lain. Kod dijana di Admin (Postgres, rawak kriptografi). Tiada import CSV BCL (tidak perlu kerana webhook).

### 4.4 Entitlement
Entitlement peserta = gabungan **pembelian dituntut** + **kod aktif** + **pemberian manual admin**, tolak yang dibatalkan, dalam tempoh akses. Dikira dalam satu view/fungsi Postgres dan digunakan oleh RLS (pautan group, data) dan Apps Script (ebook, gambar). Pembatalan berkesan serta-merta.

Item berkunci tetap dipaparkan dengan ikon mangga + "Tersedia dalam Pakej Complete" + butang naik taraf (WhatsApp, lihat §4.2).

## 5. Ciri peserta

Ikut MD asal §6 dengan perubahan berikut:
- **Ebook (§6.6):** PDF di Drive. Apps Script pulangkan kandungan PDF selepas semak entitlement; frontend render dengan pdf.js dan tindih watermark (nama + telefon) pada setiap halaman. Tiada pautan Drive terus. Muat turun ikut tetapan per ebook. Saiz PDF & had respons Apps Script — builder tentukan strategi (contoh cache dalam IndexedDB, mampatkan PDF).
- **Group (§6.8):** pautan jemputan dalam jadual Supabase, dibaca melalui RPC yang semak entitlement (bukan Apps Script).
- **Gambar (§6.2, §6.4):** muat naik melalui Apps Script ke folder Drive per peserta; dipapar melalui Apps Script selepas semak pemilik/admin. Mampatkan di frontend sebelum muat naik.
- **Peringatan (§6.10):** emel, bukan web push. Lihat §7 untuk had kuota.
- **PWA:** tiada. Halaman Bantuan ada panduan "Tambah ke Skrin Utama" untuk Android & iPhone.
- **Graduation Report & sijil (§6.9):** PDF dijana Apps Script (contoh templat Google Slides/Docs → PDF) dan disimpan di Drive. Halaman pengesahan `#/sijil/<nombor>` awam membaca data minimum melalui RPC.

## 6. Menu Admin (dalam app)

Peranan: `superadmin` (pemilik), `coach` (Coach Iffat). Tiada peranan `admin` berasingan kecuali builder dapati perlu.

**Superadmin:** semua dalam MD asal §7 kecuali import CSV BCL, ditambah:
- Pemetaan borang BCL → pakej; senarai order "Perlu semakan"; butang "Proses semula order".
- Senarai pembelian (dituntut / belum dituntut) + butang WhatsApp untuk yang belum daftar.
- Reset kata laluan peserta, pindah pembelian/kod ke akaun lain.
- Analisis bulanan (peserta aktif, % merekod, purata perubahan berat ikut fasa, tidak aktif > 5 hari dengan butang WhatsApp).
- Export CSV (peserta, pembelian, kod, rekod harian).
- Audit log.

**Coach:** lihat senarai peserta, profil, rekod, carta & analisis; hantar pengumuman. Tiada akses pembelian, kod, pakej, tetapan.

## 7. Had percuma yang mesti dihormati

| Perkhidmatan | Had relevan | Pendekatan |
|---|---|---|
| Supabase Free | 500 MB DB, 50k MAU, tidur selepas 7 hari, tiada backup auto | Data kecil (~45k baris rekod); keep-alive; backup ke Drive |
| Supabase Auth SMTP terbina | beberapa emel/jam | Wajib SMTP Gmail tersuai |
| Apps Script | ~30 pelaksanaan serentak; 6 min/pelaksanaan; UrlFetch 20k/hari | Hanya kerja jarang; trafik harian ke Supabase |
| Apps Script MailApp (akaun Gmail biasa) | **~100 penerima/hari** | Lihat bawah |
| Google Drive | 15 GB percuma (dikongsi dengan Gmail) | Mampat gambar (≤300 KB) |

**Kuota emel:** emel pembelian dihantar Apps Script dengan baris gilir — jika kuota harian habis, emel ditangguh ke hari berikut dan admin nampak senarai "belum diemel" (butang WhatsApp sebagai ganti). Halaman terima kasih BCL juga patut diarahkan ke `#/daftar` jika BCL menyokongnya, supaya emel bukan satu-satunya jalan. Peringatan harian dihantar hanya kepada peserta yang tak merekod ≥2 hari, dihadkan dalam baki kuota.

## 8. Kebolehpercayaan (anti-matlamat utama)

- Login: pengesahan emel mati; sesi kekal; "Lupa kata laluan" jelas; reset oleh admin; mesej ralat BM yang memberi tindakan.
- Simpan rekod: terus ke Supabase; jika gagal/offline, simpan dalam peranti dan cuba semula automatik dengan status "Belum dihantar / Disimpan"; butang simpan dikunci semasa menghantar; upsert unik `(user_id, tarikh)` supaya tiada pendua.
- Tarikh/hari dikira dalam `Asia/Kuala_Lumpur` di server.
- Sebelum 1/12: ujian hujung-ke-hujung dengan order BCL mod ujian & live (beli → emel → daftar → ebook); ujian beban ~200 rekod serentak; senarai semak Definition of Done MD asal §13 (diubah: tiada item PWA/import CSV).
- Log ralat Apps Script & webhook boleh dilihat oleh pemilik di menu Admin.

## 9. Peringkat & tarikh akhir

| Peringkat | Tarikh akhir | Skop |
|---|---|---|
| 1 | **sebelum 01/12/2026** (jualan dibuka) | Webhook BCL + polling, `purchases`, daftar/login/lupa kata laluan, entitlement, onboarding, library ebook + pembaca watermark, TDEE, kad group, kod akses sandaran; Admin: pemetaan BCL, pembelian, kod (jana/batal/pindah/WhatsApp), export CSV, audit log; backup & keep-alive |
| 2 | **sebelum 10/12/2026** (diet bermula) | Dashboard Progress Saya, daily tracker + sejarah + carta, Cabaran #1, pengumuman, emel peringatan; Admin: progress peserta, tidak aktif, akses coach |
| 3a | sebelum 10/01/2027 (Syaaban) | Gambar progress, Cabaran #2 |
| 3b | sebelum 08/02/2027 (Ramadan) | Mod Ramadan tracker, Cabaran #3 |
| 3c | sebelum 10/03/2027 | Graduation Report, sijil + pengesahan QR, analisis bulanan penuh |

(Tarikh fasa tepat boleh diubah admin per batch; jangan hardcode. Jadual `batches` mesti wujud sejak Peringkat 1.)

## 9.1 Keputusan yang dibuat oleh pereka (bukan pemilik) — untuk disemak
1. Pendaftaran wajib emel **dan** telefon sepadan dengan BCL (ganti pengesahan emel yang dimatikan).
2. Ebook & TDEE akses selama-lamanya; tracker/cabaran/report ikut batch; group per batch.
3. Order borang yang tiada dalam pemetaan diabaikan; order HDM yang tak padan → "Perlu semakan".
4. Naik taraf A→B melalui WhatsApp + pemberian manual oleh admin.
5. Emel pembelian dengan baris gilir bila kuota Gmail harian habis; peringatan harian hanya kepada yang tak merekod ≥2 hari.
6. Graduation Report & sijil dijana Apps Script (templat Google → PDF).

## 10. Diserahkan kepada builder
- Rangka kerja frontend (vanilla/Preact/dll.) dan cara build/penghantaran ke Blogspot, asalkan memenuhi §3.2.
- Skema jadual tepat (bermula dari senarai MD asal §8, tambah `purchases`, `bcl_form_map`, `bcl_webhook_log`, `email_queue`; buang `progress_photos` storage path → Drive file ID).
- Strategi penyajian PDF ebook dalam had Apps Script.
- Rate limit login (Supabase Auth ada had terbina; tambah jika perlu).
- Had sesi serentak 2 peranti (MD asal §9) — laksanakan jika boleh dengan Supabase Auth percuma, jika tidak, gugurkan dan catat.
- README: setup Supabase, Apps Script (Script Properties, trigger), Blogspot, SMTP Gmail, cipta superadmin pertama, pemetaan borang BCL.

## 11. Rujukan
- `PROMPT-SISTEM-HDM-BOOSTER.md` (MD asal)
- Integrasi BCL pihak ketiga: github.com/H4fizWasabie/cave-lms PR #178, #188, #213
