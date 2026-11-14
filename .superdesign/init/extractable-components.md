# Extractable components

None yet. The codebase has no shared layout or basic components, only the placeholder `src/app.tsx`.

Once the first approved draft defines the shell, these planned components become extractable:

## TabBar
- Source: `src/ui/TabBar.tsx` (planned)
- Category: layout
- Description: Bottom tab bar on mobile with Utama · Rekod · Ebook · Cabaran · Akaun (+ Admin for staff)
- Extractable props: activeItem (string, default "utama"), showAdmin (boolean, default false)
- Hardcoded: Phosphor icons, BM labels

## LockBadge
- Source: `src/ui/LockBadge.tsx` (planned)
- Category: basic
- Description: Padlock + "Tersedia dalam Pakej Complete" + "Naik taraf" WhatsApp button
- Extractable props: none
- Hardcoded: text, icon
