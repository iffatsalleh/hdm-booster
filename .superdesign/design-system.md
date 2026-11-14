# HDM BOOSTER — Design System (member area)

## Product context
- HDM BOOSTER is a 3-month body-transformation programme that runs as yearly batches (Rejab → Syaaban → Ramadan). This member area is where buyers log in after paying on BCL.my.
- Participants are mostly Malaysian adults on **phones**, and many are not tech-savvy. Every screen must be obvious at a glance.
- All UI text is Bahasa Melayu Malaysia. Currency is RM, dates are `DD/MM/YYYY`, time zone is Malaysia.
- Access depends on the package bought:
  - Pakej A BASIC (RM100): system access, ebook 01, TDEE calculator, Graduation, Group HDM
  - Pakej B COMPLETE (RM150): all 12 items
- Locked items stay **visible**, each with a padlock, "Tersedia dalam Pakej Complete" and a "Naik taraf" button that opens WhatsApp. These locked items help sell upgrades.
- Coaches: Coach Iffat Salleh (HDM / nutrition) and Coach Anuar Yusof "Toy" (MUSCLE MANIA / muscle). Support WhatsApp: 60134417042.

## Key screens (Peringkat 1)
| Screen | What it shows |
|---|---|
| Daftar | Register |
| Log Masuk | Log in |
| Lupa Kata Laluan | Forgot password |
| Onboarding | One-time setup |
| Utama | Countdown before 10/12/2026 plus shortcut cards |
| Library Ebook | 7 ebooks |
| Pembaca Ebook | Watermarked reader |
| Kalkulator TDEE | Calorie calculator |
| Group Support | Support groups |
| Akaun + Tebus Kod | Account and code redemption |
| Bantuan | Help |
| Admin | Ringkasan, Pembelian, Kod, Peserta, Kandungan |

Rekod and Cabaran are placeholders labelled "Dibuka 10/12/2026".

## Source of truth (owner decision 14/11/2026)
- Colours and fonts follow the sales page https://mestijadi.bcl.my/form/hdmbooster, which is the same design as the local `index.html`.
- Mockups are hand-written HTML in `design/mockups/` with the shared stylesheet `design/mockups/hdm.css`. Superdesign is no longer used.
- Additions taken from the sales page:
  - Green CTA gradient `linear-gradient(135deg,#16a34a,#065f46)`
  - Light green `#22c55e`, `#4ade80`, and the light green border `#dcfce7`
  - Blue→violet gradient `#2563eb→#7c3aed` for special highlights only
  - Card radius 18px
  - Gloria Hallelujah for short handwritten notes only

## Visual direction
The member area keeps the look of the owner's HDM BOOSTER landing page:
- A confident deep navy hero with a soft blue radial glow
- Clean white content surfaces
- Bright blue primary actions
- Yellow "stabilo" highlight for achievements
- Orange accents
- Rounded cards with soft shadows
- Phosphor icons

The feeling is friendly, energetic and trustworthy. It must never read as clinical or as a generic SaaS product.

### Colour (use ONLY these)
| Role | Hex | Notes |
|---|---|---|
| Primary | `#2563eb` | hover `#1d4ed8`, pressed `#1e40af`; tint `#eff6ff` / `#dbeafe` |
| Accent orange | `#f97316` | |
| Navy | `#0f172a` | gradient partner `#111c33`, dark section top `#1e293b` |
| Success | `#16a34a` | tint `#dcfce7` |
| Highlight yellow | `#facc15` | pale `#fde68a`, tint `#fef9c3` |
| Danger | `#dc2626` | tint `#fee2e2`, text `#991b1b` |
| Text | `#1f2937` | muted `#4b5563`, subtle `#94a3b8`, borders `#e2e8f0`, page bg `#f8fafc`, surface `#ffffff` |
| On navy | `#f1f5f9` | muted `#cbd5e1`, glass tile `rgba(255,255,255,.06)` + border `rgba(255,255,255,.12)` |

### Typography
| Use | Font | Details |
|---|---|---|
| Headings | Outfit 700/800 | letter-spacing −0.01em |
| Body | Quicksand 500/600/700 | 16px base on mobile, line-height 1.4 |
| Numbers / metrics / countdown | Inter 800 | tabular-nums |

No other fonts.

### Shape & depth
| Element | Radius | Shadow |
|---|---|---|
| Buttons | 10px | none |
| Inputs | 10px | none |
| Cards | 16px | `0 10px 24px rgba(15,23,42,.08)` |
| Hero card | 20px | `0 20px 50px rgba(15,23,42,.12)` |
| Pills / badges | 999px | none |

### Components
- **Primary button:** full width on mobile, blue fill, white bold Quicksand, about 52px tall. The main CTA may carry the subtle blue pulse ring from the landing page.
- **Secondary button:** white with a blue border.
- **WhatsApp button:** green `#16a34a` with the Phosphor `whatsapp-logo` icon.
- **Locked card:** dimmed content, a yellow-on-navy padlock badge, the text "Tersedia dalam Pakej Complete" and a "Naik taraf" button.
- **Form fields:** label above the input. Errors appear as a red BM sentence that tells the user what to do next.
- **Bottom tab bar:** white with a top border, 5 items (Utama, Rekod, Ebook, Cabaran, Akaun), Phosphor icons with labels, active item in blue.
- **Desktop:** a left sidebar with the same items.
- **Health note:** a small muted footer on participant pages.

### Layout
- Mobile-first at 375px with a 16px gutter and no horizontal scroll.
- Content max-width is about 560px on desktop for participant pages. Admin pages may use the full width with tables.
- Section rhythm is 16–24px.

### Motion
- Count-up on numbers, a gentle pop on badges, and the pulse on the primary CTA only.
- Respect `prefers-reduced-motion`.

### Content rules
- Never promise results, for example never "turun 10kg dijamin".
- Show the health note and the disclaimer where the spec requires them.
