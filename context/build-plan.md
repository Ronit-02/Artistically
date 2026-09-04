# Artistically — Build Plan

## Planning Principles

- Establish one real end-to-end workflow before expanding page count.
- Treat trust, payment, fulfillment, and seller settlement as core product work.
- Prefer vertical slices that include UI, API, data, authorization, tests, and observability.
- Do not display claims such as verified, secure checkout, paid, refunded, insured, or authentic until backed by durable state and policy.
- Keep REST as the only application API style for the initial release.
- A phase is complete only when its exit criteria pass.

## Product Direction and Launch Decisions

- Artistically is an India-first, INR, mobile-friendly web marketplace and discovery platform for curated original art.
- Discovery and editorial merchandising lead the experience; trusted commerce remains the foundation.
- The initial buyer is a first-time or emerging collector who needs clear artwork facts, credible artists, protected payment, and dependable delivery.
- Artistically owns editorial Stories and editorial collections. Artists own their profiles, artwork, and artist-created collections containing only their own artwork.
- The public trust model uses one `Verified` badge. It means Artistically reviewed the artist's identity and background; it does not guarantee every artwork, price, or future action.
- Reports create review cases and do not directly trigger enforcement. A validated report can permanently remove the affected artwork or collection from public discovery and purchasing. Appeals are supported.
- Automated valuation is not part of the product. NFTs, fractional ownership, international tax/customs complexity, and native mobile apps are not initial-release scope.
- Social feeds, buyer-artist messaging, auctions, and optional AR/3D previews are broader roadmap capabilities. They must not delay the trusted commerce foundation.
- Server state is authoritative for identity, permissions, pricing, inventory, verification, payment, orders, and moderation outcomes.

## Phase 0 — Baseline and Delivery Safety

### Goals

Make the repository safe to change and capable of rejecting broken builds.

### Work

- Align README and package documentation with the installed Next.js version.
- Regenerate Prisma Client and resolve all TypeScript errors.
- Remove `ignoreBuildErrors` from Next.js configuration.
- Replace the obsolete lint command with an ESLint 9-compatible script and configuration.
- Add formatting, type-check, lint, unit-test, integration-test, and build scripts.
- Create CI for clean install, Prisma validation, type-check, lint, tests, and build.
- Add initial Prisma migration history and a reset-safe development seed.
- Define environment validation that fails fast for required production variables.
- Add request IDs and structured server logging.
- Record current architecture decisions in this context folder.

### Exit criteria

- Clean checkout can install dependencies and build without suppressed errors.
- CI passes from an empty generated-output state.
- Database can be created from migrations and seeded repeatedly without duplicate records.
- No committed default production secret or credential exists.

## Phase 1 — Unify Frontend and Backend

### Goals

Remove the split between the mock storefront and the real REST and Prisma application.

### Work

- Define public DTOs for products, artists, users, cart lines, wishlist items, reviews, and orders.
- Standardize all public IDs as strings.
- Build a typed fetch client that handles API success, validation errors, authentication errors, and request IDs.
- Replace static product, artist, and story adapters with REST calls.
- Move remote state into React Query with stable query keys.
- Restrict Zustand to client-only UI state.
- Implement server-backed registration, sign-in, sign-out, current-user, and profile update.
- Add email normalization and secure session behavior.
- Protect collector, artist, and administrator route groups.
- Add loading, error, empty, unauthorized, and not-found states.
- Remove initial mock cart, fabricated profile data, and hard-coded order history from production routes.

### Current implementation position

- Completed in this phase: typed API client and DTOs, REST-backed product and artist catalog reads, server-backed registration/login/logout, and current-user session reads.
- Next implementation slice: connect persistent cart and wishlist UI to the existing APIs, then connect profile data and protected route behavior.
- Do not begin checkout or payment implementation in this slice. Checkout requires the Phase 3 money, inventory reservation, payment, webhook, and idempotency foundations.

### Tests

- Authentication integration tests.
- Authorization tests for user, artist owner, non-owner, and administrator.
- DTO contract tests.
- Browser tests for registration, login, logout, product browse, and protected-route redirection.

### Exit criteria

- A user created through the UI persists in PostgreSQL and survives a new browser session.
- Storefront products and artist profiles render only from API data.
- No production UI imports marketplace records from `src/data`.
- Numeric mock-ID transformations are removed.

## Phase 2 — Art Catalog and Artist Onboarding

### Goals

Enable legitimate artists to create accurate, reviewable listings.

### Work

- Expand the catalog schema for artwork type, medium, materials, dimensions, weight, creation year, edition, condition, framing, authenticity, provenance, fulfillment mode, processing time, return eligibility, and digital license.
- Add product variants only where a listing truly supports selectable variants.
- Create MediaAsset and signed upload workflows.
- Build artist profile onboarding with handle, biography, location, portfolio, policies, and public contact choices.
- Integrate Stripe Connect onboarding state without enabling payouts yet.
- Add verification submission and review states.
- Build artwork create, edit, preview, submit, publish, archive, and inventory screens.
- Add listing completeness rules by artwork type.
- Add moderation queue and basic administrator decisions.
- Implement real collections and collection items.

### Tests

- Listing validation matrix by physical original, physical edition, made-to-order work, and digital work.
- Media ownership and upload-policy tests.
- Listing owner and administrator authorization tests.
- Verification state-transition tests.

### Exit criteria

- An eligible artist can onboard and submit a complete listing without database intervention.
- Invalid media ownership, missing required specifications, and unauthorized listing updates are rejected server-side.
- Public verification labels map to documented reviewed states.

## Phase 3 — Cart, Checkout, and Payments

### Goals

Create a payment-safe purchase path with authoritative totals and inventory.

### Work

- Implement persistent cart list, add, quantity update, variant update, remove, and clear operations.
- Revalidate listing state, variant, inventory, price, shipping, discount, and currency at checkout.
- Add normalized Address and immutable order address snapshots.
- Model Payment, PaymentEvent, SellerOrder, and immutable OrderItem snapshots.
- Integrate Stripe PaymentIntent or Checkout Session server-side.
- Implement Stripe webhook signature verification and idempotent event storage.
- Guard inventory atomically and prevent negative stock.
- Add checkout idempotency to prevent duplicate charges and orders.
- Implement platform commission and seller allocation records.
- Replace the static tracking redirect with real order confirmation.
- Add payment-failure, abandoned-session, retry, and duplicate-event handling.

### Tests

- Price tampering and unauthorized-discount tests.
- Concurrent last-item purchase test.
- Duplicate checkout request test.
- Duplicate and out-of-order Stripe webhook tests.
- Successful payment, failed payment, expired payment, and refund integration paths.

### Exit criteria

- No order is marked paid from a client redirect.
- Repeated client requests and webhook events create at most one intended financial result.
- Two buyers cannot both purchase a one-of-one artwork.
- Financial records reconcile with the Stripe test environment.

## Phase 4 — Fulfillment, Payouts, and Post-Purchase

### Goals

Complete the marketplace transaction after payment.

### Work

- Build seller-specific order acceptance and fulfillment workflows.
- Add Shipment and ShipmentEvent records with tracking numbers and provider links.
- Define valid order and seller-order state machines.
- Add processing deadlines and late-fulfillment operations.
- Implement protected digital delivery with expiring access and license acceptance.
- Build cancellation eligibility and idempotent cancellation.
- Implement partial and full refunds through Stripe with durable refund state.
- Add damage, non-delivery, authenticity, and copyright dispute cases.
- Integrate Stripe Connect payout visibility and seller statements.
- Add transactional email for payment, fulfillment, delivery, cancellation, refund, and payout events.

### Tests

- State-transition authorization tests.
- Stock restoration and repeated cancellation tests.
- Partial multi-seller refund tests.
- Protected digital-download authorization tests.
- Seller statement reconciliation tests.

### Exit criteria

- Buyers and sellers see the same durable order truth appropriate to their role.
- Refund and cancellation actions reconcile with inventory, payment, fee, and payout records.
- Every seller can understand gross sale, deductions, refund exposure, balance, and payout state.

## Phase 5 — Trust, Reviews, and Marketplace Operations

### Goals

Make Artistically credibly trustworthy rather than merely visually trustworthy.

### Work

- Link review eligibility to delivered order items.
- Add review reporting and moderation.
- Build verification explanations visible to buyers.
- Add certificate-of-authenticity metadata and delivery records.
- Implement listing, artist, review, and copyright reports.
- Build administrator case queues with evidence references and audit logs.
- Replace all placeholder legal and support content with reviewed policies.
- Add buyer protection, return, damage, dispute, prohibited-content, copyright, privacy, and seller terms.
- Create risk signals for repeated failed payments, suspicious reviews, duplicate identities, and listing abuse.

### Exit criteria

- Every displayed trust claim is linked to a defined rule and durable evidence state.
- Only eligible purchases can receive verified-purchase reviews.
- Operations staff can investigate and resolve common marketplace cases without direct database edits.

## Phase 6 — Discovery, SEO, Accessibility, and Performance

### Goals

Make trusted inventory discoverable and the experience usable across devices and abilities.

### Work

- Add database indexes and server-side search/filter/sort behavior.
- Correct rating filtering and pagination totals.
- Add canonical metadata, dynamic titles, social images, sitemap, robots rules, and Product structured data.
- Self-host fonts and optimize image priority, sizes, formats, and placeholders.
- Complete keyboard, screen-reader, contrast, focus, reduced-motion, and touch-target audits.
- Fix mobile navigation overflow and non-hover interaction behavior.
- Add accessible carousel pause and controls.
- Establish Core Web Vitals and bundle budgets.
- Add analytics events with privacy review and stable event naming.

### Exit criteria

- Core purchase and seller flows pass the accessibility test matrix.
- Search results, counts, filters, and URLs are consistent and shareable.
- Performance budgets pass on representative mobile hardware and network conditions.
- Search engines can understand products, artists, collections, and editorial pages.

## Phase 7 — Controlled Launch and Growth

### Goals

Launch with measurable marketplace quality and safe operational capacity.

### Work

- Recruit and verify a focused initial artist cohort.
- Establish category-level listing quality targets.
- Run payment, refund, dispute, fulfillment, and incident simulations.
- Create operations runbooks and escalation ownership.
- Configure dashboards and alerts for conversion, payments, fulfillment, disputes, and supply activation.
- Launch in a constrained geography and currency before broader expansion.
- Add artist referrals, editorial merchandising, saved searches, and restock alerts only after core stability.

### Exit criteria

- Launch checklist and incident rollback plan are approved.
- Support and operations can handle expected case volume.
- Payment, fulfillment, refund, and dispute metrics remain within defined thresholds during the pilot.
- Product decisions after launch are based on observed funnel and trust metrics.

## Dependency Order

1. Build safety and migrations.
2. Real identity and API-backed storefront.
3. Artist onboarding and accurate catalog.
4. Cart, payment, and inventory.
5. Fulfillment, refunds, and payouts.
6. Trust operations and policies.
7. Discovery, quality, and launch growth.

Later phases may be designed earlier, but they must not bypass the data and trust foundations on which they depend.
