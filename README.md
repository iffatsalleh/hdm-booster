# HDM BOOSTER — Panduan Pemasangan & Operasi

Panduan ini untuk pemilik (bukan pembangun). Ikut langkah mengikut nombor. Setiap arahan dalam kotak kelabu
disalin dan ditampal ke **PowerShell** yang dibuka di folder projek ini (folder yang ada fail `package.json`).

**Peraturan keselamatan:** fail `.env.prod` dan fail JSON akaun servis Firebase ialah rahsia. Jangan hantar
melalui WhatsApp, emel atau chat. Jangan commit ke GitHub (sudah disekat oleh `.gitignore`).

Gambaran ringkas:

- Peserta buka blog Blogspot. Blog itu memuatkan aplikasi dari jsDelivr (GitHub).
- Aplikasi bercakap dengan Cloudflare Worker (`hdm-api`).
- Worker → Cloudflare Hyperdrive → pangkalan data HornetHive (Postgres).
- Log masuk melalui Firebase Authentication.
- Google Apps Script menerima pesanan BCL, menghantar emel, menyimpan ebook di Drive dan membuat backup harian.

---

## 0. Prasyarat

1. Pasang Node.js 20 atau lebih baharu dari https://nodejs.org. Semak dengan `node -v`.
2. Jika `node` tidak dikenali, tambah folder Node ke PATH untuk tetingkap ini sahaja, contohnya:
   `$env:Path = "C:\Users\<nama>\AppData\Local\Programs\node-v26.13.1-win-x64;" + $env:Path`
3. Pasang Git (https://git-scm.com), kemudian di folder projek jalankan: `npm install`

## 1. HornetHive (pangkalan data)

1. Dalam HornetHive, pastikan pangkalan data `hdm_prod` wujud. Salin **pooled connection string** (port `6432`, `sslmode=require`).
2. Buat fail rahsia dan tampal string itu selepas `HIVE_PG_URL=`, kemudian simpan:
   `copy .env.prod.example .env.prod` lalu `notepad .env.prod`
3. Cipta semua jadual dan data asas: `npm run migrate -- --seed`

## 2. Firebase (log masuk)

1. Di https://console.firebase.google.com cipta projek (cth. `hdm-prod`). Authentication › Sign-in method › hidupkan **Email/Password**.
2. Authentication › Settings › User actions: **nyahtanda "Enable create (sign-up)"** (akaun dicipta oleh Worker sahaja).
3. Authentication › Settings › Authorized domains › Add domain: `<nama-blog>.blogspot.com`.
4. Authentication › Templates: tukar *Template language* ke **Bahasa Melayu** dan semak teks emel *Password reset*.
5. Project settings › General › Your apps › tambah Web app (`</>`). Catat `apiKey`, `authDomain`, `projectId` (untuk Langkah 6).
6. Project settings › Service accounts › **Generate new private key** (fail JSON dimuat turun). Simpan dahulu; ia digunakan di Langkah 3.

## 3. Cloudflare (Worker + Hyperdrive)

1. Daftar akaun di https://dash.cloudflare.com, kemudian: `cd worker` dan `npx wrangler login`
2. Cipta Hyperdrive (tampal string dari `.env.prod`, guna **petikan tunggal**):
   `npx wrangler hyperdrive create hdm-db --connection-string='postgres://…' --caching-disabled`
3. Salin `id` yang dipaparkan ke `worker/wrangler.toml` di baris `id = "REPLACE_WITH_HYPERDRIVE_ID"`.
4. Dalam `worker/wrangler.toml` [vars] isi: `FIREBASE_PROJECT_ID` (cth. `hdm-prod`), `ALLOWED_ORIGINS` = `https://<nama-blog>.blogspot.com` **sahaja** (tanpa `/` di hujung, tanpa localhost). `GAS_URL` diisi di Langkah 4.
5. Deploy pertama: `npx wrangler deploy` (masih dalam folder `worker`). Catat URL `https://hdm-api.<akaun>.workers.dev`.
6. Kembali ke folder projek (`cd ..`) dan jana + hantar rahsia: `node scripts/setup.mjs secrets --apply`
7. Hantar akaun servis Firebase: `node scripts/setup.mjs firebase-sa "C:\Users\<nama>\Downloads\<fail>.json" --apply`, kemudian **padam fail JSON itu**.
8. Semak: `node scripts/setup.mjs check` dan `node scripts/smoke.mjs https://hdm-api.<akaun>.workers.dev --internal-secret`

Nota pembangun: `npx wrangler dev` dengan blok `[[hyperdrive]]` perlukan `localConnectionString` dalam
`wrangler.toml` (jangan commit) atau pemboleh ubah `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE`.

## 4. Google Apps Script (BCL, emel, ebook, backup)

1. Buka https://script.google.com/home/usersettings dan hidupkan **Google Apps Script API**.
2. Di https://script.google.com cipta projek baharu "HDM BOOSTER". Project Settings › salin **Script ID** ke `apps-script/.clasp.json` (ganti `REPLACE_WITH_SCRIPT_ID`).
3. Hantar kod: `cd apps-script`, `npx @google/clasp@2.4.2 login`, kemudian `npx @google/clasp@2.4.2 push --force` dan `cd ..`
4. Dalam Google Drive cipta folder "HDM Backup". Salin ID folder (bahagian URL selepas `/folders/`).
5. Project Settings › Script properties › tambah setiap kunci di bawah (jalankan `notepad .env.prod` untuk nilai rahsia):

   | Kunci | Nilai |
   |---|---|
   | `WORKER_URL` | `https://hdm-api.<akaun>.workers.dev` |
   | `INTERNAL_SECRET` | dari `.env.prod` (mesti sama dengan Worker) |
   | `TICKET_SECRET` | dari `.env.prod` (mesti sama dengan Worker) |
   | `BCL_WEBHOOK_KEY` | dari `.env.prod` |
   | `BCL_API_BASE` | `https://bcl.my/api` |
   | `BCL_API_TOKEN` | token API dari BCL (Langkah 5) |
   | `APP_URL` | `https://<nama-blog>.blogspot.com` |
   | `DRIVE_BACKUP_FOLDER_ID` | ID folder dari 4.4 |
   | `BCL_FEE_TOLERANCE` | pilihan, lalai `3` (RM) |
   | `BCL_FIELD_MAP` | pilihan, biar kosong kecuali diminta pembangun |

6. Dalam editor, pilih fungsi `installTriggers` › **Run** › benarkan akses (Allow). Ia memasang semakan BCL tiap 10 minit, emel tiap 30 minit dan backup jam 3 pagi.
7. Deploy › New deployment › jenis **Web app** › Execute as: **Me** › Who has access: **Anyone** › Deploy. Salin URL yang berakhir `/exec`.
8. Tampal URL itu ke `GAS_URL` dalam `worker/wrangler.toml`, kemudian `cd worker`, `npx wrangler deploy`, `cd ..`

## 5. BCL (pembayaran)

1. Dalam BCL, jana **API token** dan masukkan ke Script property `BCL_API_TOKEN`.
2. Tetapan webhook BCL: `https://script.google.com/macros/s/<ID>/exec?src=bcl&k=<BCL_WEBHOOK_KEY>` (URL Langkah 4.7 + kunci dari `.env.prod`).
3. Selepas Langkah 7, buka Admin › **Pemetaan BCL** dan tambah setiap borang BCL: Formable ID, Jumlah RM, Pakej, Aktif.

## 6. GitHub + jsDelivr + Blogspot

1. Cipta repo **awam** bernama `hdm-booster` di GitHub (jsDelivr hanya membaca repo awam; tiada rahsia dalam repo).
2. Sambung dan tolak: `git remote add origin https://github.com/<github-user>/hdm-booster.git` dan `git push -u origin HEAD`
3. Bina dan terbitkan: `node scripts/deploy.mjs --push`. Catat tag yang dipaparkan (cth. `v20261115-1`).
4. Buka `blogspot/template.xml` dalam Notepad. Ganti semua `GANTI_...`: GitHub user, tag, nilai Firebase (2.5), URL Worker (3.5), URL Apps Script (4.7).
5. Blogger › Tema › ▼ › **Edit HTML** › padam semua › tampal isi fail › Simpan. Blogger › Tetapan: matikan komen.
6. Buka blog di telefon: skrin log masuk HDM BOOSTER mesti muncul.

## 7. Superadmin pertama

1. Firebase console › Authentication › Users › **Add user** (emel + kata laluan anda). Salin **User UID**.
2. `node scripts/setup.mjs superadmin --uid <UID> --name "Nama Penuh" --email <emel> --phone 0123456789`
3. Log masuk di blog: tab **Admin** muncul. Untuk jurulatih (coach), ulang 7.1 kemudian:
   `node scripts/setup.mjs role <UID> coach --name "Nama" --email <emel> --phone 01…` (tarik balik: tambah `--remove`).

## 8. Ujian akhir & senarai semak pelancaran

1. `node scripts/setup.mjs check` dan `node scripts/smoke.mjs https://hdm-api.<akaun>.workers.dev --internal-secret` → semua PASS.
2. Ujian beban **sebelum lancar sahaja**: `node scripts/loadtest.mjs https://hdm-api.<akaun>.workers.dev --sebelum-lancar` → 0 ralat, p95 < 2 s.

Senarai semak (pemilik hadir):

- [ ] Akaun Pakej A: ebook 02–07 dan MUSCLE MANIA ditolak melalui aplikasi **dan** panggilan terus ke Worker.
- [ ] Akaun Pakej B: kesemua 12 item dibuka.
- [ ] Kod yang sudah digunakan ditolak. Kod yang dibatalkan menarik akses serta-merta.
- [ ] `upgrade_a_b` pada akaun Pakej A membuka item Pakej B.
- [ ] Pesanan BCL sebenar (ujian + live) → pembelian direkod → emel diterima → daftar → ebook dibuka.
- [ ] Ujian beban: 0 ralat, p95 < 2 s.
- [ ] Telefon 375px dan desktop: tiada skrol mendatar di setiap halaman.
- [ ] `npm run test:worker` lulus (menggunakan pangkalan data prod; data ujian dibersihkan sendiri).
- [ ] Apps Script › Triggers: `pollBcl`, `processEmailQueueTrigger`, `nightlyBackup` wujud. Folder backup ada fail selepas jam 3 pagi.
- [ ] Hyperdrive dicipta dengan `--caching-disabled` (Cloudflare › Hyperdrive › hdm-db › Caching: Disabled).
- [ ] Tiada rahsia dalam `dist/`: `Select-String -Path dist\* -Pattern "postgres://","PRIVATE KEY","HIVE_","INTERNAL_SECRET"` → tiada hasil.

## 9. Operasi harian

1. **Kod manual** (pembeli bayar di luar BCL): Admin › Kod Akses › Jana kod › untuk pembeli › hantar melalui butang WhatsApp.
2. **Batch tahun depan:** Admin › Kandungan › Batch › tambah batch baharu (tarikh jualan + program); tukar batch lama ke `tamat`. Tambah borang BCL baharu di Pemetaan BCL.
3. **Ebook baharu:** muat naik PDF ke Google Drive, salin ID fail, tambah di Admin › Kandungan › Ebook.
4. **Backup:** setiap malam ke folder Drive "HDM Backup/YYYY-MM-DD" (simpan 30 hari). Pemulihan perlu pembangun.
5. **Kemas kini aplikasi:** `node scripts/deploy.mjs --push` (tambah `--worker` jika kod Worker berubah), kemudian tukar tag `@v…` pada 2 baris dalam tema Blogger.
6. **Kemas kini Apps Script:** `npx @google/clasp@2.4.2 push --force` dalam `apps-script`, kemudian Deploy › Manage deployments › ✎ › Version: **New version** › Deploy (URL kekal sama).
7. **Naik taraf pelan:** HornetHive Pro (jika sambungan terus disekat atau storan penuh); Cloudflare Workers Paid USD 5/bulan (jika had harian dicapai); Google Workspace (had emel lebih tinggi).

## 10. Risiko diketahui

1. **HornetHive:** dokumentasi menyatakan sambungan Postgres terus ialah ciri pelan Pro, walaupun pangkalan data Free kita diberi string yang berfungsi. Jika disekat: naik taraf ke Pro, **atau** guna laluan REST — buang blok `[[hyperdrive]]` dalam `wrangler.toml`, isi `HIVE_DB_ID`, jalankan `npx wrangler secret put HIVE_DML_KEY` dan `npx wrangler deploy`. Migrasi baharu juga memerlukan sambungan terus.
2. **Cloudflare Free:** Hyperdrive 100,000 query/hari dan Workers 100,000 permintaan/hari. Pantau di Cloudflare › Hyperdrive / Workers. Jika hampir had, naik taraf Workers Paid.
3. **Gmail:** akaun Gmail biasa boleh menghantar kira-kira 100 emel/hari. Hari pelancaran dengan lebih 100 pembeli: sebahagian emel lewat atau gagal; hantar semula dari Admin atau guna Google Workspace.
4. **CDN:** aplikasi, ikon (unpkg) dan pembaca PDF (jsDelivr) dimuat dari CDN awam. Jika CDN terganggu, aplikasi tidak dimuat sehingga pulih.
5. **Satu persekitaran sahaja (prod):** ujian (`npm run test:worker`, ujian beban) menyentuh sistem sebenar. Jalankan ujian beban sebelum pelancaran sahaja.
