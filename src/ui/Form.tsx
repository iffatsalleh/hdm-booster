// Form pieces from the mockups: number input with unit, styled checkbox, segmented choice, activity options.
import type { ComponentChildren } from 'preact';
import { ACTIVITY_LEVELS } from '../lib/onboarding';

export function ErrorText(p: { id: string; text?: string | null }) {
  return p.text ? (
    <p class="error" id={p.id}><i class="ph-fill ph-warning-circle" aria-hidden="true" /><span>{p.text}</span></p>
  ) : null;
}

type NumProps = {
  id: string;
  label: ComponentChildren;
  unit: string;
  value: string;
  onInput: (v: string) => void;
  decimal?: boolean;
  placeholder?: string;
  hint?: ComponentChildren;
  error?: string | null;
};

export function NumField(p: NumProps) {
  const pad = Math.max(56, 26 + p.unit.length * 9);
  const describedBy = [p.error ? `${p.id}-err` : '', p.hint ? `${p.id}-hint` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div class="field">
      <label for={p.id}>{p.label}</label>
      <div class="input-wrap">
        <input id={p.id} class={'input' + (p.error ? ' err' : '')} value={p.value} inputMode={p.decimal ? 'decimal' : 'numeric'}
          placeholder={p.placeholder} autocomplete="off" style={`padding-right:${pad}px`}
          aria-invalid={p.error ? 'true' : undefined} aria-describedby={describedBy}
          onInput={(e) => p.onInput((e.currentTarget as HTMLInputElement).value)} />
        <span class="unit" aria-hidden="true">{p.unit}</span>
      </div>
      <ErrorText id={`${p.id}-err`} text={p.error} />
      {p.hint ? <p class="hint" id={`${p.id}-hint`}>{p.hint}</p> : null}
    </div>
  );
}

export function CheckBox(p: { id: string; checked: boolean; onChange: (v: boolean) => void; error?: string | null; style?: string; children: ComponentChildren }) {
  return (
    <>
      <label class="check" style={`cursor:pointer;${p.style ?? ''}`}>
        <input id={p.id} type="checkbox" class="sr-only" checked={p.checked}
          aria-invalid={p.error ? 'true' : undefined} aria-describedby={p.error ? `${p.id}-err` : undefined}
          onChange={(e) => p.onChange((e.currentTarget as HTMLInputElement).checked)} />
        <span class={'box' + (p.checked ? '' : ' off')} aria-hidden="true">{p.checked ? <i class="ph-bold ph-check" /> : null}</span>
        <span>{p.children}</span>
      </label>
      <ErrorText id={`${p.id}-err`} text={p.error} />
    </>
  );
}

const onKey = (f: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    f();
  }
};

export function Seg<T extends string>(p: { id: string; label: string; value: T | ''; options: [T, string][]; onChange: (v: T) => void; error?: string | null }) {
  return (
    <div class="field">
      <label id={`${p.id}-l`}>{p.label}</label>
      <div class="seg" role="radiogroup" aria-labelledby={`${p.id}-l`} id={p.id} tabIndex={-1}
        aria-describedby={p.error ? `${p.id}-err` : undefined}>
        {p.options.map(([v, t]) => (
          <span key={v} role="radio" tabIndex={0} aria-checked={p.value === v} class={p.value === v ? 'on' : undefined}
            style="cursor:pointer" onClick={() => p.onChange(v)} onKeyDown={onKey(() => p.onChange(v))}>{t}</span>
        ))}
      </div>
      <ErrorText id={`${p.id}-err`} text={p.error} />
    </div>
  );
}

export function ActivityPicker(p: { id: string; value: number; onChange: (v: 1 | 2 | 3 | 4 | 5) => void; error?: string | null }) {
  return (
    <div class="field">
      <label id={`${p.id}-l`}>Tahap aktiviti</label>
      <div role="radiogroup" aria-labelledby={`${p.id}-l`} id={p.id} tabIndex={-1} aria-describedby={p.error ? `${p.id}-err` : undefined}>
        {ACTIVITY_LEVELS.map((a) => {
          const on = p.value === a.lv;
          return (
            <div key={a.lv} class={'opt' + (on ? ' on' : '')} role="radio" tabIndex={0} aria-checked={on} style="cursor:pointer"
              onClick={() => p.onChange(a.lv)} onKeyDown={onKey(() => p.onChange(a.lv))}>
              <span class="lv">{a.lv}</span>
              <div class="t"><b>{a.name}</b><span>{a.desc}</span></div>
              {on ? <i class="ph-fill ph-check-circle" aria-hidden="true" /> : null}
            </div>
          );
        })}
      </div>
      <ErrorText id={`${p.id}-err`} text={p.error} />
    </div>
  );
}
