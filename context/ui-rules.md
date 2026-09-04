# Artistically — UI Rules

## Overall Direction

- The interface is a quiet gallery frame: warm, editorial, image-first, and trustworthy.
- Use generous whitespace and strong typographic hierarchy.
- Avoid decorative gradients, heavy shadows, glass effects, and excessive nested cards.
- Product facts, policy, provenance, artist identity, and delivery expectations are more important than promotional decoration.
- Do not display fabricated inventory, ratings, review counts, verification, awards, shipping promises, or scarcity.

## Cards

### Product cards

- Entire product title and image destination must be keyboard reachable through semantic links.
- Keep artist identity, title, price, and critical availability visible without hover.
- Wishlist must be usable on touch and keyboard; it cannot rely on hover-only appearance.
- Badges represent stored facts such as original, limited edition, sold, new, or verified status.
- Use one primary image and stable aspect ratio to prevent layout shift.
- Show original price only when a legitimate comparison price and discount policy exist.
- Sold artwork remains visually discoverable when appropriate but cannot be added to cart.

### Artist cards

- Show artist name, primary medium or location when available, portfolio count, and defined verification state.
- A verification icon requires an accessible label and a linked explanation.
- Follower counts are secondary and must not dominate credibility.

### Collection and story cards

- Use semantic links for the full card destination.
- Avoid placing multiple competing actions inside one card.
- Collection counts come from actual collection items.
- Editorial dates, authors, and categories are real content fields.

### Internal dashboard cards

- Use cards only to group one meaningful operational concept.
- Dense tables should remain tables rather than separate card rows on desktop.
- Cards cannot contain multiple additional card layers for ordinary field grouping.

## Buttons

### Hierarchy

- Primary: one dominant action per local decision area, using dark neutral fill.
- Secondary: bordered action for alternatives.
- Ghost: low-emphasis navigation or utility action.
- Destructive: explicit danger styling and confirmation proportionate to recoverability.

### Behavior

- Minimum touch target is 44px by 44px, including icon controls.
- Button text starts with a clear verb: Add to cart, Publish artwork, Mark as shipped.
- Disable only when the reason is apparent; otherwise allow submission and show validation.
- Async buttons show progress, prevent accidental duplicate submission, and preserve a stable width.
- Success labels are temporary feedback, not a replacement for updated durable state.
- Use a link when navigation is the action and a button when application state changes.
- Icon-only buttons require an accessible name and visible tooltip where meaning is not universal.

## Navigation Bars

### Sale or announcement bar

- Show only active, accurate campaigns.
- The destination matches the announced promotion.
- Dismissal is accessible and may be remembered locally.
- Avoid stacking multiple bars above primary navigation.

### Global header

- Logo, search, primary navigation, account, wishlist, and cart follow a consistent order.
- Mobile header retains logo, account, wishlist, cart, search, and menu access without clipping.
- Horizontal category navigation begins at the logical first category on mobile; do not center overflowing content.
- Cart counts reflect server-backed cart state after authentication changes.
- Unlabeled icon buttons are prohibited.

### Artist workspace navigation

- Clearly distinguish marketplace and artist workspace context.
- Persist the selected workspace section in the URL.
- Show verification, payout, and fulfillment attention states without using fabricated analytics.

## Badges and Status

- Badges are compact factual labels, not decoration.
- Status names use consistent vocabulary from domain state machines.
- Pair color with text; icons may reinforce but not replace the label.
- Verification variants must distinguish identity reviewed, portfolio reviewed, and other approved meanings.
- Avoid ambiguous labels such as Approved or Done without a subject.
- Limited edition badges require edition-size data.
- Discount badges require server-calculated values.

## Forms

- Every input has a persistent label; placeholders provide examples, not names.
- Required fields are communicated in text and programmatically.
- Validation appears near the field and an error summary appears for long forms.
- Preserve entered data after recoverable server errors.
- Group artist listing fields by artwork identity, specifications, media, pricing, fulfillment, and policy.
- Do not present size selectors for one-of-one works without variants.
- Currency and measurement units are explicit.
- Dangerous status changes explain their consequences before confirmation.

## Product Detail Rules

- The media gallery and truthful artwork representation are the visual priority.
- Specifications are sourced from the listing, not hard-coded component text.
- Display artwork type, medium, materials, dimensions, year, condition, edition, framing, authenticity, and provenance when applicable.
- Show seller identity and what verification covers.
- Present processing time, shipment origin, shipping price, insurance, returns, and damage policy before checkout.
- Digital artwork clearly states file format, resolution, license, download limits, and whether commercial use is permitted.
- Reviews identify verified purchases.
- Related work is genuinely related by artist, medium, category, collection, or behavior—not a fixed static slice.
- Room previews must communicate whether scale is approximate.

## Cart and Checkout Rules

- Cart starts empty for anonymous new visitors unless restored from their own persisted cart.
- Display variant and fulfillment facts that affect the purchase.
- Revalidate price and availability visibly when changed.
- Checkout shows subtotal, shipping, tax, discount, total, currency, seller grouping, and delivery estimates.
- Secure checkout wording is displayed only after Stripe is integrated and policies are accurate.
- Payment success screen is driven by verified server payment state.
- Do not clear the cart before durable order creation.

## Tables and Operational Lists

- Use actual table semantics for multi-column desktop data.
- Headers remain descriptive and sortable state is announced.
- Provide compact mobile adaptations that preserve status and required actions.
- Dates, currency, identifiers, and status columns use consistent formatting.
- Empty states explain why the list is empty and the next valid action.

## Typography Rules

- Use the type tokens in [ui-tokens.md](./ui-tokens.md).
- Do not use interface text below 12px.
- Avoid uppercase for sentences and long labels.
- Keep hero headings within a readable width.
- Use tabular numerals for prices, statements, and analytics.
- Self-host production fonts and preserve system fallbacks.

## Feedback and States

- Loading: preserve layout with skeletons only when the final structure is predictable.
- Empty: explain the condition and give one relevant next action.
- Error: state what failed, what was preserved, and whether retry is safe.
- Success: reflect durable state and provide the next useful destination.
- Offline or timeout: do not imply payment or upload failure until reconciliation is checked.
- Toasts are supplemental; important state remains visible in the page.

## Accessibility Rules

- All functionality works with keyboard alone.
- Focus order follows visual and logical order.
- Carousels have pause controls, named navigation, and reduced-motion handling.
- Images use meaningful alt text; decorative images use empty alt text.
- Artwork alt text describes the work without inventing interpretation or metadata.
- Contrast meets WCAG AA for normal text and controls.
- Hover-only content has an equivalent touch and focus behavior.
- Dialogs trap focus, name themselves, and restore focus on close.

## Responsive Rules

- Test at 390px mobile, 768px tablet, small laptop, and wide desktop.
- Do not rely on horizontal page overflow for required actions.
- Sticky panels must not cover content or trap short screens.
- Product grids may reduce columns before shrinking text below readable sizes.
- Mobile filters use a drawer with applied-count feedback and clear reset behavior.
- Verify navigation from the first and last item at every breakpoint.

## Content and Trust Rules

- Legal and support pages contain reviewed, page-specific content before launch.
- Contact destinations and social links are real or omitted.
- Dates, delivery promises, and policy windows are calculated or maintained content.
- Never use real famous artist identities with fabricated profiles, inventory, reviews, or verification.
- Promotional scarcity and sale language must be supported by actual campaign and inventory data.

