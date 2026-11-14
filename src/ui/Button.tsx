import type { ComponentChildren, JSX } from 'preact';

type Variant = 'primary' | 'outline' | 'green' | 'green-o' | 'yellow' | 'ghost' | 'danger-t';

type Props = {
  variant?: Variant;
  block?: boolean;
  sm?: boolean;
  pulse?: boolean;
  loading?: boolean;
  /** Renders an <a> when set. */
  href?: string;
  external?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
  style?: string | JSX.CSSProperties;
  icon?: string;
  children: ComponentChildren;
};

export function Button(p: Props) {
  const cls = ['btn', p.variant && p.variant !== 'primary' ? p.variant : '', p.block ? 'block' : '', p.sm ? 'sm' : '',
    p.pulse && !p.loading ? 'pulse' : ''].filter(Boolean).join(' ');
  const body = (
    <>
      {p.loading ? <i class="ph-bold ph-spinner spin" aria-hidden="true" /> : p.icon ? <i class={p.icon} aria-hidden="true" /> : null}
      {p.loading ? 'Sila tunggu…' : p.children}
    </>
  );
  if (p.href) {
    return (
      <a class={cls} style={p.style} href={p.href} onClick={p.onClick}
        {...(p.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {body}
      </a>
    );
  }
  return (
    <button class={cls} style={p.style} type={p.type ?? 'button'} disabled={p.disabled || p.loading}
      aria-busy={p.loading ? 'true' : undefined} onClick={p.onClick}>
      {body}
    </button>
  );
}
