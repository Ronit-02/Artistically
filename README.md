# Artistically

Artistically is an India-first marketplace for discovering and buying original art from independent artists. It gives collectors the information and trust signals they need to buy with confidence, while giving artists one place to present their work, manage sales, and build a credible storefront.

## Why Artistically

Buying art online is often fragmented across social media, messages, personal sites, and generic marketplaces. Important details such as medium, dimensions, provenance, fulfillment, and artist identity are easy to lose.

Artistically brings those pieces together. Artwork stays at the center of the experience, supported by clear listing facts, artist stories, protected commerce workflows, and accountable marketplace operations.

## What the application offers

### For collectors

- Discover artwork through search, categories, artist profiles, editorial collections, and stories.
- Compare art-specific details such as medium, materials, dimensions, edition, condition, framing, authenticity, and provenance.
- Save favorites, maintain a persistent cart, and receive server-calculated checkout totals.
- Follow orders through payment, fulfillment, shipment, digital delivery, cancellation, refund, and dispute states.
- Review eligible delivered purchases and see factual artist verification labels.

### For artists

- Build a public artist profile and submit identity verification for review.
- Create physical or digital artwork listings with owned media and structured artwork details.
- Organize artwork into artist-owned collections.
- Manage incoming orders, fulfillment, shipments, digital delivery, settlements, transfers, and payout records.
- See persisted sales, inventory, reviews, follower, and settlement information in one workspace.

### For marketplace operators

- Review artist verification and listing submissions.
- Handle reports, appeals, disputes, review moderation, refunds, and certificates of authenticity.
- Inspect payment reconciliation, audit history, evidence-retention policy, and late fulfillment.
- Monitor application liveness and database readiness through dedicated health endpoints.

## Current status

The repository contains a full-stack marketplace foundation with a Next.js application, REST route handlers, and PostgreSQL persistence through Prisma. Core catalog, account, artist, checkout, fulfillment, moderation, and administration workflows are implemented.

The tracked status summary is in [`context/progress-tracker.md`](./context/progress-tracker.md).

## Run locally

Requirements: Node.js 22.13 or later and PostgreSQL 16 or a compatible hosted PostgreSQL database.

```bash
npm ci
```

Copy `.env.example` to `.env.local`, replace the sample values, then prepare the database:

```bash
npx prisma migrate deploy
npm run db:seed
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). The seed command is blocked when `NODE_ENV=production`.

### Demo catalog

Photography is a separate, noncommercial inspiration gallery at `/photography`, linked beside Artists and Collections. Its 40 unique remote images, original titles, captions, topics, and source dimensions live in `src/data/photography.ts`. The gallery supports topic filters and a keyboard-accessible full-image viewer, with no product, pricing, cart, or purchase data. It does not add photography records to the marketplace seed.

`npm run db:seed` maintains ten fictional app artists, seven paintings, 24 digital artworks, 24 sculptures, 24 woodwork entries, 38 ceramics, 31 glasswork entries, and 46 textile artworks using user-supplied HTTPS cover URLs. Titles, app artist assignments, prices, discounts, descriptions, and specifications are original fictional catalog examples defined in `prisma/url-content.ts`, `prisma/digital-content.ts`, `prisma/sculpture-content.ts`, `prisma/woodwork-content.ts`, `prisma/ceramic-content.ts`, `prisma/glass-content.ts`, and `prisma/textile-content.ts`. Artwork covers use remote URLs; the six Browse by Category covers remain local in `public/category-covers/`.

Listings disclose their demo context and use the existing non-sale reference state. App artist assignments do not claim authorship of the external images. Remaining categories stay empty until new cover URLs are supplied; no reviews, orders, collections, or stories are generated.

## Repository documentation

The root README is intentionally product-focused. Detailed technical material lives in [`context/`](./context/project-overview.md):

- [`project-overview.md`](./context/project-overview.md) explains the product, users, and supported journeys.
- [`architecture.md`](./context/architecture.md) describes runtime boundaries and data flow.
- [`build-plan.md`](./context/build-plan.md) records delivery phases and dependencies.
- [`code-standards.md`](./context/code-standards.md) and [`library-docs.md`](./context/library-docs.md) define engineering rules.
- [`ui-tokens.md`](./context/ui-tokens.md), [`ui-rules.md`](./context/ui-rules.md), and [`ui-registry.md`](./context/ui-registry.md) document the design system.
- [`progress-tracker.md`](./context/progress-tracker.md) records the tracked milestone summary.

The `context/` folder is safe and useful to commit because it contains non-sensitive project documentation. Detailed security, provider, configuration, operations, and release-readiness information is kept locally and must be consulted explicitly when needed. Never commit `.env.local` or any real secret.

## Quality checks

```bash
npm run type-check
npm run lint
npm test
npm run db:validate
npm run build
```

`npm run check` runs the main quality gate. Database integration tests require an isolated `TEST_DATABASE_URL` and `RUN_DATABASE_TESTS=true` because their fixtures modify database rows.
