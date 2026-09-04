# Artistically — UI Tokens

## Token Philosophy

Artistically should feel editorial, calm, credible, and image-led. Artwork supplies most of the visual color; the interface provides a warm neutral frame with restrained blue accents for interaction and information.

Tokens are semantic. Components consume meanings such as `surface`, `text-muted`, or `action-primary`, not scattered raw color values.

## Color Tokens

### Core neutrals

| Token | Value | Use |
|---|---:|---|
| `--color-canvas` | `#FFFFFF` | Primary page background |
| `--color-surface` | `#FAFAF8` | Quiet panels and section contrast |
| `--color-surface-raised` | `#FFFFFF` | Menus, dialogs, and elevated content |
| `--color-surface-muted` | `#F4F4F1` | Image placeholders and disabled regions |
| `--color-border-subtle` | `#ECECE8` | Section and card separation |
| `--color-border-default` | `#DCDCD6` | Inputs and visible boundaries |
| `--color-border-strong` | `#B8B8B0` | Hovered or emphasized boundaries |
| `--color-text-heading` | `#111111` | Headings and primary values |
| `--color-text-body` | `#4F4F4A` | Body text |
| `--color-text-muted` | `#73736C` | Secondary information |
| `--color-text-subtle` | `#6B7280` | Tertiary metadata on light surfaces; passes WCAG AA for normal text |
| `--color-inverse` | `#FFFFFF` | Text on dark surfaces |

### Brand and interaction

| Token | Value | Use |
|---|---:|---|
| `--color-accent-50` | `#EFF6FF` | Selected background and subtle information |
| `--color-accent-100` | `#DBEAFE` | Focus ring and soft highlight |
| `--color-accent-500` | `#3B82F6` | Secondary accent |
| `--color-accent-600` | `#2563EB` | Links, active controls, information |
| `--color-accent-700` | `#1D4ED8` | Hover and pressed accent |
| `--color-action-primary` | `#151515` | Primary commerce action |
| `--color-action-primary-hover` | `#292929` | Primary hover |
| `--color-action-primary-pressed` | `#050505` | Primary pressed |

### Status

| Token | Value | Use |
|---|---:|---|
| `--color-success-bg` | `#ECFDF3` | Success status surface |
| `--color-success-text` | `#067647` | Success text and icon |
| `--color-warning-bg` | `#FFFAEB` | Warning and pending surface |
| `--color-warning-text` | `#B54708` | Warning and pending text |
| `--color-danger-bg` | `#FEF3F2` | Error and destructive surface |
| `--color-danger-text` | `#B42318` | Error and destructive text |
| `--color-info-bg` | `#EFF8FF` | Informational surface |
| `--color-info-text` | `#175CD3` | Informational text |

Status meaning must not depend on color alone. Pair it with text and, where useful, an icon.

## Typography

### Font families

- Heading: `General Sans`, `Inter`, system sans-serif fallback.
- Body: `Inter`, system sans-serif fallback.
- Numeric and code-like identifiers: use the body family with tabular numerals; use a monospace family only for technical identifiers in internal tools.
- Production fonts should be self-hosted in supported WOFF2 files.

### Type scale

| Token | Size / line height | Weight | Typical use |
|---|---|---:|---|
| `display-lg` | `56px / 60px` | 600–700 | Rare campaign hero |
| `display-md` | `44px / 48px` | 600–700 | Desktop page hero |
| `heading-xl` | `36px / 40px` | 600–700 | Page title |
| `heading-lg` | `30px / 36px` | 600 | Major section |
| `heading-md` | `24px / 30px` | 600 | Section heading |
| `heading-sm` | `20px / 26px` | 600 | Card group or dialog title |
| `body-lg` | `18px / 30px` | 400 | Editorial lead |
| `body-md` | `16px / 26px` | 400 | Default body |
| `body-sm` | `14px / 22px` | 400–500 | Controls and secondary content |
| `label-md` | `13px / 18px` | 500–600 | Input labels and compact actions |
| `caption` | `12px / 17px` | 400–600 | Metadata and badges |

Avoid interface text below 12px. Price, policy, status, and accessibility-critical information should generally be 13px or larger.

### Letter spacing

- Large headings: `-0.035em` to `-0.02em`.
- Body: normal.
- Uppercase category labels: `0.08em`, used sparingly.

## Spacing

Use a 4px base unit:

| Token | Value |
|---|---:|
| `space-1` | `4px` |
| `space-2` | `8px` |
| `space-3` | `12px` |
| `space-4` | `16px` |
| `space-5` | `20px` |
| `space-6` | `24px` |
| `space-8` | `32px` |
| `space-10` | `40px` |
| `space-12` | `48px` |
| `space-16` | `64px` |
| `space-20` | `80px` |
| `space-24` | `96px` |

Related controls use 8–16px gaps. Card content uses 16–24px padding. Major marketplace sections use 64–96px vertical rhythm on desktop and 40–64px on mobile.

## Layout

### Containers

- Marketplace maximum width: `1240px`.
- Editorial reading width: `680px`.
- Form reading width: `560px`.
- Page gutters: `24px` mobile, `40px` tablet and desktop.
- Dense internal admin screens may use a wider `1440px` shell with explicit density rules.

### Grid

- Base: 12-column conceptual desktop grid.
- Product browse: 2 columns mobile, 3 tablet, 4 desktop, 5 only when cards remain readable.
- Minimum comfortable product-card width: approximately `190px` desktop and `150px` mobile.
- Use CSS grid for two-dimensional catalog layout and flex only for one-dimensional groups.

### Breakpoints

Use Tailwind defaults unless a measured layout need justifies a new token:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Design behavior at narrow mobile, 768px tablet, small laptop, and wide desktop. Do not treat breakpoint classes alone as responsive verification.

## Radius

| Token | Value | Use |
|---|---:|---|
| `radius-xs` | `4px` | Small tags and image details |
| `radius-sm` | `8px` | Inputs and compact controls |
| `radius-md` | `12px` | Cards and buttons |
| `radius-lg` | `16px` | Hero panels and dialogs |
| `radius-pill` | `999px` | Pills and circular controls |

Avoid mixing more than two radius sizes in one component family.

## Shadows

Shadows are restrained because artwork should dominate:

| Token | Value | Use |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,.05)` | Controls |
| `shadow-sm` | `0 4px 14px rgba(0,0,0,.06)` | Hovered card or compact menu |
| `shadow-md` | `0 12px 32px rgba(0,0,0,.10)` | Dialog and major popover |

Use border and surface contrast before adding a shadow.

## Motion

- Fast feedback: 120–180ms.
- Standard transition: 180–240ms.
- Large reveal or carousel fade: 300–500ms.
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` for calm deceleration.
- Respect `prefers-reduced-motion`; remove autoplay and non-essential transforms when requested.
- Hover transforms must not cause layout movement.

## Focus

- Default focus ring: 2px accent-600 with 2px canvas offset.
- Focus must remain visible on dark, image, and status surfaces.
- Do not remove outlines without an equally visible replacement.

## Image Ratios

- Product card default: 4:5 or 1:1 according to category and merchandising context.
- Product gallery: preserve the full artwork when cropping would alter the work; provide contain and zoom behavior.
- Artist cover: 16:6 or 16:7.
- Collection cover: 16:10.
- Editorial story: 4:3 or 1:1.
- Avoid reusing generic room images as if they depict the actual artwork scale.
