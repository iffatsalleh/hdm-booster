import type { ComponentChildren } from 'preact';

/** Centered empty / placeholder state inside a card. */
export function Empty(p: { icon: string; title: string; text?: ComponentChildren; tone?: 'blue' | 'slate' | 'yellow'; children?: ComponentChildren }) {
  return (
    <section class="card" style="text-align:center;padding:28px 18px">
      <span class={`ic ${p.tone ?? 'slate'}`} style="margin:0 auto"><i class={p.icon} aria-hidden="true" /></span>
      <h2 style="font-size:20px;margin-top:12px">{p.title}</h2>
      {p.text ? <p class="muted small" style="margin-top:6px">{p.text}</p> : null}
      {p.children ? <div style="margin-top:16px">{p.children}</div> : null}
    </section>
  );
}
