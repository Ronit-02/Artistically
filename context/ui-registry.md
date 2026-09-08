# Artistically — UI Registry

## Purpose

The UI registry records the reusable component inventory, its ownership level, and its stable public contract. Source code remains authoritative for implementation details and current consumers.

## Ownership levels

- **Primitives** are domain-neutral, token-driven, accessible building blocks.
- **Shared composites** represent stable marketplace concepts used in more than one place.
- **Feature components** belong to a single workflow until genuine reuse is established.

## Registration criteria

A shared component should have at least two real consumers or foundational value, use documented tokens, define accessibility behavior, and have known loading, disabled, error, and responsive states where applicable. Do not register a component merely to reduce one file’s line count.

## Component API rules

- Prefer semantic variants over raw styling flags.
- Avoid styling props such as `blue`, `roundedMore`, `smallText`, or `hasShadow`.
- Support `className` only for controlled layout composition; variants remain the preferred styling mechanism.
- Forward refs for primitives that participate in focus, forms, or overlays.
- Preserve native element behavior and accessibility.
- Keep controlled and uncontrolled behavior explicit.
- Do not combine navigation and state-changing behavior in one ambiguous API.
- Compound components are appropriate for tightly related structures such as dialogs or tabs.
- Introduce a shared component only after searching existing patterns.

## Required state matrix

Each registered component documents the applicable default, hover, focus-visible, active, disabled, loading, error, selected or expanded, empty, narrow-layout, and reduced-motion states. A component does not need a state that cannot occur, but it must not leave a relevant state undefined.

## Accessibility and styling

- Prefer native semantics and established keyboard interaction patterns.
- Icon-only controls require accessible names. Form primitives associate labels, descriptions, and errors with their controls.
- Overlay primitives define focus entry, containment, escape, outside interaction, and focus restoration.
- Status components expose meaningful text rather than color alone.
- Automated accessibility checks supplement manual keyboard and screen-reader review.
- Shared components consume [ui-tokens.md](./ui-tokens.md) and follow [ui-rules.md](./ui-rules.md); they cannot introduce an undocumented font, color, radius, shadow, or animation.
- Responsive behavior follows content requirements and avoids unnecessary nested surfaces.

## Current inventory

| Ownership | Component | Location | Contract |
|---|---|---|---|
| Primitive | `Button` | `src/components/ui/Button.tsx` | Native-button props and forwarded ref; `primary`, `secondary`, and `ghost` variants; sizes; loading exposes `aria-busy` and disables duplicate activation. |
| Primitive | `AccordionItem` | `src/components/ui/AccordionItem.tsx` | Native disclosure button with explicit expanded/control relationship, labelled region, and reduced-motion-safe icon transition. |
| Primitive | `Breadcrumb` | `src/components/ui/Breadcrumb.tsx` | Labelled navigation with ordered-list semantics, current-page state, links, and optional action items. |
| Primitive | `Logo` | `src/components/ui/Logo.tsx` | Accessible home link; decorative SVG remains hidden from assistive technology. |
| Primitive | `NotFoundState` | `src/components/ui/NotFoundState.tsx` | Resource-specific 404 heading and explanation with browser-back and homepage actions. |
| Primitive | `PageHeader` | `src/components/ui/PageHeader.tsx` | Page title, optional subtitle, breadcrumbs, and optional action slot. |
| Primitive | `RatingStars` | `src/components/ui/RatingStars.tsx` | Accessible static rating output and labelled interactive controls when a callback is supplied. |
| Primitive | `SectionHeader` | `src/components/ui/SectionHeader.tsx` | Section title with semantic link or button action and touch-accessible controls. |
| Primitive | `SpecRow` | `src/components/ui/SpecRow.tsx` | Label-and-value factual detail row sourced from maintained product data. |
| Shared composite | `Navbar` and `Footer` | `src/components/layout/` | Labelled marketplace navigation, real destinations, and responsive action controls. |
| Shared composite | `NotificationBell` and `SaleBanner` | `src/components/layout/` | Notification entry point and optional truthful, dismissible announcement. |
| Shared composite | `ProductCard` and `CartItem` | `src/components/product/` | Artwork summary, cart-line presentation, semantic navigation, and accessible mutation controls. |
| Shared composite | `ArtistCard` | `src/components/artist/ArtistCard.tsx` | Semantic artist-profile navigation and text-supported verification display. |
| Feature | `ArtistCollectionManager` | `src/components/artist/ArtistCollectionManager.tsx` | Artist-portal collection management with validation, loading, retry, empty, and confirmation states. |
| Feature | `ArtistSubmissionForm` | `src/components/artist/ArtistSubmissionForm.tsx` | Artist listing-submission workflow. |
| Feature | `ArtistVerificationForm` | `src/components/artist/ArtistVerificationForm.tsx` | Artist verification-submission workflow with visible validation and recovery states. |
| Feature | `ReportForm` | `src/components/forms/ReportForm.tsx` | Marketplace report submission with reason selection, feedback, and sign-in guidance. |
| Feature | `AdminVerificationQueue` | `src/components/admin/AdminVerificationQueue.tsx` | Administrative verification review with filters, decisions, confirmation, pending, error, retry, and empty states. |

## Planned primitives

| Component | Purpose | Key contract |
|---|---|---|
| `IconButton` | Accessible icon-only action | Requires an accessible name and a 44px target. |
| `Input` and `Textarea` | Text-field foundations | Labels, descriptions, errors, and prefix/suffix or count support when needed. |
| `Select`, `Checkbox`, `RadioGroup` | Choice foundations | Visible group labeling, invalid state, full label targets, and appropriate keyboard behavior. |
| `FormField` | Consistent form composition | Connects label, description, control, and error IDs. |
| `Badge`, `Alert`, `Toast` | Compact status and feedback | Use semantic variants; critical state never relies only on transient feedback. |
| `Dialog`, `Drawer`, `DropdownMenu`, `Tooltip` | Overlay and compact actions | Define focus and keyboard behavior; a tooltip never carries essential content. |
| `Skeleton`, `EmptyState`, `Pagination` | Loading, empty, and browse states | Assistive-technology-safe loading, relevant empty guidance, and URL-backed accessible pagination. |

## Planned composites

| Component | Purpose |
|---|---|
| `MoneyDisplay`, `ProductPrice`, `PriceSummary` | Currency-safe price and authoritative total presentation. |
| `ArtworkMediaGallery`, `ArtworkSpecifications`, `VerificationLabel` | Art-specific display of media, factual details, and defined trust status. |
| `QuantityControl`, `AddressForm`, `OrderStatus`, `ShipmentTimeline` | Commerce and fulfillment interaction and state. |
| `ReviewSummary`, `FileUploadField`, `DataTable`, `ConfirmActionDialog` | Review, upload, operations, and consequence-focused confirmation patterns. |

## Change process

1. Search the repository for an existing pattern.
2. Choose the narrowest ownership level.
3. Define props, states, accessibility, and token usage.
4. Implement and verify with real consumers.
5. Update this inventory when a reusable component’s stable contract or ownership changes.

Security-sensitive workflow behavior and internal service dependencies belong in the relevant ignored local context file, not in this registry.

## Deprecation

Mark a deprecated component here with its replacement and migration constraint. Do not add consumers to it, and remove it only after repository search confirms it has none.
