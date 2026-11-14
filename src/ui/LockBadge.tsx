export function LockBadge(p: { text?: string }) {
  return (
    <span class="lock-badge">
      <i class="ph-fill ph-lock-key" aria-hidden="true" />
      {p.text ?? 'Pakej Complete'}
    </span>
  );
}
