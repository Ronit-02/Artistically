# Artistically — Build Plan

## Planning principles

- Establish complete user journeys before expanding page count.
- Treat trust, purchasing, fulfillment, and seller outcomes as core product work.
- Prefer vertical slices that include interface, application behavior, data, tests, and user-visible states.
- Do not display claims such as verified, paid, refunded, insured, or authentic until they are backed by maintained product data and policy.
- Keep REST as the application API style for the initial release.
- A phase is complete only when its exit outcomes are verified.
- Current completion status belongs in `progress-tracker.md`; this file defines durable sequence and gates.

## Phase 0 — Reliable project baseline

### Goal

Keep the repository safe to change and capable of rejecting broken work.

### Deliverables

- Reproducible installation, development, validation, test, and production-build workflows.
- Versioned data-model history and repeatable development data.
- Accurate project documentation and enforceable quality commands.

### Exit outcomes

- A clean checkout can install dependencies and pass the established quality gate.
- The application data model can be created from committed history.
- Build errors are not hidden by configuration.

## Phase 1 — Unified application data

### Goal

Ensure marketplace and account experiences use durable application data instead of demonstrations or fabricated records.

### Deliverables

- Explicit public data contracts and a typed API client.
- Consistent string identifiers across application boundaries.
- Server-backed account, catalog, profile, cart, wishlist, review, and order experiences.
- Remote data owned by the established query layer and transient display state kept local.
- Loading, empty, error, unavailable, and not-found states for every connected journey.

### Exit outcomes

- User and marketplace changes persist across sessions.
- Production-facing pages render from application APIs rather than static marketplace records.
- Protected experiences behave consistently for signed-out and ineligible users.

## Phase 2 — Art catalog and artist onboarding

### Goal

Enable artists to create accurate, reviewable profiles, artwork, and collections.

### Deliverables

- Art-specific listing facts for physical, edition, made-to-order, and digital work.
- Artist profile onboarding and storefront management.
- Artwork creation, editing, preview, submission, publication, archival, and inventory experiences.
- Media and listing workflows that represent ownership and readiness.
- Artist verification, listing review, and collection management.

### Exit outcomes

- An eligible artist can submit a complete listing without direct data edits.
- Incomplete or inapplicable artwork facts are rejected consistently.
- Public listing and artist status labels reflect maintained review state.

## Phase 3 — Cart, checkout, and payment

### Goal

Create a reliable purchase path with authoritative totals and inventory.

### Deliverables

- Persistent cart operations and clear availability changes.
- Server-calculated checkout totals, delivery information, and applicable promotions.
- Durable checkout, payment, order, and seller-allocation records.
- Order confirmation based on authoritative application state.
- Clear failure, expiry, abandonment, retry, and duplicate-request behavior.

### Exit outcomes

- Repeated purchase attempts produce at most one intended result.
- Scarce artwork cannot be sold beyond available inventory.
- Buyer, order, inventory, and financial records agree after a completed purchase.

## Phase 4 — Fulfillment and post-purchase

### Goal

Complete the marketplace transaction after purchase.

### Deliverables

- Seller-specific order acceptance and fulfillment.
- Shipment tracking and protected digital delivery.
- Cancellation, return, refund, and dispute experiences.
- Seller statements that explain sale amounts, deductions, adjustments, balance, and payout state.
- Buyer and artist notifications for meaningful order events.

### Exit outcomes

- Buyers, sellers, and operators see consistent order truth appropriate to their role.
- Cancellation and refund outcomes agree with inventory and seller records.
- Sellers can understand the disposition of each sale.

## Phase 5 — Trust and marketplace operations

### Goal

Back marketplace trust with defined rules, evidence, and manageable operations.

### Deliverables

- Purchase-eligible reviews and review moderation.
- Clear explanations for verification and authenticity-related states.
- Reporting, appeals, disputes, certificates, and marketplace case management.
- Reviewed marketplace, support, privacy, and seller policies.
- Auditable operational decisions.

### Exit outcomes

- Every public trust claim maps to a defined product rule and maintained state.
- Only eligible purchases receive purchase-verification treatment.
- Common marketplace cases can be handled through application workflows.

## Phase 6 — Discovery and experience quality

### Goal

Make maintained inventory discoverable and the application usable across devices and abilities.

### Deliverables

- Accurate search, filtering, sorting, pagination, and shareable URLs.
- Useful page metadata and public-content discovery support.
- Keyboard, screen-reader, contrast, focus, motion, touch, reflow, and zoom quality.
- Responsive images, stable layouts, and measurable performance budgets.
- Privacy-reviewed product measurement when approved.

### Exit outcomes

- Core buyer and artist journeys pass the approved accessibility matrix.
- Discovery results, counts, filters, and URLs remain consistent.
- Approved performance budgets pass on representative devices and networks.

## Phase 7 — Controlled release and learning

### Goal

Release with measurable marketplace quality and sustainable operational capacity.

### Deliverables

- A focused initial supply and geography strategy.
- Reviewed release, support, recovery, and escalation ownership.
- Observable marketplace, fulfillment, and trust outcomes.
- Growth work sequenced after core journey stability.

### Exit outcomes

- Release gates and responsible owners are approved.
- Support and operations can handle expected marketplace cases.
- Post-release decisions use observed product and trust outcomes.

## Dependency order

1. Reliable project baseline.
2. Durable identity and application data.
3. Accurate catalog and artist onboarding.
4. Authoritative purchase and inventory.
5. Fulfillment and post-purchase outcomes.
6. Trust operations and policies.
7. Discovery quality and controlled release.

Later phases may be designed earlier, but they must not bypass the foundations on which they depend.

Sensitive implementation constraints, provider-specific gates, security test requirements, deployment assumptions, and release-readiness dependencies are maintained in `sensitive context/build-plan.local.md` when that local file is present.
