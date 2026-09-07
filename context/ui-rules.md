# Artistically — UI Rules

## Overall direction

- The interface is a quiet gallery frame: warm, editorial, image-first, and trustworthy.
- Use generous whitespace and strong typographic hierarchy. Avoid decorative gradients, heavy shadows, glass effects, and excessive nested cards.
- Product facts, policy, provenance, artist identity, and delivery expectations take priority over promotional decoration.
- Do not display fabricated inventory, ratings, review counts, verification, awards, shipping promises, or scarcity.

## Cards

### Product cards

- Product image and title destinations are keyboard-reachable semantic links.
- Keep artist identity, title, price, and critical availability visible without hover. Wishlist controls work on touch and keyboard.
- Badges represent maintained facts; show comparison price only with a legitimate comparison price and discount policy.
- Use one primary image and a stable aspect ratio. Sold work may remain discoverable but cannot be added to cart.

### Artist, collection, and story cards

- Artist cards show a name, available context, and a defined verification state; verification has accessible text and an explanation.
- Use semantic full-card destinations without competing nested actions.
- Collection counts and editorial dates, authors, and categories come from maintained content fields.

### Operational cards

- Use cards to group one meaningful concept. Dense multi-column information remains a table on desktop.
- Do not create ordinary field groups by nesting cards within cards.

## Buttons and navigation

- Each local decision area has one dominant primary action; secondary, ghost, and destructive variants communicate lesser priority or risk.
- Controls, including icons, have a 44 by 44px touch target. Text starts with a clear verb; icon-only controls have an accessible name and, when needed, a visible tooltip.
- Async controls show progress, prevent duplicate submission, preserve stable width, and do not use temporary success feedback in place of durable state.
- Use a link for navigation and a button for a state change. Disable only when the reason is apparent; otherwise permit submission and show validation.
- Announcement bars show only active, accurate campaigns, lead to their stated destination, have accessible dismissal, and do not stack unnecessarily.
- The global header keeps logo, search, primary navigation, account, wishlist, and cart in a consistent order. Mobile navigation retains access to every required action and starts overflowing category navigation at the logical first item.
- Artist-workspace navigation distinguishes workspace from marketplace context, persists the selected section in the URL, and shows maintained attention states without fabricated analytics.

## Status, forms, and data presentation

- Badges are compact factual labels. Status names follow domain-state vocabulary, pair color with text, and avoid ambiguous labels such as `Approved` without a subject.
- Every input has a persistent label; placeholders are examples, not labels. Required fields are communicated in text and programmatically.
- Show validation near the field and an error summary for long forms. Preserve input after recoverable errors.
- Group artist-listing fields by identity, specifications, media, pricing, fulfillment, and policy. Make currency and measurement units explicit. Explain consequences before a dangerous status change.
- Tables retain actual table semantics, descriptive headers, announced sort state, consistent date/currency/identifier/status formatting, and a compact mobile adaptation that preserves required actions.

## Marketplace surfaces

- Product detail prioritizes accurate listing media and maintained artwork facts. Show type, medium, materials, dimensions, year, condition, edition, framing, authenticity, and provenance when applicable.
- Show seller identity and the meaning of verification. Present maintained fulfillment and policy facts before checkout; digital work states its maintained file, license, and delivery terms.
- Related work must be genuinely related by maintained artist, medium, category, collection, or behavior. Room previews disclose when their scale is approximate.
- Anonymous carts begin empty unless restoring that visitor’s own persisted cart. Display purchase-relevant variant and fulfillment facts and visibly revalidate changed price or availability.
- Checkout displays maintained subtotal, shipping, tax, discount, total, currency, seller grouping, and delivery estimates. A success screen reflects verified server state, and carts are not cleared before durable order creation.

## Typography, feedback, and accessibility

- Use [ui-tokens.md](./ui-tokens.md); do not use interface text below 12px, use tabular numerals for financial or analytical values, and retain system-font fallbacks.
- Loading states preserve predictable layout. Empty states explain the condition and offer one relevant next action. Error states say what failed, what was preserved, and whether retry is safe.
- Important success and error state remains visible in the page; toasts are supplemental. Do not imply a financial or upload outcome until authoritative reconciliation is known.
- All functionality works by keyboard. Focus order follows visual and logical order. Carousels provide pause controls, named navigation, and reduced-motion handling.
- Images use accurate alt text; decorative images use empty alt text. Artwork descriptions do not invent interpretation or metadata.
- Maintain WCAG AA contrast, provide touch/focus equivalents for hover-only content, and ensure dialogs manage focus correctly.

## Responsive and content rules

- Verify narrow mobile, tablet, small-laptop, and wide-desktop behavior. Required actions never rely on horizontal page overflow; sticky surfaces do not cover content or trap short screens.
- Product grids reduce columns before reducing text below readable size. Mobile filters use an accessible drawer with applied-count feedback and a clear reset action.
- Legal and support pages require reviewed, page-specific content before launch. Contact and social destinations are real or omitted.
- Dates, delivery promises, policy windows, promotional scarcity, and sale language are calculated from or backed by maintained content and policy data.

Sensitive authenticated-workflow implementation, provider dependencies, operational state, and release evidence belong in the relevant ignored local context file rather than this tracked UI contract.
