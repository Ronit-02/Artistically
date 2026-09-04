# Artistically — Progress Tracker

## Status Legend

- `Not started`: no production implementation.
- `Prototype`: visual or local demonstration exists without durable integration.
- `In progress`: production implementation has begun but exit criteria are incomplete.
- `Blocked`: a named dependency prevents meaningful progress.
- `Complete`: implemented, tested, documented, and verified against exit criteria.

## Current Snapshot

Last audited: 2026-08-26

Overall status: **Prototype with a partially implemented backend foundation**

### 2026-08-27 Signup validation feedback

- Updated the combined login/signup form to display API field-level validation failures with human-readable labels, while retaining account-level errors such as duplicate email addresses.
- Added an inline signup password requirements hint matching the existing registration validator.
- Verification: zero-warning ESLint passed for the changed page.

### 2026-08-27 Expanded art discovery seed

- Added four additional ceramics, two published editorial collections, three artist profiles, and two published editorials to the deterministic development seed.
- Removed the Collections link from the artwork-category row in the topbar while retaining the primary Collections navigation link and page.
- Verification: `npm run db:seed`, `npm run db:validate`, and zero-warning `npm run lint` passed.

### 2026-08-27 Local catalog image alignment

- Replaced seeded remote artwork, artist, and story URLs with matching assets from `public/` so development cards and detail views do not depend on unrelated or unavailable external images.
- Added explicit local homepage imagery for category covers, the discovery hero, carousel slides, and artist/editorial feature blocks.
- Verification: development seed completed against local PostgreSQL, Prisma schema validation passed, and zero-warning ESLint passed.

### 2026-08-27 Expanded development catalog seed

- Expanded the deterministic development seed from five products to 25 products across all eight persisted product categories, with varied prices, discounts, badges, inventory states, and artwork imagery for UI/card testing.
- Applied the seed successfully against the local PostgreSQL database and verified category counts with a read-only Prisma query.

### 2026-08-26 Production database verification

- Started a disposable PostgreSQL 16 instance, applied all 18 committed Prisma migrations, and confirmed all migration records completed with no pending migrations.
- Enabled `RUN_DATABASE_TESTS=true` with an isolated `TEST_DATABASE_URL`; all seven current database identity/concurrency tests passed, including cross-user isolation, uniqueness guards, order privacy, and the concurrent last-item claim.
- Replayed the CI database workflow locally: Prisma validation, migration deployment, strict type-check, zero-warning ESLint, full Vitest (240 passing), and the 67-page production build all passed. The hosted GitHub Actions run remains unobserved from this environment.

### 2026-08-25 Trust and operations completion slice

- Added durable review moderation states and admin review queue actions; hidden and removed reviews no longer appear in public product review reads, and review lifecycle decisions write audit records.
- Added append-only general `AuditLog` records plus an admin audit read endpoint for actor, action, target, reason, metadata, and timestamp history.
- Added evidence-provider policy records with explicit retention days; artist verification evidence now records the active provider policy and calculated retention deadline, while media assets carry retention/deletion markers for provider cleanup jobs.
- Added certificate-of-authenticity records with artist submission, public-product verification filtering, and admin verify/revoke handling with audit records.
- Added admin queues for review moderation and certificates while preserving the existing reports, appeals, disputes, submissions, payments, and verification tools.
- Verification: strict type-check, Prisma schema validation, zero-warning ESLint, focused moderation/verification tests (10 passing), and full Vitest suite (233 passing, 7 explicitly skipped database tests). Forward migration is additive; applying it to live PostgreSQL and executing provider-retention cleanup remain deployment verification tasks.

### 2026-08-25 Transactional notification slice

- Added durable `Notification` and `EmailDelivery` records with dedupe keys, read state, delivery status, and a forward migration `20260825170000_notifications`.
- Added the project-owned email webhook adapter (`EMAIL_WEBHOOK_URL`), authenticated notification list/read APIs, React Query notification hooks, and an accessible in-app notification bell using the existing navigation and token system.
- Wired verified payment success/failure, seller fulfillment, shipment/provider delivery, cancellation, refunds, digital delivery, and Stripe Connect payout events to idempotent buyer/artist notifications and email delivery records.
- Verification: Prisma generation, strict type-check, zero-warning ESLint, full Vitest suite (224 passing, 7 explicitly skipped database tests), and Prisma schema validation passed. Live PostgreSQL, email-provider, Stripe, and shipment-provider delivery remain deployment verification tasks.

### 2026-08-25 Seller transfer, payout, and statement completion slice

- Added durable `SellerSettlement` and `StripeTransfer` records with forward migration `20260825180000_seller_transfers_and_settlements`. Verified checkout now records each seller's gross amount, shipping allocation, platform fee, refund exposure, and transferable balance.
- Added idempotent Stripe Connect transfer creation, pending-transfer reconciliation, manual connected-account payout creation, and durable transfer/payout lifecycle updates. Transfer reversals move the settlement to `OUT_OF_BALANCE`; payout events include created, paid, failed, canceled, and updated mappings with paid-state protection against stale events.
- Added seller statement totals and settlement rows to the existing artist settlement API and portal. Refunds update the seller settlement ledger when scoped to a seller order.
- Added focused transfer, payout, reversal, settlement, and finalization tests. Strict type-check, zero-warning ESLint, full Vitest suite (233 passing, 7 explicitly skipped database tests), Prisma generation, schema validation, and the 67-route production build passed. Live Stripe Connect execution and migration application still require provider/database credentials.

### 2026-08-25 Money and checkout hardening slice

- Replaced authoritative product, order, seller-order, and order-item `Float` money columns with integer INR paise and added forward migration `20260825150000_money_minor_units`; product/listing write boundaries convert rupee form input once, while checkout, tax, promotion, fee, refund, Stripe line-item, and inventory calculations remain integer-only.
- The money migration also converts legacy pending checkout quote snapshots from rupees to paise so pre-migration sessions do not mix units with the new payment reader.
- Added durable `PaymentReconciliation` records and admin inspection at `/api/admin/payments/reconciliation`, covering captured amount, seller allocation, tax, discount, platform fee, refunds, currency, and balance status. Successful checkout and refund paths update the reconciliation record transactionally.
- Added serialized Stripe webhook finalization with retry on PostgreSQL serialization conflicts, Stripe amount/currency verification, concurrent idempotency-row race handling, and tests for duplicate/concurrent checkout attempts, tampered Stripe amounts, duplicate events, refund reconciliation, and the database last-item concurrency path.
- Verification completed with a disposable PostgreSQL 16 container: strict type-check, zero-warning lint, Prisma schema validation, full Vitest suite (231 passing, including all 24 database-backed integration tests), and production build. Live Stripe execution remains unverified because no test-mode provider credentials or Stripe CLI are available in this environment.

### 2026-08-25 Artist onboarding and provider-backed uploads

- Added additive `MediaAsset` ownership/state records and `ListingSubmission` records with an applied migration script; upload authorization is bound to the authenticated artist and media purpose.
- Added a provider abstraction with S3-compatible signed PUT/GET operations and a filesystem-backed local provider for development. Uploads are finalized only after provider confirmation and size verification; public artwork images and private digital files use separate delivery policies.
- Added artist media authorization, direct upload, completion, public media, submission create/list, admin submission review, and protected digital delivery resolution routes. The artist portal now has a complete file-upload submission form that creates an unpublished submitted listing without manual database intervention.
- Added schema/contract regression tests. Prisma generation/validation, strict type-check, zero-warning lint, and the full Vitest suite passed; live provider and PostgreSQL execution remain unverified in this environment.

### 2026-08-25 Quality and launch-readiness pack

- Added `docs/launch/` with accessibility/mobile audit criteria, Core Web Vitals and bundle budgets, analytics privacy decisions and event registry, external monitoring thresholds, support handling, incident rollback, and legal/policy sign-off checklists.
- Added dependency-aware `GET /api/health/live` and `GET /api/health/ready` endpoints for external uptime monitors. Readiness returns 503 when the database is unavailable; liveness does not depend on the database.
- Added unit coverage for both health endpoints and a repeatable `npm run launch:smoke` check for liveness, readiness, public route status, response sizes, the 200 kB public HTML smoke budget, and accidental analytics markers. Added a scheduled GitHub Actions production health monitor that checks liveness and readiness once `PRODUCTION_APP_URL` and failure notifications are configured. No analytics vendor or monitoring SDK is enabled until privacy, bundle-cost, deployment, and ownership decisions are approved.
- Replaced low-contrast `text-gray-300`/`text-gray-400` readable text utilities with `text-gray-500` and added a regression guard. Verification: strict type-check, zero-warning ESLint, full Vitest suite (229 passing, 7 skipped), Prisma validation, production build (59 generated pages/routes), local and production-artifact smoke checks, and browser responsive checks passed. Browser assistive-technology runs, production Core Web Vitals, monitor notification configuration, provider delivery, and counsel sign-off require deployment/account owners.
- Corrected the documented `--color-text-subtle` token and unused CSS muted token to `#6B7280`, added a source-level guard against the old failing values, and added a release checklist mapping every launch gate to its evidence and owner. The latest full quality gate passes with 229 tests and the 59-route production build.

The visible marketplace is transitioning from static/local demonstrations to REST-backed catalog, authentication, and account commerce state. Product and artist reads, artist published-listing reads, authentication, cart, wishlist, profile reads/updates, protected account page access, and artist-owned collection management now use typed or server-enforced access; checkout and several editorial surfaces remain prototype implementations. New artwork listings now require a medium and physical dimensions at the validation boundary while preserving legacy listing edit compatibility. Artist onboarding inputs now normalize profile text, restrict cover URLs to HTTP(S), and reject empty profile updates. Artist profile and artwork forms now preserve structured API validation fields for visible retry guidance. Homepage promotional copy now describes factual catalog/editorial destinations rather than unsupported rankings or personalization. Product, artist, and published story detail pages now expose structured data from persisted catalog/profile/editorial fields. Verified artist badges now link to a factual explanation of identity/background review. Search filters now expose only persisted API categories and use server pagination/totals for every selectable filter combination. An opt-in PostgreSQL identity-boundary integration suite now covers cart, wishlist, follow, review, product-owner, and order isolation invariants, but live database execution remains pending a configured test database.

### 2026-08-25 Remaining prototype surfaces slice

- Homepage carousel, hero imagery, category imagery, and merchandising sections now derive available artwork, artist, collection, and story media from the existing REST-backed queries; loading, partial-error, and empty catalog states are explicit instead of silently presenting static fallback artwork.
- Added a REST-backed Stories index at `/stories`, corrected the story breadcrumb destination, and replaced seeded placeholder article bodies with complete editorial copy.
- Artist overview and analytics cards now derive published artwork, inventory, incoming orders, review average/count, follower count, and gross order value from the existing persisted queries; fabricated dashboard values are no longer part of the active artist experience.
- Strict type-check and zero-warning ESLint passed after the slice. The desktop shell returned no observable Vitest or Next build output after process startup, so those gates are not claimed from this run.

## Phase Progress

| Phase | Status | Evidence | Next milestone |
|---|---|---|---|
| Phase 0 — Baseline and delivery safety | Complete | Strict type-check, zero-warning lint, six tests, production build, CI workflow, validated migration, repeatable seed, environment validation, structured logging, and zero audited vulnerabilities | Maintain quality gates while completing Phase 1 |
| Phase 1 — Unify frontend and backend | In progress | Added typed API client and DTOs; product, artist, story, and collection catalog reads with CUID route-boundary validation, authentication, persistent cart and wishlist mutations, identity-scoped cart/wishlist/order/follow query caches, profile reads/updates, protected account access, artist workspace access, admin route policy and moderation UI, navbar product/artist suggestions, collection membership reads, and artist-detail follow state now use REST or server-enforced access; remaining catalog pages no longer import `src/data` records | Add database-backed identity coverage and continue replacing non-catalog static surfaces |
| Phase 2 — Catalog and artist onboarding | In progress | Persisted artist profile editing and owner-scoped artwork actions now coexist with provider-backed signed uploads, owner-scoped ready media, protected digital-file references, transactional listing submissions, and admin review decisions; the portal can submit a complete unpublished listing without database intervention | Add broader moderation/evidence UX and live provider verification |
| Phase 3 — Cart, checkout, and payments | In progress | Persistent cart operations use authenticated REST; authoritative money is integer INR paise; checkout quotes validate current inventory and integer totals; Stripe Checkout sessions use database uniqueness plus provider idempotency; successful verified webhooks validate Stripe amount/currency, run serializable finalization, create seller allocations and durable payment reconciliation, guard inventory, clear the cart, and link the payment; admin refunds are durable/idempotent and refund events update reconciliation; the disposable PostgreSQL integration suite passes all 24 tests | Run live Stripe test-mode verification |
| Phase 4 — Fulfillment, payouts, post-purchase | In progress | Artist portal reads persisted incoming order items scoped to the authenticated artist and can advance per-item fulfillment status; seller-order, shipment/event, refund, platform-fee, payout, Stripe Connect account, seller settlement, and transfer records now exist; verified payment finalization creates seller settlement rows and attempts idempotent Connect transfers; pending transfers can be retried through the protected reconciliation route; payout creation validates the available seller balance; transfer reversals and payout lifecycle events update durable state; artist statements expose gross, fees, refunds, net, transferred, outstanding, and provider identifiers; digital delivery, disputes, refunds, and late-order handling remain active | Run live Stripe Connect test-mode verification and apply the forward migration |
| Phase 5 — Trust and operations | In progress | Review creation requires a delivered purchase, excludes listing owners, and persists the eligible order-item link; user reports, admin resolution, owner appeals, append-only moderation events, an admin moderation queue, and durable artist verification review now exist | Add evidence-provider storage/retention policy and broader operational review tooling |
| Phase 6 — Discovery and quality | In progress | Search/filter UI, responsive pages, and Next Image exist; source-level accessibility coverage, mobile criteria, and performance budgets are documented; health checks provide an external-monitor target; analytics remains disabled pending privacy approval | Run the deployed browser matrix and measured CWV budget report |
| Phase 7 — Controlled launch | In progress | Launch pack now includes support, monitoring, rollback, analytics privacy, and legal/policy gates; external monitor setup, live provider verification, browser runs, and counsel approval remain explicit release gates | Complete owner sign-offs and controlled pilot rehearsal |

## Capability Matrix

| Capability | Status | Current condition |
|---|---|---|
| Home merchandising | Prototype | Polished static content |
| Search and filters | In progress | Search page and navbar product suggestions read products through REST catalog queries; search now exposes a retryable error state distinct from empty results; text searches now execute server-side across artwork titles, descriptions, and artist names; search URLs now preserve query, selected filters, sort, and page across refresh and sharing; typed pagination metadata drives server-backed page requests and truthful counts; repeated category, price-range, and rating filters are applied before pagination; every selectable art type maps to the persisted API taxonomy |
| Product detail | In progress | Product detail, creator avatar, persisted artwork image gallery and metadata, artist-scoped related artwork, and review list/summary read REST data; product and review not-found/error states remain distinct with retry actions; related artwork now has explicit loading, retryable-error, and empty states; review sorting is functional; unsupported size variants, shipping/returns promises, generic specifications, fulfillment copy, and fabricated artist credentials were removed |
| Artist profiles | In progress | Artist index, profile, and artist artwork reads use REST data with explicit loading, retryable-error, and empty states; artist index search has a persistent label; artist detail now distinguishes not-found from retryable API failures; follower/artwork counts and verification status are persisted, and artist-detail plus artist-index follow status/mutations now use the existing Follow model; artist-level review aggregates and some profile content remain static |
| Artist onboarding and uploads | In progress | Artist portal upload form authorizes signed provider operations, finalizes owner-scoped ready media, requires protected digital files for digital listings, and submits an inactive listing plus durable review status; admin review APIs can move submissions through review and approval; live provider/database execution and broader review UX remain |
| Collections | In progress | Published editorial collection metadata and ordered membership are persisted in Prisma, seeded deterministically, exposed through `/api/collections` and `/api/collections/[id]`, and consumed by the collections index, detail page, and homepage; collection detail pages now emit persisted dynamic metadata and CollectionPage/ItemList structured data; authenticated artists can now create, edit, and archive unpublished owner-scoped collections containing only their active artworks; moderation publishing and provider-backed media remain future work |
| Stories | In progress | Public Story list/detail routes read published records from Prisma; story detail now distinguishes not-found from retryable API failures; homepage and detail pages use string IDs and API content; story index and editorial authoring remain |
| Registration and login | In progress | Visible form calls server registration/login routes and now supports native Enter-to-submit behavior; registration and login emails are normalized before persistence and lookup; authentication responses now set an HTTP-only session cookie without returning the signed JWT; profile reads and updates now persist through `/api/users/[id]`; protected account and artist pages now redirect through the request proxy |
| Session and route protection | In progress | Cookie/JWT session is used by API calls and current-user query; `/profile`, `/cart`, `/wishlist`, `/tracking`, `/artist-portal`, the `/admin` moderation queue, and artist follow status/mutations are proxy-protected, review mutations are protected while public review reads remain open, artist and administrator role checks are enforced in both route policy and artist-only header navigation, and logout removes identity-sensitive caches; database-backed identity tests and broader admin operations remain |
| User profile | In progress | Authenticated profile reads, updates, and order history use the server session; email is explicitly non-editable because the update contract excludes email; profile tabs now persist in the existing URL and restore shared account links; order detail is available from the tracking surface and cancellation now requires explicit confirmation |
| Wishlist | In progress | Authenticated list, add, remove, product-card toggles, navbar indicator, account tab, and sign-in states use REST and React Query; product-card wishlist failures now remain visible with retry-by-action feedback; cache keys are scoped by authenticated user; database-backed identity-isolation coverage remains |
| Cart | In progress | Authenticated list, add, quantity update, remove, clear, product-detail add, navbar count, stock checks, and sign-in states use REST and React Query; checkout collects a labeled delivery address, applies an authoritative server quote for promo codes, starts the server-backed Stripe session, and preserves retryable errors |
| Checkout | In progress | Protected quote and `/api/checkout/session` provide current totals plus an idempotent Stripe-hosted session; the verified webhook creates the order from the durable quote, groups seller orders, guards inventory, clears the cart, and the return page directs buyers to persisted orders |
| Stripe payment | In progress | Stripe SDK, durable checkout/payment/event/reconciliation records, integer-minor Stripe amounts, database/provider idempotency, serializable finalization retry, metadata and raw-body signature verification, Stripe amount/currency matching, inventory decrement, cart clearing, payment linking, expiry handling, admin refunds, and refund webhook reconciliation exist; live Stripe/database execution remains |
| Stripe Connect | In progress | Durable Stripe account, seller settlement, and transfer records; owner-scoped Express onboarding; idempotent transfer and connected-account payout creation; signature-verified account, transfer, reversal, and payout event mapping; pending transfer reconciliation; live execution remains |
| Orders | In progress | Order creation is restricted to verified checkout webhooks; order detail distinguishes not-found from retryable API failures; cancellation claims state atomically, paid-order cancellation is blocked, and seller-order grouping is persisted |
| Inventory | In progress | Checkout uses guarded transactional decrements and cancellation uses a guarded state transition before stock restoration; seller fulfillment now tracks per-item status; payment-backed reservation and broader concurrency integration coverage remain |
| Shipping and tracking | In progress | Tracking reads an authenticated order by `orderId`, renders persisted items/status/totals, distinguishes unavailable order data from a missing order, uses a real email support destination, and calls the existing cancellation API; dangerous cancellation now requires a consequence-focused confirmation; owner-scoped shipment updates, HMAC-verified provider callbacks, duplicate suppression, append-only shipment events, and durable delivery records now persist; digital-delivery and dispute routes are available for the authenticated buyer |
| Refunds and disputes | In progress | Admin-only idempotent Stripe refunds persist pending/succeeded/failed state, support seller-order-scoped partial refund input, mark fully refunded orders, and restore stock only before fulfillment; signed Stripe refund-created/refund-updated events now reconcile durable refund/payment/order state and guard stock restoration; buyer dispute cases, admin review/resolution routes, and dispute delivery records now persist |
| Reviews | In progress | Product-detail review list, sorting, summary, authenticated submission form, and artist-portal review read use REST; server creation requires a delivered order item, excludes the listing owner, rejects duplicate buyer/product submissions, persists the eligible order-item link, and exposes a factual verified flag; review moderation remains |
| Artist portal | In progress | Published artwork table/grid, profile settings, owner-scoped artwork create/edit/archive controls, owner-scoped collection create/edit/archive controls, owner-scoped incoming order reads, forward-only per-item fulfillment updates, and artist-scoped review reads use authenticated REST; the selected workspace section persists in the URL; listing descriptions, persisted artwork facts, and up to 10 persisted image URLs round-trip through the product DTO and edit form; collection forms select only the artist’s active artwork and keep new collections unpublished; structured validation errors are announced with readable field labels; shipment-provider events, review moderation, analytics, and provider-backed media uploads remain unavailable |
| Artwork uploads | In progress | Product listing media inputs now enforce HTTP(S) URLs and a maximum of 10 images; signed provider uploads and durable media ownership remain unavailable |
| Artist verification | In progress | Durable verification status/evidence and admin decisions synchronize the existing public boolean; owner submission and admin queue exist, while provider-backed evidence storage, retention, and richer audit history remain |
| Listing moderation | In progress | Authenticated users can report active artwork or published collections from their detail pages; admins can list, dismiss, or resolve cases, with transactional artwork deactivation or collection unpublishing; affected owners can submit one appeal and approved appeals restore the target |
| Admin operations | In progress | Admin role, protected report/appeal APIs, and the `/admin` moderation queue now support filtered report and appeal review with explicit dismiss/resolve and reject/restore decisions; broader admin UI and operations remain |
| Email notifications | In progress | Durable in-app notifications and email-delivery records now cover payment, fulfillment, delivery, cancellation, refund, and payout events; `EMAIL_WEBHOOK_URL` sends queued messages through the configured provider, while live provider delivery remains unverified |
| Legal and policy content | In progress | Public support, shipping, privacy, terms, artist, commission, partnership, press, and contact pages now contain page-specific truthful pre-launch guidance; `docs/launch/legal-policy-review.md` records the final counsel/business-owner gate |
| Automated tests | In progress | Full Vitest gates pass 231 tests with the disposable PostgreSQL suite enabled. Coverage includes integer-minor money adapters/calculation fixtures, concurrent idempotency-row races, Stripe amount tampering, payment reconciliation, duplicate/out-of-order events, refunds, and the database concurrent last-item claim test; live provider execution remains open |
| CI/CD quality gates | In progress | GitHub Actions workflow now provisions an isolated PostgreSQL 16 service, deploys Prisma migrations, and enables the opt-in identity suite before install/type-check/lint/test/build gates; first hosted run remains to be observed |
| Observability | In progress | API request IDs and structured completion/failure logs exist; additive liveness/readiness health routes and alert thresholds are documented; external monitor configuration remains deployment work |
| Accessibility | In progress | Existing source-level coverage is supplemented by `docs/launch/accessibility-mobile-audit.md`, which defines the 320/390/768/1024/1280px keyboard, screen-reader, contrast, reflow, zoom, and touch matrix; deployed manual/browser verification remains open |
| SEO | In progress | Root metadata plus dynamic product, artist, published-story, and collection titles, descriptions, canonical URLs, and Open Graph images now use persisted fields; site-level WebSite/SearchAction, Product/Person/Article/CollectionPage JSON-LD, a dynamic persisted-content sitemap, and crawler rules for private/operational routes are present; broader structured-data coverage and SEO verification remain |

## Confirmed Technical Risks

| Risk | Severity | Tracking status |
|---|---|---|
| Mock UI and database API use incompatible ID and data models | Critical | Open |
| Checkout represents success without payment or order creation | Critical | Mitigated: direct order creation is retired and order creation occurs only during successful verified webhook processing; live provider/database execution remains open |
| Build suppresses TypeScript failures | Critical | Resolved in Phase 0 |
| Predictable JWT fallback secret | Critical | Resolved in Phase 0; production configuration is required |
| JWT also returned to browser response JSON | High | Resolved in Phase 1; login and registration set the HTTP-only cookie without returning the signed token, with route regression coverage |
| Money stored as floating-point values | High | Mitigated for authoritative currency amounts: product/order/seller-order/order-item money is integer INR paise; dimensions and ratings remain Float by design; live migration application remains unverified |
| Inventory can oversell under concurrency | High | Guarded decrement plus serializable payment finalization and PostgreSQL concurrent last-item test pass against the disposable database |
| Reviews do not require purchase eligibility | High | Resolved for delivered-purchase/self-review checks and durable Review-to-OrderItem linkage; moderation remains open |
| Seller fees, settlement, and payout ledger absent | High | Mitigated in application code: integer platform-fee allocation, seller settlement ledger, idempotent transfer records, payout records, reversal handling, statement totals, and provider event reconciliation now exist; live provider execution and migration deployment remain open |
| Artist verification has no defined evidence or workflow | High | Mitigated by durable status/evidence and admin decisions; provider-backed storage and policy remain |
| Placeholder legal and shipping content | High | Open |
| Mobile category navigation clips the first item | Medium | Resolved in the current Navbar layout; mobile uses left-aligned overflow scrolling and the first category remains reachable |
| Product page uses generic print specifications for unrelated artwork types | Medium | Resolved on the current detail surface; unsupported specification, shipping, fulfillment, and artist-credential copy was removed, while structured artwork metadata remains pending |
| External font dependency fails in restricted/offline conditions | Medium | Mitigated: remote Inter and General Sans faces now use optional loading with the existing system fallbacks; self-hosted production fonts remain open |

## Verification Record

### 2026-08-25 Artist-owned collections slice

- Added owner-scoped artist collection list, create, edit, and archive service operations and `/api/artist/collections` plus `/api/artist/collections/[id]` routes; collection mutations validate owner identity, reject duplicate or foreign/inactive artwork IDs, and keep new collections unpublished.

### 2026-08-25 Fulfillment completion slice

- Added buyer tracking interactions for signed digital downloads, delivery history, and issue submission; added artist order controls for digital asset publishing and processing-deadline/late-state visibility.
- Added an administrator dispute queue with under-review, resolve, and reject actions, plus an authenticated reconciliation endpoint for expiring digital deliveries and marking late seller orders.
- Tightened cancellation to the pre-shipment `PROCESSING`/`CONFIRMED` states and added coverage for shipment-stage rejection.
- Verified with strict type-check, zero-warning ESLint, Prisma validation, the full Vitest suite (220 passing tests, 6 opt-in database tests skipped), and the 54-route production build.
- Live PostgreSQL execution, production asset-provider configuration, and invoking the reconciliation endpoint from a deployment scheduler remain deployment tasks.

### 2026-08-25 Fulfillment and post-purchase slice

- Added durable digital delivery records with artist-owned publishing, buyer-scoped access, expiry, download limits, and mandatory license acceptance.
- Added processing deadline fields to listings and seller orders, late-order marking, append-only delivery records for payment confirmation, shipment changes, cancellation, digital availability/download, and dispute activity.
- Added buyer dispute creation/listing, administrator review/resolution, and seller-order-scoped partial refund input.
- Verified with `npm run type-check`, zero-warning ESLint, the full Vitest suite (216 passing tests, 6 opt-in database tests skipped because no test database is configured), Prisma validation, and the production build.
- Added typed client adapters, React Query invalidation, and an artist-portal Collections workspace that reuses the existing product feed, supports retry/empty/error states, confirms archive actions, and preserves the existing navigation and design system.
- Added validator, route, service, portal-tab, and accessibility contract coverage. Focused collection tests passed (36 tests including shared validator/accessibility coverage) with strict type-check. Full verification passed: zero-warning ESLint, full Vitest suite (206 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 51-route production build.
- Live PostgreSQL execution, provider-backed media uploads, and production scheduling/monitoring remain unverified/open.

### 2026-08-25 Post-purchase touch-target slice

- Raised the existing cart and tracking “Continue Shopping” links to the documented 44px minimum touch target without changing destinations or layout structure.
- Added source-contract coverage for both links. Focused accessibility tests passed (5 tests) with strict type-check. Full verification passed: zero-warning ESLint, full Vitest suite (197 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 50-route production build.

### 2026-08-25 Collection SEO completeness slice

- Added persisted collection metadata loading with truthful title, description, canonical URL, and Open Graph image values.
- Added CollectionPage/ItemList JSON-LD using the persisted collection name, description, cover image, and artwork count; database failures remain non-blocking to page rendering.
- Added SEO builder coverage. Focused SEO tests passed (9 tests) with strict type-check. Full verification passed: zero-warning ESLint, full Vitest suite (196 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 50-route production build.

### 2026-08-25 Authoritative promo quote UI slice

- Connected the existing authenticated checkout quote endpoint to the cart with a labeled promo-code input, server validation feedback, applied-code status, and authoritative subtotal, discount, tax, shipping, and total display.
- Checkout forwards only the normalized server-accepted promo code; no client-side discount calculation was introduced and no payment, route, schema, or API contract changed.
- Added checkout API adapter coverage. Focused quote tests passed (2 tests) with strict type-check. Full verification passed: zero-warning ESLint, full Vitest suite (195 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 50-route production build.

### 2026-08-25 Order-cancellation confirmation slice

- Added an explicit confirmation state to the authenticated tracking page before a buyer can cancel an eligible order; the confirmation explains that reserved stock is released and the action cannot be undone.
- Preserved the existing cancellation API, server-side payment guard, concurrency claim, inventory restoration, route, and visual system.
- Added accessibility source-contract coverage for the confirmation group and consequence text.
- Focused order/accessibility tests passed (10 tests), followed by strict type-check, zero-warning ESLint, full Vitest suite (194 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 50-route production build.
- Live PostgreSQL and provider execution remain unverified in the current environment.

### 2026-08-25 Server-authoritative filter slice

- Removed legacy art-type options that have no persisted Prisma/API category, so selectable search filters cannot trigger the old local 50-item fallback.
- Search now always requests the selected page with the server’s `total` and `totalPages` metadata; the client no longer re-filters or locally paginates partial server results.
- Added taxonomy coverage proving every selectable art type maps to an API category. No schema, route, API response, navigation, or shared component contract changed.
- Focused taxonomy/search tests passed (8 tests), followed by strict type-check, zero-warning ESLint, full Vitest suite (193 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 50-route production build.
- Live PostgreSQL execution remains unverified because no configured test database, local PostgreSQL service, or usable Docker daemon is available in the current environment.

### 2026-08-25 Accessibility and responsive controls slice

- Updated existing artist-portal navigation, logout, mobile menu, profile tabs, profile inputs, order-tracking links, and search sorting controls with explicit keyboard focus treatment and documented 44px touch targets.
- Changed the profile name fields to stack at narrow widths and marked decorative navigation SVGs as hidden from assistive technology; added a global reduced-motion fallback for the existing animation and transition classes.
- Added source-contract regression coverage for the responsive profile layout, artist-portal control sizing/focus behavior, and reduced-motion fallback.
- Strict type-check, zero-warning ESLint, full Vitest suite (192 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 50-route production build passed with temporary non-secret verification environment values.
- Live PostgreSQL execution remains unverified because no configured test database, local PostgreSQL service, or usable Docker daemon is available in the current environment.

### 2026-08-25 Multi-select server filter parity slice

- Extended the product query boundary with additive repeated `category`, `priceRange`, and `minRating` parameters while preserving existing single-value query parameters.
- Product reads now apply category OR filters, price-range OR filters, and selected rating thresholds before ordering and pagination, so totals and page contents remain truthful for supported multi-select filters.
- Search now sends supported selected filters through the REST query and uses server pagination; unsupported legacy art labels retain the existing local fallback instead of being mapped to false catalog categories.
- Product-service regression coverage passed for repeated filters and rating eligibility. Strict type-check, zero-warning ESLint, full Vitest suite (189 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 50-route production build passed with temporary non-secret verification environment values.
- Live PostgreSQL execution remains unverified because no configured test database, local PostgreSQL service, or usable Docker daemon is available in the current environment.

### 2026-08-25 Server-backed search pagination slice

- Added a typed paginated API-client path that preserves the existing array-based product adapter for unrelated consumers while exposing total/page metadata to search.
- Search now sends the selected page to the REST catalog for single-value filter combinations, renders the server-reported total, and avoids slicing a partial first page as if it were the complete catalog.
- Multi-select filters continue using the existing local fallback until the REST query contract is expanded to represent repeated categories and price ranges; no route or database contract was changed in this slice.
- Focused API/search-adapter tests passed (19 tests), followed by strict type-check, zero-warning ESLint, full Vitest suite (188 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 50-route production build with temporary non-secret verification environment values.
- Live PostgreSQL execution remains unverified because no configured test database, local PostgreSQL service, or usable Docker daemon is available in the current environment.

### 2026-08-25 Refund webhook reconciliation slice

- Stripe `refund.created` and `refund.updated` events are now accepted by the existing signature-verified checkout webhook and reconciled through the durable refund record using the internal refund reference carried in Stripe metadata.
- Successful refund events update refund status, mark the payment and order fully refunded when captured amounts are exhausted, and restore inventory only when each unfulfilled order item is atomically claimed for cancellation; pending, failed, cancelled, duplicate, and unknown-refund paths remain non-destructive.
- Refund creation now includes the durable internal refund and order references in the Stripe request metadata while preserving the existing admin route and idempotency contract.
- Focused refund/payment tests passed (11 tests), followed by strict type-check, zero-warning ESLint, full Vitest suite (184 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation with a temporary non-secret `DATABASE_URL`, and the 49-route production build with temporary non-secret verification environment values.
- Live Stripe delivery and PostgreSQL execution remain unverified because no provider credentials or configured database are available in the current environment.

### 2026-08-25 Platform-fee allocation slice

- Verified payment finalization now creates one server-calculated `PlatformFee` record per seller order from the artwork subtotal, using configurable `PLATFORM_FEE_BASIS_POINTS` with a documented 10% foundation default.
- The fee record is written in the same transaction as the order, seller-order grouping, inventory guard, cart clear, and payment link; invalid fee configuration aborts finalization rather than producing an untracked settlement.
- No Stripe transfer call or schema change was introduced: the existing model still lacks a durable seller-transfer identifier and an approved charge/transfer policy is required before that boundary can be implemented safely.
- Focused Connect/payment tests passed (12 tests), followed by strict type-check, zero-warning ESLint, full Vitest suite (184 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 49-route production build with temporary non-secret verification environment values.
- Live Stripe Connect transfers and PostgreSQL execution remain unverified.

### 2026-08-25 Artist settlement read slice

- Added protected `GET /api/artist/settlements`, owner-scoped through the authenticated artist profile, returning mapped seller-order allocation records and connected-account payout lifecycle records in minor currency units.
- Added an additive settlement section to the existing artist workspace overview with loading, retryable-error, empty, and factual allocation/payout states; it does not claim that a transfer or payout exists when no durable record exists.
- Added service mapping coverage for gross artwork amount, shipping allocation, platform fee, net allocation, payout status, and payout timestamps; no schema, existing route, navigation, or shared component API changed.
- Strict type-check, zero-warning ESLint, full Vitest suite (186 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 50-route production build passed with temporary non-secret verification environment values.
- Live PostgreSQL and Stripe Connect transfer execution remain unverified; durable transfer identifiers and an approved charge/transfer policy are still required.

### 2026-08-25 Seller-order and refund foundation slice

- Retired `POST /api/orders` direct cart-to-order creation; authenticated buyers now receive a conflict directing them to the verified checkout session flow while `GET /api/orders` remains unchanged.
- Added seller-order grouping during verified payment finalization, with one seller order per artist and immutable order-item connections.
- Added additive Prisma models and migration for seller orders, shipments/events, refunds, platform fees, and payouts, plus the optional order-item seller-order link.
- Added an admin-only idempotent refund route and service backed by Stripe refund idempotency, durable refund status, full-refund order/payment transitions, and pre-fulfillment stock restoration.
- Strict type-check, zero-warning ESLint, full Vitest suite (168 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma schema validation, and the 47-route production build passed with temporary non-secret environment values.
- Live migration application, PostgreSQL integration execution, Stripe refunds, shipment-provider events, dispute handling, and Stripe Connect payouts remain unverified or incomplete.

### 2026-08-25 Owner-scoped shipment update slice

- Added `PATCH /api/artist/seller-orders/[id]/shipment` with artist/admin authorization, CUID validation, tracking fields, and forward-only shipment states.
- Shipment updates now upsert the durable shipment record, append a shipment event, and synchronize seller-order status in one transaction.
- Added route and service regression coverage. The full Vitest suite passes 172 tests with 6 explicitly skipped opt-in PostgreSQL tests, and the 47-route production build passes with temporary non-secret environment values.
- Provider-signed event ingestion and live PostgreSQL execution remain open.

### 2026-08-25 Stripe Connect onboarding foundation slice

- Added durable `StripeAccount` records and migration with explicit onboarding, active, restricted, and disabled states plus Stripe capability flags.
- Added owner-scoped `POST /api/artist/connect` to create or resume an Express account and return a Stripe onboarding link; payout enablement is not inferred from link creation.
- Added route and service coverage for artist authorization, account creation, persistence, and account reuse.
- Strict type-check, zero-warning ESLint, full Vitest suite (176 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 48-route production build passed with temporary non-secret environment values.
- Stripe account webhooks, live Connect execution, seller allocation, and payouts remain incomplete.

### 2026-08-25 Provider event synchronization slice

- Stripe `account.updated` events now map `details_submitted`, `charges_enabled`, `payouts_enabled`, and disabled requirements to durable Connect account states through the existing verified Stripe webhook.
- Added HMAC-verified `POST /api/webhooks/shipment` with strict payload validation, provider event-id duplicate suppression, forward-only shipment state handling, and append-only shipment events.
- Strict type-check, zero-warning ESLint, full Vitest suite (180 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 49-route production build passed with temporary non-secret environment values.
- Live provider delivery, Connect transfers, payout creation, and PostgreSQL execution remain unverified or incomplete.

### 2026-08-25 Connect payout event slice

- Stripe `payout.created`, `payout.paid`, and `payout.failed` events now resolve the connected artist and upsert durable `Payout` state with amount, currency, arrival, and paid timestamps.
- Added payout lifecycle regression coverage. Strict type-check, zero-warning ESLint, full Vitest suite (181 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 49-route production build passed with temporary non-secret environment values.
- Transfer creation, seller allocation/fees, live Connect execution, and PostgreSQL execution remain incomplete.

### 2026-08-25 Paid-order cancellation safety slice

- Order cancellation now reads the linked payment state and rejects successfully paid orders before claiming cancellation or restoring inventory; a refund workflow must own that transition later.
- Added regression coverage proving paid orders cannot be cancelled or have stock restored.
- Targeted cancellation tests, strict type-check, zero-warning ESLint, and the full Vitest suite (161 passing tests with 6 explicitly skipped opt-in PostgreSQL tests) passed.
- The legacy `POST /api/orders` direct checkout contract remains an open API-boundary risk until it is explicitly retired or redirected to the payment-backed flow.

### 2026-08-25 Payment-backed order finalization slice

- Added transactional Stripe success handling that creates an order from the persisted quote snapshot, atomically guards current stock, clears the buyer cart, and links the payment to the created order.
- Duplicate success events cannot create a second order after `Payment.orderId` is set; failed asynchronous payment events update payment state without creating an order.
- Connected the cart to the existing checkout-session API with delivery-address validation, async retryable feedback, and a Stripe return page that directs buyers to their persisted orders after webhook processing.
- Added five payment-finalization regression tests, including expired checkout and late out-of-order failure handling. Strict type-check, zero-warning ESLint, full Vitest suite (160 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 47-route production build passed with temporary non-secret environment values.
- Live PostgreSQL, Stripe webhook delivery, refunds, and seller allocation remain unverified or incomplete; expired sessions now transition to a failed checkout/payment state without creating an order.

### 2026-08-25 Durable verification and payment foundation slice

- Added durable artist verification records with owner submission, admin review decisions, public status mapping, and synchronization to the existing public badge field; evidence references are private to administrators.
- Added owner/admin verification APIs, artist settings submission UI, admin verification queue, and five focused route tests.
- Added Stripe Checkout Session integration with durable quote snapshots, per-user idempotency keys, payment/payment-event records, metadata reconciliation, raw-body signature verification, and duplicate-event protection; order creation, inventory reservation, refunds, and provider-backed evidence storage remain later slices.
- Added two focused checkout/webhook route tests. Strict type-check, zero-warning ESLint, Prisma schema validation, and Prisma client generation passed; the full suite/build is being run for this slice.
- Live PostgreSQL and live Stripe execution remain unverified because no configured database or provider credentials are available in the current environment.

### 2026-08-25 Admin moderation queue slice

- Added the protected `/admin` moderation queue using the existing report and appeal API contracts; administrators can filter open, dismissed, resolved, approved, and rejected records.
- Added explicit UI decisions for dismissing reports, resolving reports with the existing target-specific removal action, and approving or rejecting owner appeals; destructive decisions require confirmation and optional notes.
- Added typed admin API adapters and DTOs with loading, retryable-error, empty, and pending-action states; no database schema, API contract, or shared component API changed.
- Strict type-check, zero-warning ESLint, full Vitest suite (147 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation with a temporary non-secret `DATABASE_URL`, and the 43-route production build passed with temporary non-secret verification environment values.
- Live PostgreSQL integration execution remains unverified because no configured test database, local PostgreSQL service, or usable Docker daemon is available in the current environment.

### 2026-08-25 Marketplace reporting UI slice

- Added the shared `ReportForm` to product and collection detail pages, using the existing authenticated report route for reason selection, optional details, sign-in guidance, retryable errors, and durable success feedback.
- Updated the UI registry and added API adapter coverage; no schema, route contract, or moderation state transition changed.
- Strict type-check, zero-warning ESLint, focused report-adapter coverage, full Vitest suite (148 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation with a temporary non-secret `DATABASE_URL`, and the 43-route production build passed with temporary non-secret verification environment values.
- Live PostgreSQL integration execution remains unverified because no configured test database, local PostgreSQL service, or usable Docker daemon is available in the current environment.

### 2026-08-24 Persisted collections vertical slice

- Added persisted `Collection` and `CollectionItem` models with indexes, uniqueness, ownership boundary, and migration `20260824200000_collections`.
- Added deterministic editorial collection seed records and ordered product membership.
- Added public collection list/detail REST routes, DTOs, service reads, React Query hooks, and API mapping tests.
- Replaced collection page, collection detail, and homepage collection mock consumers with persisted REST-backed data; collection detail now renders actual ordered membership and active products.
- Prisma validation, strict type-check, zero-warning ESLint, full Vitest suite (132 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 36-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Control-state semantics slice

- Added `aria-pressed` state to authentication mode, account role, and artist-index filter controls so their selected state is exposed consistently with the existing visual state.
- Preserved existing form submission, authentication, filtering, routes, API contracts, and layout behavior.
- Strict type-check, zero-warning ESLint, full Vitest suite (127 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Local touch-target hardening slice

- Raised local retry, filter, logout, archive, and authentication mode-switch controls to the documented 44px minimum touch target without changing their behavior, routes, API contracts, or shared component APIs.
- Strict type-check, zero-warning ESLint, full Vitest suite (127 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Repository button-type semantics slice

- Added explicit `type="button"` to the remaining profile logout/tab, artist-portal logout, authentication mode-switch, and artist-filter controls.
- A repository-wide JSX scan now confirms every `<button>` element has an explicit type, preventing accidental form submission while preserving existing routes, APIs, layouts, and interaction behavior.
- Strict type-check, zero-warning ESLint, full Vitest suite (127 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Product-detail button semantics slice

- Added explicit `type="button"` to product-detail image thumbnails, wishlist, category, and quantity controls so these existing interactions cannot accidentally submit a surrounding form, and raised review star controls to the documented 44px minimum touch target.
- Preserved the existing product-detail layout, routes, API contracts, component props, and visual tokens.
- Strict type-check, zero-warning ESLint, full Vitest suite (127 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Homepage control semantics slice

- Added explicit button types and documented minimum touch-height classes to homepage category and editorial discovery controls without changing destinations, copy, or data flow.
- Confirmed the homepage’s product, artist, and story sections remain REST-backed; the only remaining `src/data` consumers are editorial collection metadata awaiting a persisted collection contract.
- Strict type-check, zero-warning ESLint, and the full Vitest suite passed (127 passing tests with 6 explicitly skipped opt-in PostgreSQL tests).

### 2026-08-24 CI database-test execution slice

- Updated `.github/workflows/ci.yml` to provision a health-checked PostgreSQL 16 service, use a dedicated `artistically_test` database for `DATABASE_URL` and `TEST_DATABASE_URL`, enable `RUN_DATABASE_TESTS=true`, and deploy migrations before the existing quality gate.
- Local validation passed for strict type-check, zero-warning ESLint, and the full Vitest suite (127 passing tests with 6 explicitly skipped opt-in PostgreSQL tests). The six database tests remain unexecuted locally because no PostgreSQL service is configured; hosted CI execution remains to be observed.

### 2026-08-24 Shared navigation touch-target slice

- Increased the interactive hit areas for accordion triggers, breadcrumb links/actions, and footer navigation links to the documented 44px minimum without changing their component APIs or destinations.
- Strict type-check, zero-warning ESLint, full Vitest suite (127 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Search and gallery touch-target slice

- Increased the hit areas for search filter, clear, and pagination controls and product-gallery carousel dots to the documented 44px minimum while preserving their visual glyph sizes and behavior.
- Added explicit button types to the affected non-submit controls.
- Strict type-check, zero-warning ESLint, full Vitest suite (127 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Role-aware marketplace navigation slice

- Reused the existing `isArtistRole` policy helper so the global header shows Sell/Artist Portal only to `ARTIST` and `ADMIN` sessions; collector accounts retain the existing marketplace navigation and server protection remains unchanged.
- Strict type-check, zero-warning ESLint, full Vitest suite (127 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Artist listing validation feedback slice

- Preserved the existing structured API field-error contract while formatting nested field keys into readable labels in the artist artwork form’s alert list.
- Strict type-check, zero-warning ESLint, full Vitest suite (127 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Artwork-type completeness boundary slice

- Added explicit rejection of edition size/number metadata on non-limited artwork.
- Re-applied inventory, fulfillment, and edition invariants inside the product domain service on both create and update paths, protecting callers that bypass the HTTP route parser.
- Added validator and domain-service regression coverage for non-limited edition metadata and digital/physical fulfillment mismatch.
- Strict type-check, zero-warning ESLint, full Vitest suite (127 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Site-level SEO structured-data slice

- Added factual `WebSite` JSON-LD to the root layout with a `SearchAction` targeting the existing `/search?q=...` contract; no unsupported organization, ranking, or commercial claims were added.
- Added unit coverage for URL normalization and search-action serialization.
- Targeted SEO tests (8 passing), strict type-check, zero-warning ESLint, full Vitest suite (125 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Navbar touch-target slice

- Updated existing account-menu links and the mobile category Collections link to use the documented 44px minimum touch target while preserving their routes, copy, and visual hierarchy.
- Strict type-check, zero-warning ESLint, full Vitest suite (124 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Global search mock-consumer slice

- Removed the unsupported static collection dataset from global search autocomplete; product and artist suggestions continue to use their existing REST-backed queries, and collection navigation remains available through its existing links.
- Remaining `src/data` consumers are limited to the collection listing/detail and homepage merchandising surfaces, pending a persisted collection contract.
- Strict type-check, zero-warning ESLint, full Vitest suite (124 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary non-secret verification environment values.

### 2026-08-24 Quality baseline and database-test environment audit

- Strict type-check, zero-warning ESLint, full Vitest suite (124 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation with temporary non-secret verification variables, and the 35-route production build passed.
- The database identity suite remains intentionally skipped because the current environment has no configured `DATABASE_URL` or `TEST_DATABASE_URL`, no local PostgreSQL service, and no usable Docker daemon. No database test result is claimed from this environment.

### 2026-08-24 Artwork listing completeness slice

- New artwork listings now require a non-empty medium; physical listings also require positive width and height values.
- Digital listings retain the existing digital-fulfillment rule, and the artist workspace marks medium and physical dimensions required in the browser.
- Product creation and explicit artwork-detail updates enforce the same completeness invariant in the domain service; ordinary edits to legacy listings remain compatible.
- Legacy persisted listings remain editable without a backfill or schema migration; completeness is enforced for new listing creation.
- Strict type-check, zero-warning ESLint, full Vitest suite (118 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Artist onboarding boundary slice

- Artist handles and biographies are trimmed before persistence; unsafe non-HTTP(S) cover URLs are rejected.
- Empty artist profile PATCH bodies are rejected while existing owner authorization and role-promotion transactions remain unchanged.
- Strict type-check, zero-warning ESLint, full Vitest suite (120 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Artist form validation feedback slice

- Artist profile and artwork forms now retain structured API field errors instead of showing only a generic save failure.
- Added API-client regression coverage proving validation fields survive the fetch boundary.
- Strict type-check, zero-warning ESLint, full Vitest suite (121 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Homepage trust-copy slice

- Replaced unsupported trending, handpicked, new-arrival, featured, and personalized claims with factual catalog and editorial wording.
- Preserved the existing carousel, layout, imagery, and navigation destinations.

### 2026-08-24 Artist structured-data slice

- Added `Person` JSON-LD to artist detail pages using persisted name, handle, biography, cover, and canonical route data.
- Normalized artist metadata handle display so persisted `@handle` values are not rendered with a duplicated prefix.
- Structured data remains supplemental and does not block artist page rendering when metadata reads fail.
- Strict type-check, zero-warning ESLint, full Vitest suite (123 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Verification explanation slice

- Verified artist badges on artist index and detail surfaces now link to a factual explanation: Artistically reviewed identity and background, without implying artwork authenticity, valuation, availability, or future conduct.
- Preserved the existing boolean verification model and visual badge treatment.

### 2026-08-24 Story structured-data slice

- Published story detail pages now emit `Article` JSON-LD from persisted title, excerpt, image, category, and route fields.
- Structured data remains supplemental and does not block story rendering when metadata reads fail.
- Strict type-check, zero-warning ESLint, full Vitest suite (124 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Cart stock control truthfulness slice

- Cart item mapping now preserves the stock returned by the existing cart API.
- Cart quantity controls cap increases at current stock, show available or no-longer-available state, and preserve removal for stale zero-stock items.
- Preserved server-side cart stock validation and existing mutation contracts; added stock mapping coverage.
- Strict type-check, zero-warning ESLint, full Vitest suite (115 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Product-card sold-state slice

- Product cards now show a factual `Sold` badge whenever persisted stock is zero, taking precedence over a listing badge while preserving catalog discoverability.
- No add-to-cart action or API contract was introduced on the card; product detail and server inventory guards remain authoritative.
- Strict type-check, zero-warning ESLint, full Vitest suite (115 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Artist workspace inventory truthfulness slice

- Shared the persisted-stock availability rule between public product cards and the artist workspace so zero-stock listings are labeled `Sold` instead of being presented as currently published inventory.
- Preserved active listing visibility, REST contracts, and archive behavior; added focused coverage for zero, negative, available, and unknown stock values.
- Strict type-check, zero-warning ESLint, full Vitest suite (117 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Artist profile and structural-boundary audit

- Re-audited the artist profile, workspace, and remaining `src/data` consumers against the build plan. Existing artist profile reads, follows, profile editing, and published artwork reads are REST-backed; seller orders, analytics, seller reviews, persisted collections, provider-backed media, verification workflow, moderation, and Stripe settlement still lack the durable contracts required to implement them truthfully.
- No API, route, schema, or navigation contract was changed in this audit. The ProductCard registry now documents the implemented factual sold state.
- The complete `npm run check` gate passed with temporary validation environment values: strict type-check, zero-warning ESLint, 117 passing tests with 6 explicitly skipped opt-in PostgreSQL tests, and the 35-route production build.

### 2026-08-24 Product update fulfillment invariant slice

- Product updates now merge persisted and incoming artwork details before enforcing digital/physical fulfillment compatibility, matching create-time validation.
- Added service regression coverage for both invalid update directions; existing ownership, pricing, inventory, and API contracts remain unchanged.
- Strict type-check, zero-warning ESLint, full Vitest suite (115 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Artist multi-image listing slice

- Extended the existing artist listing form from one image URL to multiple persisted image URLs with add/remove controls and a maximum of 10 images.
- Existing single-image listings load unchanged, and the first image remains the primary artwork image through the existing product service contract.
- Provider-backed signed uploads remain separate future work; this slice uses only the existing `ProductImage` REST/Prisma boundary.
- Strict type-check, zero-warning ESLint, full Vitest suite (113 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Product stock control truthfulness slice

- Product detail quantity controls now cap increases and submitted quantities at the persisted stock value.
- Zero-stock products show an explicit unavailable state and disable add-to-cart; products without a stock value retain the existing server-checkout availability message.
- Preserved the server-side stock guard and existing cart/API contracts.
- Strict type-check, zero-warning ESLint, full Vitest suite (113 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Product structured artwork metadata slice

- Product detail now renders the persisted description and populated artwork facts: type, medium, materials, dimensions, year, condition, framing, edition, authenticity, provenance, and fulfillment.
- Empty metadata fields are omitted, and no generic specifications or unsupported claims are introduced.
- Preserved the existing REST/DTO contracts and product-detail layout boundaries.
- Strict type-check, zero-warning ESLint, full Vitest suite (113 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Product gallery media truthfulness slice

- Product DTO mapping now preserves the complete persisted image URL list in the shared product model.
- Product detail’s primary carousel now uses listing media only; generic room imagery remains confined to the separately labeled approximate room-preview section.
- Added mapper regression coverage for multiple persisted product images without changing the REST response contract.
- Strict type-check, zero-warning ESLint, full Vitest suite (113 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Listing media validation slice

- Restricted product listing image inputs to HTTP(S) URLs and a maximum of 10 images through the shared server-side product validator.
- Added regression coverage for non-HTTP image schemes and excessive image counts while preserving the existing product API contract.
- This hardens listing media before provider integration; signed uploads, provider confirmation, and `MediaAsset` ownership remain future structural work.
- Strict type-check, zero-warning ESLint, full Vitest suite (113 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Artist artwork facts form slice

- Extended the existing artist listing form to edit persisted depth, condition, framing, authenticity, and provenance fields in addition to the already supported dimensions, medium, materials, year, and edition facts.
- Preserved the current `ArtworkDetails` API and Prisma model; the form submits only the existing schema-backed fields with their documented length and numeric constraints.
- Strict type-check, zero-warning ESLint, full Vitest suite (113 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Account tab URL state slice

- Connected the existing `/profile?tab=orders` and `/profile?tab=wishlist` destinations to the account page’s active tab state.
- Profile, Orders, and Wishlist tabs now support deep links, refresh persistence, safe fallback to Profile, and browser back/forward updates without changing the account route or API contracts.
- Added focused parser coverage in `tests/unit/profile-tabs.test.ts`.
- Strict type-check, zero-warning ESLint, full Vitest suite (113 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Artist listing description round-trip slice

- Added the existing persisted product description to the shared client `Product` model and product mapper.
- The artist listing form now loads and edits descriptions for existing artwork instead of exposing the field only during creation.
- Preserved the existing product API contract and deferred provider-backed uploads until the planned `MediaAsset` and signed-upload boundary exists.
- Strict type-check, zero-warning ESLint, full Vitest suite (111 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Artist portal navigation destination slice

- Repointed the existing artist portal sidebar items from nonexistent nested routes to the implemented `/artist-portal?tab=` sections.
- Preserved the sidebar labels, layout, and URL-backed tab behavior while making desktop and mobile navigation destinations real and active-state aware.
- Strict type-check, zero-warning ESLint, full Vitest suite (111 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Artist portal URL state slice

- Persisted the selected artist workspace section in the existing `/artist-portal?tab=` URL without changing routes, navigation structure, or tab semantics.
- Deep links restore supported sections, unsupported or missing values fall back to Overview, and browser back/forward updates the selected tab.
- Added focused unit coverage for supported and fallback tab parsing in `tests/unit/artist-portal-tabs.test.ts`.
- Strict type-check, zero-warning ESLint, full Vitest suite (111 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 New-listing completeness slice

- New product creation now requires `ArtworkDetails`, so active listings cannot be created without an explicit artwork type and fulfillment mode; legacy products without a details row remain readable and editable through the existing compatibility path.
- Added validator coverage for rejecting detail-less creation while preserving valid original, limited-edition, and digital listing inputs.
- Strict type-check, zero-warning lint, 109 passing Vitest tests with 4 explicitly skipped opt-in PostgreSQL tests, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Promo-code authority slice

- Checkout now trims and normalizes promo codes, rejects unknown codes before reading the cart or opening the transaction, and stores the normalized valid code in the order snapshot.
- Added regression coverage for invalid-code rejection and normalized `ART10` discount application. The existing hardcoded promo-code contract remains unchanged pending a future persisted promotion model.
- Strict type-check, zero-warning lint, 109 passing Vitest tests with 4 explicitly skipped opt-in PostgreSQL tests, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Artist listing invariant form alignment slice

- Updated the existing artist artwork form with limited-edition size and optional edition-number fields.
- Fulfillment choices now follow artwork type: digital artwork selects digital fulfillment, while physical artwork selects physical fulfillment; the form normalizes existing contradictory values before editing.
- Preserved the current portal layout, mutation adapters, and REST contracts. Type-check, zero-warning lint, 107 passing Vitest tests with 4 explicitly skipped opt-in PostgreSQL tests, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Atomic artist onboarding slice

- Artist profile creation and promotion of the user role to `ARTIST` now execute in one Prisma transaction, preventing a partial onboarding state if either write fails.
- Added route-level regression coverage proving the profile and role writes execute through the transaction callback and the upgraded session cookie is issued after the transaction succeeds.
- Strict type-check, zero-warning lint, 107 passing Vitest tests with 4 explicitly skipped opt-in PostgreSQL tests, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Review PATCH validation slice

- `UpdateReviewSchema` now rejects empty objects so review PATCH requests must change at least one editable field; rating and text validation remain unchanged.
- Added regression coverage for empty and valid partial review updates. The review route, authorization behavior, and public API shape are unchanged.
- Strict type-check, zero-warning lint, 106 passing Vitest tests with 4 explicitly skipped opt-in PostgreSQL tests, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Persisted inventory invariant slice

- Product updates now load persisted `ArtworkDetails` and validate merged stock/type/edition facts before mutation, preventing a PATCH from turning an original into multi-unit inventory or exceeding a limited edition's size.
- Added product-service regression coverage for a persisted original artwork stock violation. Existing product update and ownership contracts remain unchanged.
- Strict type-check, zero-warning lint, 104 passing Vitest tests with 4 explicitly skipped opt-in PostgreSQL tests, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Inventory truthfulness validation slice

- Extended product creation validation so original artwork cannot declare available stock above one and limited-edition stock cannot exceed the declared edition size.
- Added regression coverage for both invalid inventory declarations while preserving the existing Product and ArtworkDetails models and REST contracts.
- Strict type-check, zero-warning lint, 103 passing Vitest tests with 4 explicitly skipped opt-in PostgreSQL tests, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Artwork fulfillment and edition validation slice

- Extended `ArtworkDetailsSchema` so digital artwork requires digital fulfillment, physical artwork requires physical fulfillment, limited editions declare an edition size, and edition numbers cannot be supplied without a size.
- Added validator regression coverage for contradictory fulfillment modes, missing limited-edition size, missing edition size, and a valid digital listing.
- Preserved the existing `ArtworkDetails` model and product API contracts. Strict type-check, zero-warning lint, 103 passing Vitest tests with 4 explicitly skipped opt-in PostgreSQL tests, and the 35-route production build passed with temporary validation environment values.

### 2026-08-24 Partial product pricing invariant slice

- Enforced pricing truthfulness across partial product updates by merging PATCH input with the persisted price, original price, and discount before mutation. A discount cannot exist without an original price, and an original price must exceed the current price.
- Added service regression coverage for discount-only and original-price-only invalid updates. Existing create/update API contracts and schema remain unchanged.
- Strict type-check, zero-warning lint, 103 passing Vitest tests with 4 explicitly skipped opt-in PostgreSQL tests, and the 35-route production build passed with temporary validation environment values. The default build without required environment variables continues to fail at the intended production configuration guard.

### 2026-08-24 PostgreSQL identity mutation coverage slice

- Extended `tests/integration/database-identity.test.ts` with database-backed assertions that a different collector cannot delete another user's wishlist item and a non-owner cannot mutate an artist's product row through an owner-scoped update predicate.
- No schema, API, authorization contract, or production behavior changed; the existing opt-in safety gate remains required for execution against an isolated PostgreSQL database.
- Strict type-check and zero-warning lint passed. The targeted integration file was discovered and skipped as designed because `RUN_DATABASE_TESTS=true` and `TEST_DATABASE_URL` were not configured. The full Vitest suite passed with 101 tests and 4 explicitly skipped database tests; the production build generated 35 routes with temporary validation environment values.

### 2026-08-24 Catalog taxonomy consumer cleanup slice

- Replaced the global navbar's remaining legacy category import with `CATEGORY_LABELS` from `src/lib/catalog-taxonomy.ts`; category navigation and its existing search URL contract are unchanged.
- The remaining `src/data` catalog consumer is collection metadata used by the collections page, collection detail, homepage, and navbar search suggestions. It remains intentionally open because the repository has no persisted Collection model or collection API; replacing it requires an approved data/API contract change.
- Strict type-check and zero-warning lint passed. Targeted taxonomy/query tests passed (4 tests), and the full `npm run check` gates passed with 101 tests passing, 3 opt-in PostgreSQL tests skipped, and a 35-route production build passing with temporary validation environment values.

### 2026-08-24 Navbar accessibility slice

- Added labelled primary and category navigation landmarks, explicit button types, hidden decorative icons, and 44px touch targets for category, search, dropdown, and logout controls.
- Preserved authentication behavior, server-backed cart/wishlist counts, search autocomplete, category-filter URLs, and responsive overflow behavior.
- Updated the UI registry and verified with `npm run check`: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Catalog taxonomy ownership slice

- Moved homepage category labels and search filter labels/ranges out of the legacy `src/data` mock-data module and into `src/lib/catalog-taxonomy.ts`, which already owns the API category mapping.
- Preserved the existing category navigation, search URL contract, filter labels, and API query values; persisted collection metadata remains the documented outstanding catalog consumer.
- Added taxonomy ownership regression coverage. Strict type-check passed; complete lint, test, Prisma validation, and production-build verification is recorded after this slice.

### 2026-08-24 Artist profile editing slice

- Connected the artist portal Settings form to the existing authenticated user and artist profile PATCH routes.
- Artists can now persist first name, last name, handle, and biography from the workspace; email remains explicitly read-only because the existing update contract does not permit email changes.
- Added loading, success, and retry-visible error feedback while preserving the existing portal layout, tokens, controls, and route contracts.
- Added artist profile adapter and validator regression coverage. Full `npm run check` passed: strict type-check, zero-warning ESLint, 87 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build. Prisma validation had already passed for this continuation.

### 2026-08-24 Artist listing mutations slice

- Connected the artist portal to the existing artist-only product creation route and owner-checked product update/soft-delete routes.
- Artists can now add an artwork with title, price, stock, category, image URL, and optional metadata; edit persisted listing fields; and archive a listing after an explicit confirmation.
- Fixed the shared API client to accept successful HTTP 204 responses, preserving existing DELETE route contracts and making archive/cart deletion responses safe.
- Added product mutation adapter coverage, including create, update, archive, and 204 handling. Full `npm run check` passed: strict type-check, zero-warning ESLint, 90 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Product mutation authorization coverage slice

- Added route-level regression coverage for artist-only product mutations, owner-scoped update/archive calls, successful 204 archive responses, and non-disclosure of missing or non-owned products.
- Preserved the existing product route contracts and service ownership checks; no production API or schema change was required.
- Full `npm run check` passed: strict type-check, zero-warning ESLint, 95 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Artist profile route coverage slice

- Added route-level coverage for artist profile ownership authorization, valid profile persistence, malformed handle rejection, and missing-artist behavior.
- Preserved the existing artist profile PATCH contract and service boundary; no production route or schema change was required.
- Full `npm run check` passed: strict type-check, zero-warning ESLint, 99 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Product pricing truthfulness slice

- Added cross-field validation for new product listings: an original price must exceed the current price, and discount metadata requires an original price.
- Preserved partial update compatibility by applying the comparison check only when both editable values are supplied in an update request.
- Added regression coverage for misleading comparison pricing and discount metadata. Full `npm run check` passed: strict type-check, zero-warning ESLint, 100 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Artist portal tab accessibility slice

- Added explicit tab-to-panel relationships, roving focus, left/right keyboard navigation, and 44px tab targets to the artist workspace without changing its layout or navigation state model.
- Full `npm run check` passed: strict type-check, zero-warning ESLint, 100 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Art-specific catalog details slice

- Added a backward-compatible `ArtworkDetails` Prisma model and migration with artwork type, medium, materials, dimensions, year, condition, framing, edition, authenticity/provenance, and fulfillment fields.
- Extended product validation, DTO mapping, product create/update service persistence, and the artist listing form to carry category-aware artwork facts; existing products remain valid without a details row.
- Added validation coverage for edition bounds and category-aware detail defaults. `prisma validate`, strict type-check, zero-warning ESLint, 101 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build passed.

### 2026-08-24 Artist-card accessibility slice

- Marked artist avatars decorative and verification glyphs hidden from assistive technology while retaining the explicit “Verified artist” label and semantic artist link.
- Updated the UI registry and verified with `npm run check`: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Cart-item semantics slice

- Replaced clickable navigation buttons with semantic artwork links in `CartItem`.
- Added explicit button types and 44px touch targets for quantity and remove actions while preserving server-backed mutation hooks and retry feedback.
- Updated the UI registry and verified with `npm run check`: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Product-card truthfulness slice

- Product-card wishlist controls now explicitly use native button semantics and hide their decorative icon from assistive technology.
- Product-card badges now render the persisted badge value instead of hard-coding “Limited”; a later sold-state slice adds factual zero-stock presentation now that stock is exposed by the catalog DTO.
- Updated the UI registry and verified with `npm run check`: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Announcement truthfulness slice

- Replaced the unsupported “Summer Sale / Up to 40% off” campaign claim with a neutral artist-discovery announcement linked to the real artist index.
- Added persisted dismissal using `useSyncExternalStore` and `localStorage`, explicit button semantics, and a labelled decorative close icon.
- Updated the UI registry and verified with `npm run check`: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Footer navigation truthfulness slice

- Updated footer marketplace links to use the existing server-backed category-filter URL contract instead of free-text searches.
- Added labelled navigation landmarks for each footer section and replaced unsupported “worldwide” positioning copy with truthful pre-launch wording.
- Updated the UI registry and verified with `npm run check`: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Logo accessibility slice

- Preserved the existing accessible `Artistically home` link label and marked the decorative SVG as hidden and non-focusable for assistive technology.
- Updated the UI registry and verified with `npm run check`: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Section-header interaction slice

- Hardened `SectionHeader` link and callback actions to meet the documented 44px touch target; callback actions now explicitly use `type="button"` and decorative arrows are hidden from assistive technology.
- Preserved existing link/button branching, props, visual tokens, and section layout.
- Updated the UI registry and verified with `npm run check`: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Rating display/input semantics slice

- Hardened `RatingStars` so static ratings expose an accessible rating label while callback mode uses a labelled native button instead of a clickable non-semantic container.
- Clamped display values to the valid 0–5 range and assigned unique IDs to half-star gradients for repeated ratings on one page.
- Updated the UI registry and verified with `npm run check`: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Breadcrumb semantics slice

- Hardened `Breadcrumb` with labelled navigation, ordered-list semantics, current-page state, stable item keys, and explicit `type="button"` for callback items.
- Preserved the existing props, route destinations, visual classes, and breadcrumb layout.
- Updated the UI registry and verified with `npm run check`: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Accordion accessibility slice

- Hardened `AccordionItem` with `type="button"`, stable generated IDs, expanded/control state, a labelled region, and a decorative icon label.
- Made the disclosure icon transition motion-safe while preserving the existing public props and visual layout.
- Updated the UI registry and verified with `npm run check`: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Button primitive hardening slice

- Hardened `src/components/ui/Button.tsx` with ref forwarding, native button attribute support, and an optional accessible `loading` state that sets `aria-busy`, disables activation, and announces loading text.
- Preserved existing variants, sizes, default type, visual tokens, and all current consumers; updated the UI registry to record the completed contract.
- `npm run check` passed: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Carousel touch-target slice

- Increased homepage carousel dot, previous, next, and pause button hit areas to the documented 44px minimum while keeping the visual dots and icons compact.
- Preserved carousel data, auto-rotation, pause state, reduced-motion behavior, accessible names, and layout structure.
- `npm run check` passed: strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Category-filter navigation slice

- Category actions from the homepage and global navbar now clear free-text search and navigate through the existing shareable search-filter URL contract (`/search?type=...`).
- Centralized category-label normalization and API enum mapping in `src/lib/catalog-taxonomy.ts`; added regression tests for plural navigation labels and API values.
- Search filter state now remounts from the complete query string, so type-only navigation changes are reflected immediately even when the text query is unchanged.
- Preserved existing search controls, REST endpoints, routes, and visual structure.
- Targeted taxonomy/search tests passed (6 tests), followed by strict type-check, zero-warning ESLint, 83 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 REST-backed category imagery slice

- Removed the remaining static category-image and category-count maps from `src/data/index.ts`.
- Homepage category tiles now use the matching published product image returned by the REST catalog; categories without catalog imagery remain neutral placeholders instead of showing invented artwork.
- Preserved the existing category taxonomy, navigation, routes, API contracts, and page layout. Persisted collections remain the next structural catalog milestone.
- `npm run check` passed: strict type-check, zero-warning ESLint, 81 passing Vitest tests with 3 explicitly skipped opt-in database tests, and the 35-route production build.

### 2026-08-24 Quality-gate re-verification

- Re-ran the repository quality gates against the current worktree with temporary non-secret environment validation values.
- Strict type-check, zero-warning ESLint, 81 passing Vitest tests with 3 explicitly skipped opt-in database tests, Prisma validation, and the 35-route production build all passed.
- No application behavior or API/database contract changed in this verification-only pass; the next structural milestone remains persisted collections and collection membership.

### 2026-08-24 Unsupported-auth-action cleanup slice

- Replaced the login page’s non-functional "Forgot password?" button with a real support link to `/contact`; password recovery remains explicitly outside the current implementation rather than implying an available flow.
- `npm run type-check`, zero-warning ESLint, 81 passing Vitest tests with 3 explicitly skipped database tests, and the 35-route production build passed using temporary non-secret environment validation values.

### 2026-08-24 Artist portal dead-action cleanup slice

- Disabled unsupported Upload, Edit, Archive, Save, and Cancel controls in the artist portal and added an explicit read-only explanation for settings values.
- Preserved the existing portal layout, published-listing REST query, navigation, and future mutation boundaries; no seller API or schema was invented.
- `npm run type-check`, zero-warning ESLint, 81 passing Vitest tests with 3 explicitly skipped database tests, and the 35-route production build passed using temporary non-secret environment validation values.

### 2026-08-24 Artist follow feedback and badge-label slice

- Added visible retry-by-action feedback for artist-detail follow failures and explicit `Verified artist` accessible labels to artist index and detail badges.
- Preserved the existing follow API, query keys, mutation behavior, card navigation, and visual structure.
- `npm run type-check`, zero-warning ESLint, 81 passing Vitest tests with 3 explicitly skipped database tests, and the 35-route production build passed using temporary non-secret environment validation values.

### 2026-08-24 Tracking support-affordance slice

- Replaced the tracking page’s non-functional chat input with a real `mailto:` support link carrying the order ID in the subject; removed the dead local chat state and input.
- Preserved order tracking, cancellation behavior, layout, and API contracts.
- `npm run type-check`, zero-warning ESLint, 81 passing Vitest tests with 3 explicitly skipped database tests, and the 35-route production build passed using temporary non-secret environment validation values.

### 2026-08-24 Artist-index follow slice

- Added a separate accessible follow control beneath each REST-backed artist-index card, preserving the full-card artist link and avoiding nested interactive elements.
- Reused the existing authenticated follow-status query and POST/DELETE mutation, with sign-in redirect, pending label, pressed state, and visible mutation error feedback.
- `npm run type-check`, zero-warning ESLint, 81 passing Vitest tests with 3 explicitly skipped database tests, and the 35-route production build passed using temporary non-secret environment validation values.

### 2026-08-24 Review duplicate-guard slice

- Added a server-side duplicate check after delivered-purchase eligibility so one buyer cannot submit a second review for the same artwork; duplicate attempts return the existing 409 conflict envelope and do not create a row.
- Added regression coverage for the duplicate path while preserving the existing API contract and Prisma schema.
- `npm run type-check`, zero-warning ESLint, 81 passing Vitest tests with 3 explicitly skipped database tests, and the 35-route production build passed using temporary non-secret environment validation values.

### 2026-08-24 Product review submission slice

- Added the product-detail review form using the existing authenticated `POST /api/reviews` contract: sign-in prompt, 1–5 star selection, 10–1000-character validation, pending/error/success states, and post-submit review-cache invalidation.
- Preserved the server-side delivered-purchase and self-review eligibility checks; no database schema or API contract changed.
- `npm run type-check`, zero-warning ESLint, 80 passing Vitest tests with 3 explicitly skipped database tests, and the 35-route production build passed using temporary non-secret environment validation values.

### 2026-08-24 Collection trust-surface cleanup slice

- Removed unsupported curator names, curator portraits, and static artwork counts from collection cards, collection detail headers, homepage collection merchandising, and navbar collection suggestions.
- Collection routes, static collection IDs, visual structure, and existing client contracts remain unchanged; persisted collection membership is still pending the approved schema/API slice.
- `npm run type-check`, zero-warning ESLint, 80 passing Vitest tests with 3 explicitly skipped database tests, and the 35-route production build passed using temporary non-secret environment validation values.

### 2026-08-24 Accessibility type-scale and narrow-card slice

- Raised all explicit 9–11px interface text usages in the TSX surface to the documented 12px caption minimum across product cards, artist cards, search, navbar suggestions, authentication, collections, stories, homepage merchandising, and artist discovery.
- Made product-card price and comparison-price content wrap at narrow widths; enlarged the navbar cart-count target to preserve readable text.
- No explicit `text-[9px]`, `text-[10px]`, or `text-[11px]` classes remain in TSX. Existing responsive structure, routes, API contracts, and component props were preserved.
- `npm run type-check`, zero-warning ESLint, 80 passing Vitest tests with 3 explicitly skipped database tests, and the 35-route production build passed using temporary non-secret environment validation values.

### 2026-08-24 Policy and support content slice

- Replaced repeated "currently being updated" copy across public about, careers, contact, help, shipping, privacy, terms, artist-guidelines, commissions, partners, and press pages with page-specific, truthful pre-launch guidance.
- Removed footer social icons whose destinations were `#`; the footer now exposes only real internal navigation and the copyright notice.
- Preserved existing routes, layout classes, typography, and component contracts. Final legal and operational policy review remains required before launch.
- `npm run type-check`, zero-warning ESLint, 80 passing Vitest tests with 3 explicitly skipped database tests, and the 35-route production build passed using temporary non-secret environment validation values.

### 2026-08-24 Dynamic detail metadata slice

- Added server-side metadata loading for product, artist, and published-story detail routes using existing persisted fields and a small metadata read service.
- Added pure metadata builders with truthful fallbacks, description length limits, and Open Graph type/image mapping; client rendering and API contracts remain unchanged.
- Added 3 metadata regression tests. `npm run check` passed with 77 tests, 3 explicitly skipped database tests, zero-warning ESLint, strict type-check, and the 34-route production build.

### 2026-08-24 Canonical, structured data, and sitemap slice

- Added canonical URLs to product, artist, and story detail metadata and configured the root metadata base from `NEXT_PUBLIC_APP_URL`.
- Added truthful Product JSON-LD using persisted title, category, artist, INR price, image, and stock-backed availability; JSON-LD serialization escapes HTML-sensitive characters.
- Added a dynamic `/sitemap.xml` route for public static pages and active products, artists, and published stories. It falls back to static public routes during database outages and does not access PostgreSQL during builds.
- Four SEO builder tests passed, targeted lint passed, and the final production build passed with 34 static/dynamic application routes plus the dynamic sitemap route.

### 2026-08-24 Crawler policy slice

- Added `/robots.txt` metadata rules allowing public discovery, excluding API, account, artist-portal, admin, login, cart, wishlist, and tracking routes, and linking the dynamic sitemap.
- Added a regression test for the crawler policy. The route is static and does not require database access.
- Final `npm run check` passed with 79 tests, 3 explicitly skipped database tests, zero-warning ESLint, strict type-check, and the 35-route build including `/robots.txt` and dynamic `/sitemap.xml`.

### 2026-08-24 Private route metadata slice

- Added inherited `noindex, nofollow` metadata to collector account, authentication, and artist-portal route groups without changing route access or rendering behavior.
- Added a regression test covering all three private metadata boundaries.
- Final `npm run check` passed with 80 tests, 3 explicitly skipped database tests, zero-warning ESLint, strict type-check, and the 35-route production build.

### 2026-08-24 Artist portal trust-state cleanup slice

- Replaced fabricated seller revenue, sales, audience, review, order, analytics, and review content with explicit unavailable or empty states.
- Settings now starts from the authenticated user's persisted name and email, with unsupported bio and portfolio fields blank rather than populated with an invented artist identity.
- Preserved the existing portal layout and published-artwork REST query. `npm run check` passed with 80 tests, 3 explicitly skipped database tests, zero-warning ESLint, strict type-check, and the 35-route production build.

### 2026-08-24 Database identity integration suite slice

- Added `tests/integration/database-identity.test.ts` as an opt-in PostgreSQL suite using isolated artist and collector fixtures.
- The suite verifies user-scoped cart and wishlist reads, zero-row cross-user cart mutation guards, and owner-scoped order reads without changing API contracts or the Prisma schema.
- The suite now requires both `RUN_DATABASE_TESTS=true` and a dedicated `TEST_DATABASE_URL`, preventing accidental fixture cleanup against the normal application database. Without those explicit settings, it skips 3 database tests; the full Vitest run passed 74 tests. Targeted ESLint and strict type-check passed.

### 2026-08-24 Database identity mutation coverage slice

- Extended `tests/integration/database-identity.test.ts` with follow isolation and duplicate-prevention coverage, one-review-per-buyer uniqueness coverage, and a successful owner-scoped product mutation alongside the rejected cross-user mutation.
- Preserved the explicit `RUN_DATABASE_TESTS=true` and dedicated `TEST_DATABASE_URL` safety gate; without a configured test database, the integration file passed 14 non-database tests and skipped 6 database tests.
- Targeted strict type-check, zero-warning ESLint, and the integration test command passed. Live PostgreSQL execution remains required before marking the identity coverage queue item complete.

### 2026-08-24 Integration-test configuration and quality-gate slice

- Documented the isolated `TEST_DATABASE_URL` and explicit `RUN_DATABASE_TESTS=true` opt-in in `.env.example` and `README.md`.
- Preserved the CI behavior of running the normal suite without attempting destructive database fixtures.
- `npm run check` passed: strict type-check, zero-warning ESLint, 74 Vitest tests with 3 explicitly skipped database tests, and the 34-route production build. Prisma validation also passed with temporary non-secret verification values.

### 2026-08-24 Order tracking retryable error slice

- Order detail API mapping now returns `null` only for a 404 and rethrows other API failures.
- Tracking now exposes a visible retry action for temporary order-detail failures while preserving its distinct missing-order state.
- Added regression coverage for successful mapping, 404 handling, and 5xx propagation.
- Strict type-check, zero-warning lint, full Vitest suite (74 tests), and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes with proxy middleware.

### 2026-08-24 Wishlist mutation feedback slice

- Product cards now show visible retry-by-action feedback when adding or removing a wishlist item fails.
- Preserved existing authentication redirects, mutation invalidation, touch target, and pressed-state behavior.
- Strict type-check, zero-warning lint, full Vitest suite (71 tests), and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes with proxy middleware.

### 2026-08-24 Cart mutation feedback slice

- Added visible error feedback for quantity updates, item removal, and clear-cart failures while preserving retry-by-action behavior.
- Kept persistent cart mutations, identity-scoped cache invalidation, and the disabled checkout state unchanged.
- Strict type-check, zero-warning lint, full Vitest suite (71 tests), and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes with proxy middleware.

### 2026-08-24 Cart pricing-truthfulness slice

- Removed the unsupported client-only promo input and fabricated 10% discount calculation from the cart summary.
- Cart totals now show only the current subtotal, fixed shipping estimate, and tax until server-backed promotion and checkout pricing exist.
- Preserved the disabled checkout state and all persistent cart mutations.
- Strict type-check, zero-warning lint, full Vitest suite (71 tests), and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes with proxy middleware.

### 2026-08-24 Product related-artwork query-state slice

- Product detail now renders explicit loading, retryable error with retry action, and empty states for artist-scoped related artwork.
- Preserved the existing artist-scoped query key, product-card layout, and primary product flow.
- Strict type-check, zero-warning lint, full Vitest suite (71 tests), and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes with proxy middleware.

### 2026-08-24 Search retryable error slice

- Added a visible retryable error state to the REST-backed search results when the catalog request fails.
- Preserved the existing URL-backed query, filter, sort, pagination, and empty-result behavior.
- Strict type-check, zero-warning lint, full Vitest suite (71 tests), and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes with proxy middleware.

### 2026-08-24 Artists index error and labeling slice

- Added a visible retryable error state to the artists index when the REST query fails.
- Added a persistent visually hidden label and stable ID for the artists search input.
- Preserved existing filtering, verified-only selection, navigation, and card layout behavior.
- Strict type-check, zero-warning lint, full Vitest suite (71 tests), and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes with proxy middleware.

### 2026-08-24 Artist artwork query-state slice

- Artist detail now renders explicit loading, retryable error with retry action, and empty states for the artist’s published artwork query.
- Preserved the existing REST query, product-card layout, and artist route contract.
- Strict type-check, zero-warning lint, full Vitest suite (71 tests), and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes with proxy middleware.

### 2026-08-24 Story detail retryable error slice

- Story detail API mapping now returns `null` only for a 404 and rethrows other API failures.
- Story detail now exposes a visible retry action for retryable failures instead of presenting an unavailable service as “Story not found.”
- Added regression coverage for successful mapping, 404 handling, and 5xx propagation.
- Strict type-check, zero-warning lint, full Vitest suite (71 tests), and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes with proxy middleware.

### 2026-08-24 Artist detail retryable error slice

- Artist detail API mapping now returns `null` only for a 404 and rethrows other API failures.
- Artist detail now exposes a visible retry action for retryable failures instead of presenting an unavailable service as “Artist not found.”
- Added regression coverage for successful mapping, 404 handling, and 5xx propagation.
- Strict type-check, zero-warning lint, full Vitest suite (68 tests), and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes with proxy middleware.

### 2026-08-24 Optional remote font loading slice

- Changed the external Inter and General Sans font faces to optional loading so restricted or offline environments render immediately with the documented system fallbacks.
- Preserved the existing typography tokens, font families, weights, and visual hierarchy; self-hosting the production font assets remains future work.
- The complete `npm run check` gate passed with temporary non-secret verification environment values: strict type-check, zero-warning lint, full Vitest suite (65 tests), and the Next.js production build generating 34 routes with proxy middleware.

### 2026-08-24 Navbar mobile touch-target slice

- Audited the mobile category navigation and confirmed it starts at the logical first category with left-aligned horizontal scrolling.
- Increased the account, wishlist, cart, and mobile-search controls from 40px to the documented 44px minimum touch target without changing navigation behavior.
- The complete `npm run check` gate passed with temporary non-secret verification environment values: strict type-check, zero-warning lint, full Vitest suite (65 tests), and the Next.js production build generating 34 routes with proxy middleware.

### 2026-08-24 Homepage carousel accessibility slice

- Added accessible names and pressed states to carousel dots and previous/next controls.
- Added a pause/resume control and disabled automatic rotation when `prefers-reduced-motion: reduce` is active.
- Preserved the existing carousel data, layout, navigation, and visual treatment.
- The complete `npm run check` gate passed with temporary non-secret verification environment values: strict type-check, zero-warning lint, full Vitest suite (65 tests), and the Next.js production build generating 34 routes with proxy middleware.

### 2026-08-24 Homepage campaign-claim cleanup slice

- Replaced the unsupported “Up to 40% off” carousel claim with a neutral ceramics discovery message because campaign and discount data are not yet persisted.
- Preserved the existing carousel layout, controls, route destination, and visual system.
- The complete `npm run check` gate passed with temporary non-secret verification environment values: strict type-check, zero-warning lint, full Vitest suite (65 tests), and the Next.js production build generating 34 routes with proxy middleware.

### 2026-08-24 Profile mutation identity coverage slice

- Added route-level regression coverage proving a collector cannot PATCH another user's profile and that an authenticated user's own profile update is persisted with the authenticated profile ID.
- Preserved the existing API contract, authorization order, and profile update behavior; database-backed identity isolation remains a follow-up.
- Strict type-check, zero-warning lint, full Vitest suite (65 tests), Prisma validation with temporary non-secret verification environment values, and the Next.js production build passed. The generated route manifest contains 34 static routes and proxy middleware.

### 2026-08-24 Product review retryable error slice

- Product-detail review reads now distinguish loading, retryable API failure, and a genuine empty review list.
- Review failures expose a visible retry action and no longer present an unavailable review service as “No reviews yet.”
- Strict type-check, zero-warning lint, full Vitest suite (64 tests), Prisma validation, and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes and 13 dynamic routes.

### 2026-08-24 Product detail retryable error slice

- Product fetch mapping now returns `null` only for a 404 and rethrows other API failures so the UI can distinguish not-found from an unavailable service.
- Product detail now provides a retryable error state for non-404 failures while preserving its existing not-found state.
- Added regression coverage for 404 and 5xx adapter behavior.
- Strict type-check, zero-warning lint, full Vitest suite (64 tests), Prisma validation, and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes and 13 dynamic routes.

### 2026-08-24 Verified-purchase review eligibility slice

- Review creation now requires the authenticated user to have a delivered order containing the product and excludes the listing owner from reviewing their own work.
- Existing review response and uniqueness contracts remain unchanged; durable `Review` to `OrderItem` linkage is still pending because the current schema has no relation field.
- Added regression coverage for rejection without an eligible delivery, buyer/order/ownership query scoping, and successful creation after eligibility passes.
- Strict type-check, zero-warning lint, full Vitest suite (63 tests), Prisma validation, and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes and 13 dynamic routes.

### 2026-08-24 Artist follow vertical slice

- Added protected `GET`, idempotent `POST`, and scoped `DELETE` operations at `/api/artists/[id]/follow` using the existing Prisma `Follow` model and unique constraint.
- Added typed client methods and an identity-scoped React Query hook; artist detail now reflects follow status, redirects unauthenticated collectors to sign-in, and invalidates artist caches after a mutation.
- Artist owners see a disabled `Your profile` state instead of attempting to follow themselves.
- Removed the index card’s static nested Follow button so it no longer presents an unsupported mutation affordance.
- Added route, proxy, authorization, and query-key regression coverage.
- Strict type-check, zero-warning lint, full Vitest suite (60 tests), Prisma validation, and the Next.js production build passed with temporary non-secret verification environment values. The generated route manifest contains 34 static routes and 13 dynamic routes.

### 2026-08-24 Artist trust-claim cleanup slice

- Removed unsupported artist rating and review totals from the artist index and artist detail surfaces.
- Artist cards now show persisted identity status alongside follower and artwork counts; artist detail explains that artist-level reviews require verified-purchase data instead of displaying fabricated aggregates.
- Strict type-check, zero-warning lint, full Vitest suite (57 tests), Prisma validation, and the Next.js production build regenerated the 34-route application with temporary non-secret verification environment values.

### 2026-08-24 Collection detail catalog integration slice

- Removed the direct `allProducts` mock consumer from collection detail and connected its artwork grid to the existing `/api/products` query through `useProducts`.
- Added explicit loading, retryable error, and empty states; collection membership remains clearly marked as not yet persisted because no collection schema or API exists.
- Remaining `@/data` imports in marketplace surfaces are limited to collection metadata and filter/category taxonomy, not product records.
- Strict type-check, zero-warning lint, full Vitest suite (57 tests), Prisma validation, and the Next.js production build passed with temporary non-secret verification environment values. The build regenerated 34 routes with proxy middleware.

### 2026-08-24 Protected identity route coverage slice

- Added route-level regression coverage proving cart and wishlist reads use the authenticated user, cart item updates cannot mutate another user’s item, order list/detail reads pass the authenticated user into the service, and non-admin profile reads cannot cross identity boundaries.
- The existing API routes and Prisma contracts were preserved; this slice adds evidence around their current authorization behavior.
- Strict type-check, zero-warning lint, full Vitest suite (57 tests), Prisma validation, and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Truthful product relationships slice

- Product DTO mapping now preserves the persisted artist avatar for product detail instead of using a hard-coded external creator image; products without an avatar render accessible initials.
- Related artwork queries now forward the current product's artist ID and include that relationship in the React Query key, so the product-detail “Other Artworks by Creator” section does not show an unrelated catalog slice.
- Added mapper, related-query, and cache-isolation regression coverage.
- Strict type-check, zero-warning lint, full Vitest suite (53 tests), Prisma validation, and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Product-detail unsupported-claims slice

- Removed unsupported shipping and returns promises, generic print specifications and notes, fulfillment/payment claims, and fabricated artist credentials from product detail because the current catalog DTO has no backing fields for them.
- Relabeled room imagery as an approximate preview so it is not presented as a product-specific visualization.
- Strict type-check, zero-warning lint, full Vitest suite (50 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Product review sorting slice

- Wired the existing product-detail review sort selector to functional highest, lowest, and recent ordering through a pure helper.
- Added unit coverage for rating order, recency tie-breaking, and input immutability.
- Strict type-check, zero-warning lint, full Vitest suite (50 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Shareable search state slice

- Extended the existing search URL helper with backward-compatible repeated filter, sort, and page parameters.
- Restored those values into the existing search controls and synchronized changes back to the URL without changing the REST API contract or visual layout.
- Added unit coverage for encoding, repeated values, invalid sort/page normalization, and round-trip parsing.
- Strict type-check, zero-warning lint, full Vitest suite (47 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Product-detail control accessibility slice

- Added accessible names and state to carousel navigation, image indicators/thumbnails, room/review selectors, wishlist, and quantity controls; carousel and action targets now meet the documented touch-size baseline.
- Strict type-check, zero-warning lint, full Vitest suite (45 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Product detail truthfulness slice

- Removed the fabricated size selector because the current catalog has no persisted product-variant model; add-to-cart now uses the existing server default size.
- Removed the unsupported pre-Stripe “Secure checkout” claim while preserving the existing page layout and cart contract.
- Strict type-check, zero-warning lint, full Vitest suite (45 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Auth/profile feedback announcement slice

- Added alert semantics to authentication and profile errors and polite status semantics to profile-save confirmation, preserving existing copy and behavior.
- Strict type-check, zero-warning lint, full Vitest suite (45 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Authentication native form submission slice

- Added a native form boundary and submit button to the existing login/registration screen so keyboard Enter submission follows the same handler as the primary action.
- Marked mode and role selector controls as non-submit buttons to prevent accidental submissions while preserving their existing behavior.
- Strict type-check, zero-warning lint, full Vitest suite (45 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Profile form contract and semantics slice

- Made the profile email field explicitly non-editable because the server update schema does not accept email changes, preventing misleading unsaved edits.
- Added stable label associations for profile fields and tablist/tab semantics for account navigation without changing the existing API contract.
- Strict type-check, zero-warning lint, full Vitest suite (45 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 ArtistCard verification label slice

- Added an accessible “Verified artist” text label to the existing artist-card verification badge without changing its visual presentation or link behavior.
- Strict type-check, zero-warning lint, full Vitest suite (45 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 ProductCard wishlist accessibility slice

- Increased the wishlist control to the documented 44px touch target, exposed its pressed state, and made it visible when keyboard-focused despite the existing desktop hover treatment.
- Strict type-check, zero-warning lint, full Vitest suite (45 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Search control semantics slice

- Converted search filter groups to fieldsets with legends and added accessible names/state to sorting and pagination controls, preserving existing filter behavior and layout.
- Strict type-check, zero-warning lint, full Vitest suite (45 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Global search labeling slice

- Added a generated stable ID and persistent visually hidden label to each shared global search instance, preserving the existing autocomplete, keyboard, and navigation behavior.
- Strict type-check, zero-warning lint, full Vitest suite (45 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Authentication form labeling slice

- Added persistent visually hidden labels and explicit IDs to the existing login and registration name, email, and password controls without changing layout or interaction behavior.
- Strict type-check, zero-warning lint, full Vitest suite (45 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Documentation baseline alignment

- Updated the README technology table from the obsolete Next.js 15 label to the installed Next.js 16.3.1 App Router baseline.
- No runtime behavior or API contract changed; the existing 45-test, type-check, lint, Prisma validation, and production-build verification remains applicable.

### 2026-08-24 Story route-ID boundary slice

- Applied the existing CUID route-parameter validator to the published story detail handler before the Prisma lookup.
- Extended dynamic-route regression coverage to malformed story IDs; the current product, artist, user, and story detail routes now reject invalid IDs before persistence access.
- Strict type-check, zero-warning lint, full Vitest suite (45 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware; Prisma validation remained green from the same verification run.

### 2026-08-24 User route-ID boundary slice

- Applied the existing CUID route-parameter validator to user profile GET and PATCH handlers before authorization comparisons and Prisma lookups.
- Extended route regression coverage to prove malformed user IDs return controlled validation errors after authentication and before persistence access.
- Strict type-check, zero-warning lint, full Vitest suite (44 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware; Prisma validation remained green from the same verification run.

### 2026-08-24 Catalog route-ID boundary slice

- Applied the existing CUID route-parameter validator to product and artist detail GET, PATCH, and DELETE handlers before service or Prisma lookups.
- Added regression coverage proving malformed product and artist IDs return controlled validation errors without invoking persistence dependencies.
- Strict type-check, zero-warning lint, full Vitest suite (43 tests), and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware; Prisma validation remained green from the same verification run.

### 2026-08-24 Authentication response boundary slice

- Removed the signed JWT from login and registration response JSON while preserving the existing HTTP-only cookie session behavior.
- Added route-level regression tests covering successful login and registration, cookie setup, safe user payloads, and the absence of a browser-visible `token` field.
- Strict type-check, zero-warning lint, full Vitest suite (41 tests), Prisma validation, and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-24 Identity-scoped protected query caches

- Scoped cart, wishlist, and order list/detail React Query keys to the authenticated user ID so one identity cannot reuse another identity's protected cache while a session changes.
- Preserved root-prefix invalidation for existing login, logout, and mutation flows; order cancellation now invalidates the user-scoped detail key when the current identity is available.
- Added regression coverage proving cart, wishlist, and order keys differ across users while retaining stable key shapes.
- Strict type-check, zero-warning lint, full Vitest suite (39 tests), Prisma validation, and the Next.js production build passed with temporary non-secret verification environment values. The build generated 34 routes with proxy middleware.

### 2026-08-23 Server-backed search query slice

- Extended the existing product list adapter and query keys to carry the supported catalog query parameters without changing the REST route contract.
- Connected the search page text query to `/api/products`, while preserving its existing local filter and pagination behavior.
- Expanded product search matching to include artist first and last names on the server.
- Added query-key isolation coverage for search terms and sort controls.
- Targeted type-check and tests passed. The full test suite passed with 25 tests, Prisma validation passed, and the production build passed with temporary non-secret verification environment values. The default build without environment values still fails as designed because production validation requires `DATABASE_URL` and `JWT_SECRET`.

### 2026-08-23 Shareable search URL slice

- Search submissions and category navigation now write the active query to `/search?q=...` using one shared URL helper.
- The search page restores its query from the URL, keeps the existing query-backed catalog read, and clears both the visible query and URL together.
- Added URL encoding and empty-query unit coverage.
- Full quality verification passed with temporary non-secret environment values: strict type-check, zero-warning lint, 27 tests across 10 files, and the Next.js production build generating 34 routes.

### 2026-08-23 Server filter forwarding slice

- Search now forwards a single selected category, price range, rating threshold, and sort choice through the existing `/api/products` query contract.
- Multi-select filters continue to be resolved in the page so the current UI behavior stays intact while the server handles supported single-value constraints.
- Product query execution now runs whenever any supported query parameter is present, not only for artist or text search.
- Added cache-key coverage for server filter combinations.
- Full quality verification passed with temporary non-secret environment values: strict type-check, zero-warning lint, 28 tests across 10 files, and the Next.js production build generating 34 routes.

### 2026-08-23 Admin route access slice

- Added a boundary-aware `admin` page access state for `/admin` and nested paths without creating an admin page or changing existing routes.
- The request proxy now rejects unauthenticated admin requests and redirects authenticated non-admin roles to the public home with an explicit `admin-access` reason.
- Added role and runtime proxy coverage for administrator-only access.
- Full quality verification passed with temporary non-secret environment values: strict type-check, zero-warning lint, 30 tests across 10 files, and the Next.js production build generating 34 routes.

### 2026-08-23 Authentication email normalization slice

- Registration and login schemas now trim and lowercase email addresses before duplicate checks, persistence, and authentication lookup.
- Added regression coverage for mixed-case and whitespace-padded email input.
- Full quality verification passed with temporary non-secret environment values: strict type-check, zero-warning lint, 31 tests across 10 files, and the Next.js production build generating 34 routes.

### 2026-08-23 Review mutation proxy slice

- Made API protection method-aware for the existing review routes: public GET reads remain available, while POST, PATCH, and DELETE mutations require authentication at the proxy boundary.
- Added route-policy and runtime proxy coverage for public review reads and unauthenticated review mutations.
- Full quality verification passed with temporary non-secret environment values: strict type-check, zero-warning lint, 31 tests across 10 files, and the Next.js production build generating 34 routes.

### 2026-08-23 Product-ID boundary validation slice

- Added a shared CUID product-ID schema and applied it to public review reads, review creation, and wishlist creation before Prisma lookups.
- Missing IDs keep their existing required-field response; malformed IDs now fail validation without reaching persistence.
- Added invalid-ID regression coverage.
- Full quality verification passed with temporary non-secret environment values: strict type-check, zero-warning lint, 32 tests across 10 files, and the Next.js production build generating 34 routes.

### 2026-08-23 Protected route-ID validation slice

- Added shared CUID route-ID validation to protected cart-item, wishlist-removal, order-detail/cancellation, and review-edit/delete handlers.
- Authorization still resolves before parameter validation, while malformed IDs now fail before Prisma queries.
- Added protected route-ID regression coverage.
- Full quality verification passed with temporary non-secret environment values: strict type-check, zero-warning lint, 33 tests across 10 files, and the Next.js production build generating 34 routes.

### 2026-08-23 Product query range validation slice

- Product query validation now rejects contradictory `minPrice` and `maxPrice` values while preserving independent bounds and existing defaults.
- Added cross-field regression coverage for malformed price ranges.
- Full quality verification passed with temporary non-secret environment values: strict type-check, zero-warning lint, 34 tests across 10 files, and the Next.js production build generating 34 routes.

### 2026-08-23 Review and wishlist body validation slice

- Review and wishlist mutation handlers now validate the complete parsed request body before reading `productId` or review fields.
- Malformed body shapes, including `null`, now use the standard validation error path instead of throwing during destructuring.
- Added malformed-body regression coverage through the shared product-ID schema.
- The verification commands passed separately with temporary non-secret environment values: strict type-check, zero-warning lint, 34 tests across 10 files, Prisma validation, and the Next.js production build generating 34 routes. The combined `npm run check` wrapper was interrupted after its shell stopped emitting output; no code failure was reported.

### 2026-08-23 Server rating pagination slice

- Product list rating filters now resolve eligible product IDs before applying ordering and pagination.
- Rating-filtered totals now count eligible products instead of the unfiltered catalog, and qualifying products are not lost because lower-rated rows occupied the first page.
- Added a service regression test covering the pagination and total-count behavior.
- Verification commands passed separately through the working shell: strict type-check, zero-warning lint, 35 tests across 11 files, Prisma validation, and the Next.js production build generating 34 routes.

### 2026-08-23 Order cancellation concurrency slice

- Order cancellation now claims the cancellable state inside the transaction before restoring item inventory.
- A concurrent request that loses the guarded state update cannot restore stock a second time; transaction rollback preserves both state and inventory if restoration fails.
- Added success and race-loss service regression tests.
- Verification commands passed separately through the working shell: strict type-check, zero-warning lint, 37 tests across 12 files, Prisma validation, and the Next.js production build generating 34 routes.

### 2026-08-23 Typed order-state error slice

- Added a typed `InvalidStateError` for checkout and cancellation state failures.
- Standard API error handling now maps those expected domain failures to a controlled 400 response; order routes no longer catch arbitrary errors or expose untyped internal messages.
- Existing success responses and state-transition tests remain green.
- Verification commands passed separately through the working shell: strict type-check, zero-warning lint, 37 tests across 12 files, Prisma validation, and the Next.js production build generating 34 routes.

### 2026-08-23 Protected page access and identity cache slice

- Added boundary-aware route access policy for authenticated account pages and the artist workspace.
- Extended `src/proxy.ts` to redirect unauthenticated page requests to `/login` with their original destination, return JSON auth failures for protected API requests, and reject non-artist roles from the artist workspace.
- Added logout cache cleanup for authentication, cart, wishlist, and order React Query roots in the Navbar, profile, and artist portal.
- Removed the seeded mock cart initialization from Zustand so a fresh client cannot display fabricated cart contents; persisted cart data remains REST-backed.
- Refreshed the auth cookie after artist profile creation so the new `ARTIST` role is available to the protected workspace immediately.
- Added route-policy, runtime proxy, and identity-cache tests. `npm run check` passed with 20 tests, and `npm run db:validate` passed using temporary non-secret verification environment values.
- Production build completed with strict TypeScript and generated 34 routes; Next.js reported the proxy as middleware.

### 2026-08-23 Product card navigation semantics

- Replaced clickable non-semantic product image, artist, and title elements with keyboard-reachable links while preserving the existing `ProductCard` props and visual classes.
- Replaced the ArtistCard's clickable container with a keyboard-reachable link while preserving its existing visual treatment and destination.
- This removes one documented accessibility gap without changing product data flow or navigation destinations.

### 2026-08-23 Artist portal published listings slice

- Added parameterized product query keys and connected the artist portal's published artwork table and grid to the artist-filtered products API using the authenticated artist profile.
- Removed fabricated artwork view counts and draft/review labels from those views; active REST results are labeled Published.
- Added loading, retry, and empty states for the portal's artwork reads.
- Added query-key isolation coverage. Type-check, lint, 21 tests, Prisma validation, and the production build passed; the build generated 34 routes with proxy middleware.

### 2026-08-23 Checkout inventory guard slice

- Changed checkout stock decrements to guarded transactional updates requiring an active product row with enough current stock.
- Inactive products and concurrent stock races now abort the transaction before the cart is cleared.
- Added mocked transaction coverage for successful guarded decrements, race loss, and inactive products.
- Type-check, lint, 24 tests, Prisma validation, and the production build passed; the build generated 34 routes with proxy middleware.

### 2026-08-23 product direction alignment

- Confirmed Artistically is an India-first, INR, mobile-friendly web marketplace and discovery platform.
- Confirmed discovery/editorial merchandising leads the product while trusted commerce remains the foundation.
- Confirmed one public Verified badge backed by identity/background review; badge removal is separate from artwork or account enforcement.
- Confirmed Artistically owns Stories and editorial collections; artists own profiles, artwork, and artist-only collections.
- Confirmed reports create review cases and only validated reports can cause permanent removal, with appeals available.
- Removed automated valuation from the product scope.
- Set social feeds, messaging, auctions, and optional AR/3D previews as post-foundation roadmap capabilities.
- Set the next implementation slice to persistent cart and wishlist integration, followed by profile and protected route behavior.

### 2026-08-22 Phase 1 catalog and authentication slice

- Added typed API client and public DTOs.
- Connected product and artist catalog reads, search, product detail, related artwork, and artist pages to REST APIs.
- Connected registration, login, logout, and current-user reads to the server session.
- `npm run type-check`, `npm run lint`, `npm test`, and production build passed; build verification used temporary non-secret environment validation values.

### 2026-08-23 Phase 1 persistent account state slice

- Added typed cart and wishlist DTOs, API adapters, React Query hooks, and mutation invalidation keyed to the authenticated session.
- Connected product cards, product detail, navbar indicators, cart, wishlist, and profile Wishlist views to server-backed state with sign-in, loading, error, and retry states.
- Added per-item cart PATCH/DELETE routes, server-side stock and quantity checks, idempotent wishlist adds, and a persisted profile PATCH flow.
- Removed the static checkout success behavior from the cart. Checkout remains disabled until order and payment authority exist.
- Added cart boundary and DTO mapping tests. `npm run type-check`, `npm run lint`, `npm test` (10 tests), and production build passed; build verification used temporary non-secret environment validation values.
- Replaced navbar product and artist autocomplete data with `useProducts` and `useArtists` queries, removing numeric mock IDs from that interaction while preserving collection suggestions and the existing search layout.
- After the navbar slice, `npm run type-check`, `npm run lint`, `npm test` (10 tests), production build, and `npm run db:validate` passed again; build verification used temporary non-secret environment validation values.

### 2026-08-23 Story REST slice

- Added public `/api/stories` and `/api/stories/[id]` reads backed by published Prisma Story records.
- Replaced the static Story adapter, removed numeric ID coercion, and connected homepage and story detail content to API DTOs.

### 2026-08-23 Product review REST slice

- Added typed review DTO mapping and a product-scoped React Query hook.
- Replaced the product-detail static review list, count, and rating summary with API-backed data and truthful loading/empty states.

### 2026-08-23 Account order-history REST slice

- Added typed order DTO mapping and a session-aware React Query hook for persisted orders.
- Replaced the profile’s static order rows with server-backed order lines and loading, empty, and retry states.
- Added order mapping coverage. `npm run type-check`, `npm run lint`, `npm test` (13 tests), production build, and `npm run db:validate` passed; build verification used temporary non-secret environment validation values.

### 2026-08-23 Order tracking REST slice

- Added order-detail and cancellation query/mutation hooks and preserved order IDs in profile order links.
- Replaced the fabricated tracking page with authenticated order detail, persisted totals, status steps, expected delivery, and server-backed cancellation. An order ID is now required instead of falling back to invented shipment data.
- `npm run type-check`, `npm run lint`, `npm test` (13 tests), production build, and `npm run db:validate` passed; build verification used temporary non-secret environment validation values.
- Added explicit cancelled/refunded status mapping in profile order rows. The full `npm run check` gate passed again with 13 tests; build verification used temporary non-secret environment validation values.

### 2026-08-18 Phase 0 implementation

- Removed the untyped Prisma no-op fallback and made generated Prisma Client types mandatory.
- Removed build-time TypeScript suppression; strict type-check passes.
- Upgraded Next.js to 16.3.1, migrated `middleware.ts` to `proxy.ts`, and adopted the Next 16 flat ESLint configuration.
- Added a zero-warning lint gate, Vitest unit/integration scripts, six passing baseline tests, and a GitHub Actions quality workflow.
- Added production environment validation; production requires a database URL and a minimum-length JWT secret.
- Added the initial PostgreSQL migration, relation integrity, and indexes for common query paths.
- Applied the migration to an isolated PostgreSQL 16 database and ran the seed twice. Counts remained stable at 5 products, 5 product images, 2 stories, and 4 users.
- Removed the temporary PostgreSQL verification container after the test.
- Added request IDs and structured API completion and failure logs.
- `npm audit` reports zero vulnerabilities after security updates and a verified Prisma transitive override.
- Production build completed with strict TypeScript and generated all 33 pages without framework deprecation warnings.

### 2026-08-24 Durable review verification slice

- Added an optional `Review.orderItemId` relation and migration so newly accepted reviews retain the delivered order item that established eligibility; legacy reviews remain readable and valid.
- Review REST responses expose `verified: true` only when the persisted order-item link exists; the existing create request contract and one-review-per-buyer/product rule remain unchanged.
- Added route regression coverage for persisted linkage and verified response mapping.
- Prisma Client generation, Prisma validation, strict type-check, zero-warning ESLint, targeted review/mapper tests (12 passing), full Vitest suite (132 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 36-route production build passed with temporary non-secret verification environment values.
- Live migration application and PostgreSQL integration execution remain unverified because this environment has no configured database, local PostgreSQL service, or usable Docker daemon.

### 2026-08-25 Moderation report foundation slice

- Added durable `Report` records for artwork and collections with reason, status, reporter, reviewer, resolution note, and target relations.
- Added authenticated report creation with active/published target checks and duplicate-open-report protection.
- Added admin-only report listing and resolution routes; resolution transactionally deactivates artwork or unpublishes collections, while dismissal leaves targets unchanged.
- Added API route-policy and proxy coverage for report authentication and admin-role enforcement.
- Prisma Client generation, Prisma validation, strict type-check, zero-warning ESLint, focused moderation/proxy tests (12 passing), full Vitest suite (136 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 38-route production build passed with temporary non-secret verification environment values.
- Live migration application and PostgreSQL integration execution remain unverified because this environment has no configured database, local PostgreSQL service, or usable Docker daemon.

### 2026-08-25 Moderation appeals and audit trail slice

- Added durable owner appeals for resolved moderation reports, with one appeal per report and owner authorization derived from the affected artwork or collection.
- Added admin appeal listing and decisions; approved appeals restore the affected artwork or collection, while rejected appeals preserve the moderation outcome.
- Added append-only moderation events for report creation/resolution/dismissal and appeal submission/decision, written in the same transactions as state changes.
- Prisma Client generation, Prisma validation, strict type-check, zero-warning ESLint, focused moderation/appeal tests (14 passing), full Vitest suite (138 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 39-route production build passed with temporary non-secret verification environment values.
- Live migration application and PostgreSQL integration execution remain unverified because this environment has no configured database, local PostgreSQL service, or usable Docker daemon.

### 2026-08-25 Authoritative checkout quote slice

- Added protected `POST /api/checkout/quote` backed by the existing cart and inventory data; it returns server-calculated subtotal, shipping, tax, discount, total, item availability, and `canCheckout` without creating orders, decrementing inventory, or clearing carts.
- Added promo normalization/validation and route/service regression coverage proving quote requests are non-mutating.
- Strict type-check, zero-warning ESLint, full Vitest suite (140 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), and the 40-route production build passed with temporary non-secret verification environment values.
- Payment provider integration, webhook confirmation, and live PostgreSQL execution remain open.

### 2026-08-25 Seller order read slice

- Added protected `GET /api/artist/orders` and an order-service query that returns only line items belonging to the authenticated artist, including the persisted order status and shipping destination needed for fulfillment.
- Replaced the artist portal’s static seller-order placeholder with loading, retryable-error, empty, and persisted-order states; seller-order query data is cleared with other identity-sensitive caches on logout.
- Strict type-check, zero-warning ESLint, full Vitest suite (140 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 41-route production build passed with temporary non-secret verification environment values.
- Seller fulfillment mutations, payment-backed orders, shipment-provider events, and live PostgreSQL execution remain open.

### 2026-08-25 Seller fulfillment status slice

- Added persisted `OrderItem.fulfillmentStatus` with a default `PENDING` state and migration-safe compatibility for existing orders.
- Added owner-scoped `PATCH /api/artist/order-items/[id]` with forward-only `PROCESSING → SHIPPED → IN_TRANSIT → DELIVERED` transitions; other sellers receive a not-found response.
- Updated the artist portal to display and advance per-item fulfillment status, and updated review eligibility to recognize an item delivered independently of the aggregate order status.
- Strict type-check, zero-warning ESLint, full Vitest suite (143 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 41-route production build passed with temporary non-secret verification environment values.
- Shipment-provider events, refunds, payouts, payment-backed order creation, and live PostgreSQL execution remain open.

### 2026-08-25 Seller review read slice

- Added protected `GET /api/artist/reviews` with product ownership scoping and durable verified-purchase mapping from `Review.orderItemId`.
- Replaced the artist portal’s static unavailable review message with persisted loading, retryable-error, empty, and review states, including factual verification labels.
- Added seller-review cache invalidation on logout; existing public review contracts remain unchanged.
- Strict type-check, zero-warning ESLint, full Vitest suite (145 passing tests with 6 explicitly skipped opt-in PostgreSQL tests), Prisma validation, and the 42-route production build passed with temporary non-secret verification environment values.
- Review moderation, provider-backed fulfillment, payment-backed order creation, and live PostgreSQL execution remain open.

### 2026-08-18 audit

- Repository structure and all major pages, API handlers, schema, services, state, and data adapters reviewed.
- `npm run type-check`: failed with 13 TypeScript or generated-Prisma-related errors.
- `npm run build`: passed only while type validation was explicitly skipped.
- Production build generated 34 application routes and approximately 102 kB shared first-load JavaScript.
- Desktop homepage rendered successfully and showed the mock initial cart count.
- Product detail rendered static reviews, generic size options, hard-coded trust claims, and an invalid generated artist URL.
- Mobile homepage rendered, but horizontally centered category navigation clipped the first category.
- Local development logged LCP priority warnings for prominent images.
- No source changes were made during the audit preceding this documentation set.

## Immediate Work Queue

| Order | Work item | Completion signal |
|---:|---|---|
| 1 | Add database-backed identity and mutation integration tests | PostgreSQL-backed tests prove cross-user isolation, authorization, and mutation behavior |
| 2 | Remove remaining catalog mock consumers | Complete for current catalog surfaces: marketplace catalog pages no longer import records from `src/data` |
| 3 | Expand art catalog schema | Listings represent physical, edition, made-to-order, and digital requirements |
| 4 | Implement artist onboarding and uploads | Eligible artist can submit a complete listing |
| 5 | Implement verification and moderation cases | Verified badge, report review, permanent removal, appeals, and audit history are durable |
| 6 | Design and implement Stripe Connect checkout | Test payment, webhook, seller allocation, inventory reservation, and idempotency reconcile |

## Update Rules

- Update this file in the same change that moves a phase or capability status.
- Do not mark a capability Complete based only on a rendered screen.
- Include the test, command, or user journey that verified completion.
- Record newly discovered critical and high risks.
- Keep detailed implementation tasks in the project issue tracker; this file records cross-session status and milestone truth.
- When a phase completes, add a dated verification entry and link the relevant architecture or policy decision.
