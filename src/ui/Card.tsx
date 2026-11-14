import type { ComponentChildren, JSX } from 'preact';

export function Card(p: { class?: string; style?: string | JSX.CSSProperties; href?: string; children: ComponentChildren }) {
  const cls = 'card' + (p.class ? ' ' + p.class : '');
  if (p.href) {
    return (
      <a class={cls} href={p.href} style={typeof p.style === 'string' ? `color:inherit;${p.style}` : { color: 'inherit', ...p.style }}>
        {p.children}
      </a>
    );
  }
  return <section class={cls} style={p.style}>{p.children}</section>;
}

export function Callout(p: { tone: 'blue' | 'green' | 'yellow' | 'red'; icon: string; children: ComponentChildren; style?: string }) {
  return (
    <div class={`callout ${p.tone}`} style={p.style} role={p.tone === 'red' ? 'alert' : 'status'}>
      <i class={p.icon} aria-hidden="true" />
      <span>{p.children}</span>
    </div>
  );
}

export function HealthNote() {
  return (
    <p class="health">
      <i class="ph ph-first-aid-kit" aria-hidden="true" />
      Jika anda ada penyakit kronik, mengambil ubat tertentu, hamil atau menyusukan anak, dapatkan nasihat doktor dahulu
      sebelum mengubah rutin puasa, pemakanan atau senaman.
    </p>
  );
}
