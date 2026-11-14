// Global toast: toast('Mesej', 'green') from anywhere; <ToastHost/> renders it once in the app.
import { useEffect, useState } from 'preact/hooks';

type Tone = 'blue' | 'green' | 'yellow' | 'red';
type T = { id: number; text: string; tone: Tone };

let current: T | null = null;
const subs = new Set<(t: T | null) => void>();
let seq = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

export function toast(text: string, tone: Tone = 'green', ms = 4000) {
  current = { id: ++seq, text, tone };
  subs.forEach((f) => f(current));
  clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    subs.forEach((f) => f(null));
  }, ms);
}

const ICON: Record<Tone, string> = {
  blue: 'ph-fill ph-info',
  green: 'ph-fill ph-check-circle',
  yellow: 'ph-fill ph-warning',
  red: 'ph-fill ph-warning-circle',
};

export function ToastHost() {
  const [t, setT] = useState<T | null>(current);
  useEffect(() => {
    subs.add(setT);
    return () => {
      subs.delete(setT);
    };
  }, []);
  return (
    <div class="toast-host" aria-live="polite">
      {t ? (
        <div key={t.id} class={`callout ${t.tone} toast`} role={t.tone === 'red' ? 'alert' : 'status'}>
          <i class={ICON[t.tone]} aria-hidden="true" />
          <span>{t.text}</span>
        </div>
      ) : null}
    </div>
  );
}
