# Components

Framework: Preact 10 + TypeScript, Vite 5, Tailwind CSS 3 (no component library). Icons: Phosphor web font (`@phosphor-icons/web`, classes `ph ph-<name>`, `ph-bold`, `ph-fill`).

**Status (14/11/2026):** the member-area UI has not been built yet. There are no shared UI primitives in `src/` so far. The plan's components, all still to be built, are `src/ui/{Layout,TabBar,Card,Button,Field,LockBadge,Toast,Empty}.tsx`.

The only rendered component today is the placeholder app shell.

## `src/app.tsx` — App (placeholder)

```tsx
export function App() {
  return (
    <main class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 class="text-4xl font-extrabold text-primary">HDM BOOSTER</h1>
      <p class="mt-3 text-base text-white/80">Ruang ahli akan datang tidak lama lagi.</p>
    </main>
  );
}
```

## `src/main.tsx`

```tsx
import { render } from 'preact';
import './styles.css';
import { App } from './app';

render(<App />, document.getElementById('app')!);
```

## Visual reference for primitives (from the owner's landing page `index.html`, not part of the app)

These primitives come from `index.html` lines 31–503. The member area should match this look.

```css
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:#2563eb;color:#fff;font-family:'Quicksand',sans-serif;font-weight:700;font-size:20px;border-radius:10px;padding:18px 30px}
.btn:hover{background:#1d4ed8}
.btn:active{background:#1e40af}
.pill-t{display:inline-flex;align-items:center;gap:8px;background:rgba(250,204,21,.08);border:1px solid rgba(250,204,21,.35);color:#fff;font-weight:700;font-size:16px;padding:8px 14px;border-radius:999px}
.stabilo{background:#facc15;color:#0f172a;padding:.02em .28em .08em;border-radius:.18em;box-shadow:0 4px 14px rgba(250,204,21,.25)}
.tile{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:14px}
.cd-unit{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(6px);border-radius:12px;padding:8px 6px;min-width:72px;text-align:center}
.cmp{border-radius:16px;box-shadow:0 20px 50px rgba(15,23,42,.12)}
.cmp-img{border-radius:14px;box-shadow:0 10px 24px rgba(15,23,42,.12)}
.lean-tag{background:#16a34a;color:#fff;font-family:'Inter';font-weight:800;font-size:12px;padding:6px 10px;border-radius:999px}
.num{font-family:'Inter',Arial,sans-serif;font-weight:800;font-variant-numeric:tabular-nums}
```
