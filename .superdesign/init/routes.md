# Routes

Hash routing (`#/…`), planned in `src/router.ts`, which is not built yet. The app is a single-page app served inside a Blogspot template. Today only `src/app.tsx` renders, as a placeholder.

| Route | Page (planned file) | Purpose |
|---|---|---|
| `#/masuk` | `src/pages/auth/Login.tsx` | Email + password login (Firebase) |
| `#/daftar` | `src/pages/auth/Register.tsx` | Register: email + phone must match the BCL purchase, name, password, PDPA checkbox |
| `#/lupa` | `src/pages/auth/Forgot.tsx` | Forgot-password email |
| `#/onboarding` | `src/pages/Onboarding.tsx` | One-time start data: sex, age, height, weight, optional fat%/waist, activity level, target weight, protein target, health-note checkbox |
| `#/` | `src/pages/Home.tsx` | Utama: greeting, batch name, "Program bermula dalam N hari" countdown, shortcut cards, health note |
| `#/ebook` | `src/pages/ebooks/Library.tsx` | Grid of 7 ebooks; open or locked (padlock + "Tersedia dalam Pakej Complete" + Naik taraf) |
| `#/ebook/:id` | `src/pages/ebooks/Reader.tsx` | PDF reader with a diagonal watermark (name · phone), progress, "Tandakan selesai dibaca" |
| `#/tdee` | `src/pages/Tdee.tsx` | TDEE calculator: BMR, TDEE, 3 deficit cards, protein range, macros, "Guna sebagai sasaran saya" |
| `#/group` | `src/pages/Groups.tsx` | Group cards: HDM (Coach Iffat Salleh), MUSCLE MANIA (Coach Anuar Yusof "Toy"); locked + Naik taraf |
| `#/akaun` | `src/pages/account/Account.tsx` | Profile, change password, purchases & codes, entitlements, logout, PDPA delete request |
| `#/akaun/kod`, `#/aktif` | `src/pages/account/Codes.tsx`, `Aktif.tsx` | Redeem access code `HDMB-XXXX-XXXX` |
| `#/bantuan` | `src/pages/Help.tsx` | FAQ + "Tambah ke Skrin Utama" + WhatsApp 60134417042 |
| `#/rekod`, `#/cabaran` | placeholder | "Dibuka 10/12/2026" (Peringkat 2) |
| `#/admin/*` | `src/pages/admin/{AdminHome,Purchases,BclMap,Codes,Participants,Content,Exports,Audit}.tsx` | Staff menu |
