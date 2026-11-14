// "Naik taraf" WhatsApp button (settings: support_wa + wa_upgrade_text with {emel}).
import { DEFAULT_SUPPORT_WA } from '../lib/config';
import { fillTemplate, waLink } from '../lib/wa';
import { setting, useSession, type SessionState } from '../state/session';
import { Button } from './Button';

const DEFAULT_TEXT = 'Salam, saya ingin naik taraf ke Pakej Complete HDM BOOSTER. Emel pendaftaran: {emel}';

export function upgradeHref(s: SessionState): string {
  return waLink(setting(s, 'support_wa', DEFAULT_SUPPORT_WA),
    fillTemplate(setting(s, 'wa_upgrade_text', DEFAULT_TEXT), { emel: s.profile?.email ?? '' }));
}

export function UpgradeButton(p: { style?: string; sm?: boolean }) {
  const s = useSession();
  return (
    <Button href={upgradeHref(s)} external variant="green-o" block sm={p.sm} icon="ph-bold ph-whatsapp-logo" style={p.style}>
      Naik taraf
    </Button>
  );
}
