# Theme

## Part 1 — Token summary

**Colours** (`tailwind.config.js` + PROMPT §11 + landing page):

| Token | Value | Use |
|---|---|---|
| `primary` | `#2563eb` | Main actions; hover `#1d4ed8`, active `#1e40af` |
| `accent` | `#f97316` | Orange accent, ribbons, highlights |
| `dark` | `#0f172a` | Dark surfaces; hero gradient `#0f172a → #111c33 → #0f172a`, dark sections `#1e293b → #0f172a` |
| `success` | `#16a34a` | Success, "Lulus", ✓ |
| `highlight` | `#facc15` | Achievements, "stabilo" marker, padlock accent; pale `#fde68a` |

- **Text:** body `#1f2937` on white; muted `#4b5563`; on dark surfaces `#f1f5f9`, muted `#cbd5e1`.
- **Danger / closed:** bg `#fee2e2`, text `#991b1b`; red `#dc2626` / `#ef4444`.
- **Glass tile on dark:** `rgba(255,255,255,.06)` with a `rgba(255,255,255,.12)` border.

**Fonts:**
- Outfit 600/700/800: headings, letter-spacing −.01em, line-height 1.15.
- Quicksand 400–700: body, line-height 1.35 for paragraphs.
- Inter 800: big numbers and metrics, tabular-nums.

**Radius:**

| Element | Radius |
|---|---|
| Buttons | 10px |
| Cards | 14–20px |
| Countdown units | 12px |
| Pills / badges | 999px |
| Images | 14px |

**Shadows:** cards `0 20px 50px rgba(15,23,42,.12)`; images `0 10px 24px rgba(15,23,42,.12)`; primary glow `0 0 0 14px rgba(37,99,235,0)` pulse; yellow marker `0 4px 14px rgba(250,204,21,.25)`.

**Spacing:** sections are 56px/24px padding on mobile and 80px/40px on desktop (landing page). The member area is denser: about 16px page gutter and 12–16px card padding.

**Breakpoints:** mobile-first at 375px; Tailwind defaults (`sm` 640, `md` 768, `lg` 1024).

**Motion:** small count-up animations and a badge "pop". Respect `prefers-reduced-motion`.

**Dark mode:** optional. The app shell scaffold currently uses `bg-dark text-white`.

## Part 2 — Raw sources

### `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        accent: '#f97316',
        dark: '#0f172a',
        success: '#16a34a',
        highlight: '#facc15',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Quicksand', 'sans-serif'],
        num: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### `src/styles.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-dark font-body text-white antialiased;
  }
  h1, h2, h3 {
    @apply font-heading;
  }
}
```

### Landing page base styles (`index.html` lines 32–47, owner's page, style reference only)
```css
body{font-family:'Quicksand',Arial,Helvetica,sans-serif;font-size:20px;line-height:1.1;color:#1f2937;background:#fff}
p,li{line-height:1.35}
h1,h2,h3,h4,h5,h6{font-family:'Outfit','Inter',Arial,Helvetica,sans-serif;font-weight:700;letter-spacing:-.01em;line-height:1.15}
.num{font-family:'Inter',Arial,sans-serif;font-weight:800;font-variant-numeric:tabular-nums}
.stabilo{background:#facc15;color:#0f172a;padding:.02em .28em .08em;border-radius:.18em;box-shadow:0 4px 14px rgba(250,204,21,.25)}
.lede{color:#4b5563}
.dark{background:linear-gradient(180deg,#1e293b,#0f172a);color:#f1f5f9}
.hero{background:radial-gradient(1200px 500px at 50% -10%,rgba(37,99,235,.35),transparent 60%),linear-gradient(180deg,#0f172a,#111c33 60%,#0f172a);color:#fff}
```
