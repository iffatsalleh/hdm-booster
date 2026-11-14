# Layouts

No shared layout component exists yet. The only shell today is `src/app.tsx` (see components.md).

Planned layout (spec `docs/superpowers/specs/2026-11-13-hdm-booster-design.md` §3.5, PROMPT-SISTEM-HDM-BOOSTER.md §11):
- Mobile-first, works at 375px with no horizontal scroll.
- **Bottom tab bar** on phones with 5 tabs: Utama · Rekod · Ebook · Cabaran · Akaun. Staff (superadmin, coach) get a 6th tab, Admin. Desktop (≥1024px) uses a left sidebar with the same items instead.
- A footer health note appears on participant pages: "Jika anda ada penyakit kronik, mengambil ubat tertentu, hamil atau menyusukan anak, dapatkan nasihat doktor dahulu sebelum mengubah rutin puasa, pemakanan atau senaman."
- `app.html` is the Vite entry. It loads the fonts below and mounts `#app`.

## `app.html`

```html
<!doctype html>
<html lang="ms">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HDM BOOSTER</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@800&family=Outfit:wght@600;700;800&family=Quicksand:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```
