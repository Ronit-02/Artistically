# Artistically — UI Registry

## Purpose

This registry defines how reusable interface components are created, reviewed, recorded, and consumed. It prevents duplicated patterns and avoids turning `components/ui` into an unowned collection of one-off wrappers.

## Ownership Levels

### Primitive components

Location: `src/components/ui`

Examples: Button, IconButton, Input, Select, Checkbox, Dialog, Drawer, Tooltip, Badge, Tabs, Accordion, Skeleton, Spinner.

Primitives are domain-neutral, token-driven, accessible, and broadly reusable.

### Composite shared components

Location: a shared semantic folder such as `src/components/commerce`, `src/components/product`, `src/components/artist`, or `src/components/forms`.

Examples: MoneyDisplay, ProductCard, ArtistCard, QuantityControl, PriceSummary, ArtworkSpecifications, VerificationLabel, AddressForm.

Composites understand a stable domain concept but do not fetch their own route-level data.

### Feature components

Location: `src/features/<feature>/components` or inside the owning route when reuse is unlikely.

Examples: CheckoutPaymentStep, ListingMediaEditor, VerificationEvidenceForm, SellerFulfillmentPanel.

Feature components may depend on feature DTOs and actions. They should not be moved into shared folders until at least two real consumers require the same behavior.

## Registration Criteria

A component enters the shared registry when:

- It has at least two real consumers or represents a foundational primitive.
- Its visual states and behavior can be described independently of one page.
- It uses documented tokens.
- Accessibility behavior is defined.
- Loading, disabled, error, and responsive behavior are known where relevant.
- Public props are narrower and more semantic than copying raw HTML plus styling flags.

Do not register a component merely to reduce one file’s line count.

## Component API Rules

- Use semantic variants such as `primary`, `secondary`, `danger`, or `verified`.
- Avoid props such as `blue`, `roundedMore`, `smallText`, or `hasShadow` that expose implementation styling.
- Support `className` only where controlled layout composition is needed; variants remain the preferred styling mechanism.
- Forward refs for primitives that participate in focus, forms, or overlays.
- Preserve native element props unless doing so creates ambiguous behavior.
- Do not combine navigation and mutation behavior in one component API.
- Controlled and uncontrolled behavior must be explicit and documented.
- Compound components are appropriate for tightly related structures such as Dialog or Tabs.

## Required State Matrix

Each registered component documents applicable states:

- Default.
- Hover.
- Focus visible.
- Active or pressed.
- Disabled.
- Loading.
- Error or invalid.
- Selected or expanded.
- Empty.
- Mobile and narrow-container behavior.
- Reduced-motion behavior.

## Accessibility Requirements

- Native semantics are preferred.
- Keyboard interaction follows established platform patterns.
- Icon-only controls require accessible names.
- Form primitives support label association, descriptions, and error IDs.
- Overlay primitives manage initial focus, focus containment, escape behavior, outside interaction, and focus restoration.
- Status components expose meaningful text, not color alone.
- Automated accessibility checks supplement manual keyboard and screen-reader review.

## Styling Rules

- Consume tokens from [ui-tokens.md](./ui-tokens.md).
- Follow behavior rules in [ui-rules.md](./ui-rules.md).
- Shared components cannot introduce an undocumented font, color, radius, shadow, or animation.
- Responsive variants are driven by content requirements.
- Avoid nested surface styling that produces card-within-card repetition.

## Registry Entry Template

Each registered component should have an entry containing:

- Component name.
- Status: existing, planned, deprecated.
- Location.
- Ownership level.
- Purpose.
- Variants.
- Required states.
- Accessibility contract.
- Current consumers.
- Replacement or migration note when deprecated.

## Current Registry

### Existing primitives

| Component | Location | Status | Notes |
|---|---|---|---|
| Button | `src/components/ui/Button.tsx` | Existing; API hardening complete | Forwards refs and native button props; `loading` exposes `aria-busy`, disables duplicate activation, and announces loading text |
| AccordionItem | `src/components/ui/AccordionItem.tsx` | Existing; accessibility review complete | Native button semantics, explicit expanded/control relationship, labelled region, and reduced-motion-safe icon transition |
| Breadcrumb | `src/components/ui/Breadcrumb.tsx` | Existing; semantics review complete | Uses labelled navigation, ordered-list semantics, current-page state, and native button behavior |
| Logo | `src/components/ui/Logo.tsx` | Existing; accessibility hardening complete | Home link retains its accessible name and the decorative SVG is hidden from assistive technology |
| PageHeader | `src/components/ui/PageHeader.tsx` | Existing | Keep for consistent route headings when layout matches |
| RatingStars | `src/components/ui/RatingStars.tsx` | Existing; display/interactive semantics hardened | Static output is an accessible rating image; callback mode uses a labelled native button with unique half-star gradient IDs |
| SectionHeader | `src/components/ui/SectionHeader.tsx` | Existing; interaction hardening complete | Link versus button action remains semantic; actions meet the 44px target and decorative icons are hidden |
| SpecRow | `src/components/ui/SpecRow.tsx` | Existing; narrow use | Specifications must come from product data, not hard-coded page content |

### Existing composites

| Component | Location | Status | Notes |
|---|---|---|---|
| ProductCard | `src/components/product/ProductCard.tsx` | Existing; semantics/truthfulness hardened | Uses semantic links, native wishlist control, persisted badge text, factual zero-stock sold state, and touch-accessible wishlist |
| CartItem | `src/components/product/CartItem.tsx` | Existing; semantics and touch targets hardened | Uses semantic artwork links, native typed quantity/remove controls, and 44px action targets; server-backed quantity and variant details remain active |
| ArtistCard | `src/components/artist/ArtistCard.tsx` | Existing; accessibility hardening complete | Semantic artist link, explicit verification text, and decorative avatar/badge imagery hidden from duplicate announcements; trust-state definition remains server-backed work |
| Navbar | `src/components/layout/Navbar.tsx` | Existing; navigation accessibility hardened | Labelled navigation landmarks, typed buttons, hidden decorative icons, 44px mobile/category/search targets, and existing server-backed counts |
| Footer | `src/components/layout/Footer.tsx` | Existing; content and semantics hardened | Uses real internal destinations, server-compatible category filters, labelled section navigation, and reviewed pre-launch policy links |
| SaleBanner | `src/components/layout/SaleBanner.tsx` | Existing; truthful announcement hardening complete | No unsupported campaign claim; real artist destination, persisted dismissal, and labelled native control |
| ReportForm | `src/components/forms/ReportForm.tsx` | Existing; initial marketplace reporting slice | Authenticated report submission for artwork and collections with reason selection, optional details, durable success/error feedback, and sign-in guidance |

### Existing feature components

| Component | Location | Status | Notes |
|---|---|---|---|
| ArtistVerificationForm | `src/components/artist/ArtistVerificationForm.tsx` | Existing; durable verification slice | Owner-scoped verification submission with status, loading, retry, validation, and success feedback; evidence references are never displayed to the owner |
| AdminVerificationQueue | `src/components/admin/AdminVerificationQueue.tsx` | Existing; durable verification slice | Admin-only status filtering and review decisions with evidence display, confirmation, notes, pending, error, retry, and empty states |
| ArtistCollectionManager | `src/components/artist/ArtistCollectionManager.tsx` | Existing; artist collections slice | Owner-scoped collection create/edit/archive form with own-artwork selection, validation, loading, retry, empty, confirmation, and unpublished-state feedback |

## Planned Primitive Registry

| Component | Purpose | Key contract |
|---|---|---|
| IconButton | Accessible icon-only action | Requires `aria-label`; 44px target |
| Input | Text field foundation | Label, description, error, prefix/suffix support |
| Textarea | Long-form input | Character count and error association when required |
| Select | Native select foundation | Visible label and invalid state |
| Checkbox | Binary or multi-select input | Full label target and description |
| RadioGroup | Exclusive choice | Arrow-key and group-label behavior |
| FormField | Consistent form composition | Label, description, control, and error IDs |
| Badge | Factual compact label | Semantic status variants and text |
| Alert | Persistent feedback | Info, success, warning, danger semantics |
| Toast | Supplemental transient feedback | Never sole carrier of critical state |
| Dialog | Modal decision surface | Focus management and named title |
| Drawer | Mobile filters and navigation | Focus management and scroll containment |
| DropdownMenu | Compact action menu | Keyboard navigation and typeahead |
| Tooltip | Supplemental control explanation | Not required to understand primary content |
| Skeleton | Predictable loading placeholder | Hidden appropriately from assistive technology |
| EmptyState | Empty collection guidance | Explanation and one relevant action |
| Pagination | Browse navigation | URL-backed page state and accessible labels |

## Planned Composite Registry

| Component | Purpose |
|---|---|
| MoneyDisplay | Currency-safe formatted amount from a Money DTO |
| ProductPrice | Current price, legitimate comparison price, and discount state |
| ArtworkMediaGallery | Full-artwork viewing, thumbnails, zoom, video, and accessible controls |
| ArtworkSpecifications | Category-aware factual specification list |
| VerificationLabel | Defined verification status with accessible explanation |
| QuantityControl | Bounded quantity selection with stock and pending states |
| PriceSummary | Authoritative subtotal, shipping, tax, discount, and total rows |
| AddressForm | Structured delivery address editing and validation |
| OrderStatus | Consistent buyer and seller order-state presentation |
| ShipmentTimeline | Normalized shipment events and tracking destination |
| ReviewSummary | Rating distribution and verified-review totals |
| FileUploadField | Signed upload progress, validation, retry, and removal |
| DataTable | Accessible operational table with sorting and responsive behavior |
| ConfirmActionDialog | Consequence-focused confirmation for risky actions |

## Change Process

1. Search the registry and repository before creating a new component.
2. Decide primitive, composite, or feature ownership.
3. Define props, states, accessibility, and token usage before implementation.
4. Implement with focused tests.
5. Verify keyboard and narrow-layout behavior.
6. Add or update the registry entry.
7. Migrate real consumers before deprecating the older pattern.

## Deprecation Rules

- Mark the component deprecated in this file and in its exported documentation.
- Name the replacement and migration constraint.
- Do not add new consumers to a deprecated component.
- Remove it only after repository search confirms no consumers remain.
