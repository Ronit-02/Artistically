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

The repository contains a working full-stack marketplace foundation with a Next.js application, REST route handlers, and PostgreSQL persistence through Prisma. Core catalog, account, artist, checkout, fulfillment, moderation, and administration workflows are implemented.

Production rollout still requires real deployment credentials and live verification for services such as PostgreSQL, Stripe and Stripe Connect, media storage, email delivery, and shipment callbacks. The current milestone status and known gaps are recorded in [`context/progress-tracker.md`](./context/progress-tracker.md).

## Run locally

Requirements: Node.js 22 and PostgreSQL 16 or a compatible hosted PostgreSQL database.

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

## Deployment model

This is one full-stack Next.js application. The browser UI and REST API ship in the same build, so the project does not need separate frontend and backend containers.

There is currently no application `Dockerfile` or Docker Compose file in the repository. You can deploy the Node.js application directly with:

```bash
npm ci
npx prisma migrate deploy
npm run build
npm start
```

Use `npm run dev` only for local development. A production host should run the built application with `npm start` and provide production environment variables through its secret manager.

PostgreSQL may run on the application host, on another private machine, in a container, or as a managed database. For a disposable local PostgreSQL 16 container:

```bash
docker run --name artistically-postgres -e POSTGRES_USER=artistically -e POSTGRES_PASSWORD=change-me -e POSTGRES_DB=artistically -p 5432:5432 -v artistically-postgres-data:/var/lib/postgresql/data -d postgres:16
```

Set `DATABASE_URL` to the database host that the application machine can reach, then run `npx prisma migrate deploy`. Do not expose PostgreSQL port 5432 to the public internet. Prefer a private network, TLS, restricted database users, backups, and a managed PostgreSQL service for production.

## Repository documentation

The root README is intentionally product-focused. Detailed technical material lives in [`context/`](./context/project-overview.md):

- [`project-overview.md`](./context/project-overview.md) explains the product, users, and supported journeys.
- [`architecture.md`](./context/architecture.md) describes runtime boundaries and data flow.
- [`build-plan.md`](./context/build-plan.md) records delivery phases and dependencies.
- [`code-standards.md`](./context/code-standards.md) and [`library-docs.md`](./context/library-docs.md) define engineering rules.
- [`ui-tokens.md`](./context/ui-tokens.md), [`ui-rules.md`](./context/ui-rules.md), and [`ui-registry.md`](./context/ui-registry.md) document the design system.
- [`progress-tracker.md`](./context/progress-tracker.md) records completed work, verification, and open deployment tasks.

The `context/` folder is safe and useful to commit because it contains project documentation rather than credentials. Review it before making the repository public if roadmap, operational, or architecture details are commercially sensitive. Never commit `.env.local` or any real secret.

## Quality checks

```bash
npm run type-check
npm run lint
npm test
npm run db:validate
npm run build
```

`npm run check` runs the main quality gate. Database integration tests require an isolated `TEST_DATABASE_URL` and `RUN_DATABASE_TESTS=true` because their fixtures modify database rows.
