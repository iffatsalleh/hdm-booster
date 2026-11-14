import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

type Props = {
  id: string;
  label: string;
  value: string;
  onInput: (v: string) => void;
  type?: 'text' | 'email' | 'tel' | 'password';
  autocomplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal';
  placeholder?: string;
  hint?: ComponentChildren;
  error?: string | null;
  required?: boolean;
  style?: string;
};

export function Field(p: Props) {
  const [show, setShow] = useState(false);
  const isPw = p.type === 'password';
  const describedBy = [p.error ? `${p.id}-err` : '', p.hint ? `${p.id}-hint` : ''].filter(Boolean).join(' ') || undefined;
  const input = (
    <input
      id={p.id}
      class={'input' + (p.error ? ' err' : '')}
      type={isPw ? (show ? 'text' : 'password') : (p.type ?? 'text')}
      value={p.value}
      onInput={(e) => p.onInput((e.currentTarget as HTMLInputElement).value)}
      autocomplete={p.autocomplete}
      inputMode={p.inputMode}
      placeholder={p.placeholder}
      required={p.required}
      aria-invalid={p.error ? 'true' : undefined}
      aria-describedby={describedBy}
      style={isPw ? 'padding-right:48px' : undefined}
    />
  );
  return (
    <div class="field" style={p.style}>
      <label for={p.id}>{p.label}</label>
      {isPw ? (
        <div class="input-wrap">
          {input}
          <button
            type="button"
            class="eye"
            style="background:none;border:0;padding:6px;cursor:pointer;font-size:20px"
            aria-label={show ? 'Sembunyikan kata laluan' : 'Tunjuk kata laluan'}
            aria-pressed={show}
            onClick={() => setShow(!show)}
          >
            <i class={show ? 'ph ph-eye-slash' : 'ph ph-eye'} aria-hidden="true" />
          </button>
        </div>
      ) : (
        input
      )}
      {p.error ? (
        <p class="error" id={`${p.id}-err`}>
          <i class="ph-fill ph-warning-circle" aria-hidden="true" />
          <span>{p.error}</span>
        </p>
      ) : null}
      {p.hint ? <p class="hint" id={`${p.id}-hint`}>{p.hint}</p> : null}
    </div>
  );
}
