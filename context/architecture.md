# Artistically — Architecture

## Architectural Direction

Artistically uses a modular monolith for the initial production system. Next.js hosts the web application and REST route handlers, Prisma manages PostgreSQL access, and background-capable integrations handle payments, media, email, and fulfillment events.

This approach keeps deployment and transactions simple while enforcing boundaries that can later become separate services if scale or organizational ownership requires it.

## Technology Baseline

- Language: TypeScript with strict mode.
- Web framework: Next.js App Router.
- UI: React and Tailwind CSS with project-owned reusable components.
- Remote state: TanStack React Query.
- Client UI state: Zustand.
- Forms: React Hook Form and Zod when installed and integrated.
- API: REST for the initial release.
- Database: PostgreSQL through Prisma.
- Payments and seller onboarding: Stripe and Stripe Connect.
- Media: object storage or a managed image provider with signed operations.
- Tests: unit, integration, and browser-level end-to-end coverage.

## System Boundaries

### Web presentation boundary

Responsible for routing, rendering, interaction, accessibility, SEO, forms, and display formatting. It does not calculate authoritative prices, grant roles, decide payment success, or directly access Prisma from client components.

### API boundary

Responsible for authentication, input validation, authorization, response contracts, rate limits, idempotency entry points, and translation between HTTP and domain services.

Route handlers should be thin. They parse the request, validate input, invoke one domain operation, and map the result to a standardized response.

### Domain service boundary

Responsible for business rules and transactions. Examples include publishing a listing, adding a valid cart item, reserving inventory, creating a pending order, applying a refund, and transitioning fulfillment state.

Services receive authenticated actor context explicitly. They do not trust role, price, totals, owner IDs, or status values supplied by the browser.

### Persistence boundary

Prisma repositories or narrowly scoped query modules own database reads and writes. Complex state transitions are executed in transactions and guarded by current state.

### External integration boundary

Adapters isolate Stripe, object storage, email, shipment providers, and analytics. Domain code depends on project-owned interfaces rather than vendor SDK types.

### Operations boundary

Administrative actions, verification, moderation, disputes, refunds, and manual overrides require explicit authorization and audit records.

## Folder Structure

The current source tree is retained and evolved toward the following organization:

```text
context/
  architecture.md
  build-plan.md
  code-standards.md
  library-docs.md
  progress-tracker.md
  project-overview.md
  ui-registry.md
  ui-rules.md
  ui-tokens.md
prisma/
  migrations/
  schema.prisma
  seed.ts
public/
src/
  app/
    (account)/
    (artist-portal)/
    (auth)/
    (shop)/
    admin/
    api/
  components/
    artist/
    commerce/
    forms/
    layout/
    product/
    ui/
  features/
    artists/
    auth/
    cart/
    catalog/
    checkout/
    orders/
    payments/
    reviews/
    verification/
  hooks/
  lib/
    api/
    auth/
    integrations/
    repositories/
    services/
    validation/
  store/
  types/
tests/
  e2e/
  integration/
  unit/
```

Folder rules are defined in [code-standards.md](./code-standards.md). Existing files should migrate incrementally; large folder-only rewrites are not a product milestone.

## Request Data Flow

### Read flow

1. A server component or React Query hook requests a REST resource.
2. The route handler parses query parameters through Zod.
3. The route invokes a domain service or read repository.
4. Prisma queries PostgreSQL using explicit selection and pagination.
5. The route maps database values to a public DTO.
6. React Query caches the DTO using stable query keys.
7. Components render loading, success, empty, and error states.

### Mutation flow

1. A form validates immediate user feedback with the shared Zod-compatible contract.
2. The browser sends only mutable input fields.
3. The route resolves the authenticated actor from the secure session.
4. The server validates input again.
5. The domain service authorizes the actor and enforces current-state invariants.
6. Prisma commits the transaction.
7. The API returns a DTO and relevant version or status.
8. React Query updates or invalidates the affected cache keys.

### Payment flow

1. Server calculates authoritative cart price, discount, tax, shipping, currency, and seller allocation.
2. Server creates a pending checkout/order record with an idempotency key.
3. Server creates or reuses the Stripe PaymentIntent or Checkout Session.
4. Browser completes Stripe-hosted or Stripe Elements payment interaction.
5. Stripe sends a webhook.
6. The webhook route verifies the raw payload signature before parsing.
7. A unique event record prevents duplicate processing.
8. A transaction applies the allowed payment and order state transition.
9. Fulfillment and notifications are triggered after the durable commit.

The redirect page is a display surface only and is not proof of payment.

### Media upload flow

1. Authenticated client requests an upload authorization for a declared media purpose.
2. Server validates owner, file category, maximum size, MIME type, and count.
3. Client uploads directly to the configured provider using a short-lived signed operation.
4. Server stores a normalized asset record only after provider confirmation or controlled callback.
5. Listing publication verifies that every referenced asset belongs to the artist and is ready.

## Server State and Client State

### React Query owns

- Authenticated user snapshot.
- Products, artists, collections, and stories.
- Cart, wishlist, orders, reviews, payouts, and dashboard data.
- Mutation status and remote cache invalidation.

### Zustand owns

- Mobile navigation visibility.
- Filter drawer visibility and optional unsaved filter drafts.
- Non-sensitive display preferences.
- Temporary UI coordination that does not need server persistence.

Zustand must not be the source of truth for authentication, cart inventory, prices, orders, permissions, payments, or payout state.

## Public API Contract

All JSON endpoints use a predictable envelope:

```ts
type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
    requestId?: string;
  };
};
```

Paginated endpoints additionally return cursor or page metadata. The project should prefer cursor pagination for feeds that change frequently and page pagination for stable browse/search results where total counts are useful.

DTOs must not expose password hashes, internal moderation notes, provider secrets, raw identity documents, or unnecessary personal information.

## Database Schema Direction

### Existing core entities

- User
- Artist
- Product
- ProductImage
- Review
- CartItem
- WishlistItem
- Order
- OrderItem
- Follow
- Story

### Required production entities or concepts

- Session or revocable authentication record.
- Address with immutable order address snapshots.
- ArtistVerification and verification evidence references.
- ArtworkDetails or category-aware product specification fields.
- ProductVariant for genuinely variable inventory.
- MediaAsset with owner, purpose, state, metadata, and provider key.
- Collection and CollectionItem.
- Payment, PaymentEvent, Refund, and Dispute.
- SellerOrder or Fulfillment grouping order items by artist.
- Shipment and ShipmentEvent.
- StripeAccount and Payout.
- PlatformFee or immutable seller settlement lines.
- Review eligibility linked to an OrderItem.
- ModerationCase, Report, and AuditLog.
- EvidenceProviderPolicy and CertificateOfAuthenticity for controlled trust evidence storage, retention, and artwork authenticity records.
- PromoCode with eligibility, limits, validity, and usage records.

### Money representation

Use integer minor units for currencies such as INR paise, or Prisma `Decimal` with an enforced currency strategy. Public DTOs should use a money object:

```ts
type Money = {
  amountMinor: number;
  currency: "INR";
};
```

Do not use JavaScript floating-point arithmetic for authoritative totals.

## Core Invariants

### Identity and authorization

- Email is normalized before uniqueness checks.
- Production startup fails when required authentication secrets are missing.
- A user cannot grant themselves artist verification or administrator access.
- Artist and administrator authorization is checked on the server for every protected operation.
- Public verification status changes only through an auditable verification decision.

### Catalog

- A listing belongs to exactly one artist.
- Only the owner or an authorized administrator may modify a listing.
- A published listing has required media, price, currency, artwork type, fulfillment mode, and category-specific specifications.
- A one-of-one original has available inventory of zero or one.
- Digital and physical fulfillment requirements are mutually explicit.
- Referenced media assets belong to the listing owner and are in a ready state.

### Cart and pricing

- Cart lines reference an active purchasable listing and a valid variant when applicable.
- Cart display totals are estimates until recalculated by the server during checkout.
- The server never accepts product price, tax, shipping, discount, commission, or total from the client.
- Promo codes enforce validity, usage limits, eligibility, and case normalization on the server.

### Orders and inventory

- Order item title, specifications, price, artist, fulfillment promises, and policy-relevant facts are immutable snapshots.
- Inventory reservation or decrement is atomic and cannot make stock negative.
- Retried checkout requests do not create duplicate orders or charges.
- A paid order has a durable successful payment reference.
- Seller fulfillment transitions are valid for the current state and actor.
- Cancellation, refund, and stock restoration are idempotent.

### Payments and payouts

- Stripe webhook signatures are verified against the raw request body.
- Each provider event ID is processed at most once.
- Payment success is never inferred from a client redirect.
- Total seller proceeds plus platform fees, payment fees, refunds, and adjustments reconcile to the captured amount according to policy.
- Payout status is based on Stripe state, not an optimistic UI action.

### Reviews and trust

- A verified-purchase review is linked to a delivered eligible order item.
- One order item cannot generate multiple active reviews by the same buyer.
- Artists cannot review their own listings through another role path.
- Moderation and verification decisions preserve actor, reason, and timestamp.

### Audit and privacy

- Sensitive administrative and financial actions create audit records.
- Identity documents and protected digital files are not publicly addressable.
- Personal data exposure is minimized by endpoint and role.
- Deletion and retention behavior follows the applicable privacy and financial-record policy.
- Verification evidence carries a provider policy and retention deadline; cleanup may mark or delete provider objects only after database references and legal holds are checked.

## Reliability and Observability

- Every request receives a traceable request ID.
- Structured logs include operation, actor ID when appropriate, resource ID, outcome, and latency without logging secrets.
- Stripe, upload, email, and shipment callbacks store receipt and processing status.
- Failed asynchronous work is retryable and visible to administrators.
- Health checks distinguish application availability from dependency readiness.
- Alerts cover payment webhook failures, checkout error spikes, negative or inconsistent inventory, and elevated authentication failures.

## Security Baseline

- HTTP-only, secure, same-site cookies for browser sessions.
- No authentication token returned to browser JavaScript unless a separate documented API-client use case requires it.
- CSRF protection for cookie-authenticated state changes.
- Rate limits on authentication, password recovery, reviews, uploads, reports, and checkout.
- Strict input validation and output shaping.
- Signed and expiring media operations.
- Content Security Policy and safe remote image configuration.
- Dependency and secret scanning in CI.
- No production fallback secrets or default credentials.
