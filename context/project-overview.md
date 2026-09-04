# Artistically — Project Overview

## Purpose

Artistically is a curated, multi-vendor marketplace dedicated to art. Independent painters, sculptors, ceramicists, digital artists, photographers, textile artists, woodworkers, glass artists, and other creators can present and sell their work. Collectors can discover, evaluate, purchase, and track artwork through one trusted platform.

The product should feel like a dependable commerce platform built specifically for art rather than a generic store with art products added to it.

## Problem It Solves

Artists commonly rely on fragmented channels such as social media, messaging applications, personal websites, galleries, and generic marketplaces. Those channels create recurring problems:

- Low buyer confidence in artist identity, authenticity, pricing, payment, and delivery.
- Limited tools for artists to manage listings, inventory, orders, fulfillment, and payouts.
- Poor art-specific product information, including medium, dimensions, edition, provenance, condition, and certificate details.
- Weak discovery because artwork is mixed with unrelated products or depends on social reach.
- Inconsistent policies for commissions, returns, damage, copyright, licensing, and disputes.

Artistically solves this by combining discovery, artist storytelling, verified marketplace trust, art-specific catalog data, protected payments, and reliable fulfillment workflows.

## Product Positioning

Artistically is not intended to win only by listing the largest number of products. Its central promise is:

> Discover and buy meaningful art from credible artists with clear provenance, protected payment, and dependable delivery.

For artists, the complementary promise is:

> Build a credible storefront, reach collectors, and manage sales without assembling multiple disconnected tools.

## Target Users

### Primary users

- Independent and emerging artists who want a professional sales channel.
- Established artists who want direct collector relationships outside galleries.
- First-time art buyers who need guidance and trust signals.
- Collectors who want curated discovery and reliable transaction history.

### Secondary users

- Interior designers and architects sourcing artwork for client projects.
- Gift buyers looking for distinctive original work.
- Curators and editorial staff assembling collections and stories.
- Artistically administrators handling verification, moderation, disputes, and marketplace operations.

## Core Pages

### Public marketplace

- Home: merchandising, categories, featured work, collections, artists, and editorial stories.
- Search and discovery: text search, categories, price, rating, medium, availability, and sorting.
- Product detail: artwork media, art-specific specifications, artist identity, authenticity, fulfillment, price, reviews, and related work.
- Artists index and artist profile: biography, verification, portfolio, story, policies, and available artwork.
- Collections index and collection detail: curated groups of artwork.
- Stories index and story detail: editorial content, artist profiles, techniques, and collecting education.
- Informational pages: about, contact, help, shipping and returns, terms, privacy, commissions, artist guidelines, partners, press, and careers.

### Collector account

- Authentication: registration, sign-in, sign-out, email verification, password recovery.
- Profile: contact information, delivery addresses, preferences, and account security.
- Wishlist.
- Cart and checkout.
- Orders and order detail.
- Shipment tracking, cancellation, returns, refunds, and disputes.
- Reviews for eligible delivered purchases.

### Artist workspace

- Artist onboarding and identity verification.
- Storefront profile and policies.
- Artwork creation, editing, publication, archival, and inventory.
- Image and digital-file management.
- Orders and fulfillment.
- Sales, fees, balance, payouts, refunds, and disputes.
- Reviews and basic performance analytics.

### Administration

- User, artist, listing, order, review, and story management.
- Artist verification and listing moderation queues.
- Copyright, authenticity, safety, and abuse reports.
- Refund and dispute operations.
- Marketplace configuration, commission rules, featured content, and audit history.

## Navigation Model

### Global navigation

- Logo returns to Home.
- Search is available from every marketplace page.
- Primary links: Artists, Collections, category navigation.
- Account, wishlist, and cart actions are persistent.
- Footer provides marketplace, company, support, artist, legal, and social links.

### Authenticated routing

- Collector account routes require a valid server session.
- Artist workspace routes require a valid session and an artist profile with sufficient status.
- Administrative routes require an administrator role and server-side authorization.
- Authorization is enforced in route handlers and services, never only in client components.

## Core User Flows

### Collector purchase flow

1. Discover artwork through home, search, artist profiles, or collections.
2. Review media, specifications, authenticity, price, availability, artist details, fulfillment, and returns.
3. Select a valid variant when the artwork supports variants.
4. Add the work to wishlist or cart.
5. Sign in or create an account when required.
6. Confirm delivery address, shipping method, taxes, discount, and final total.
7. Complete payment through Stripe.
8. Artistically confirms the order only from a verified payment event.
9. Seller accepts and fulfills the seller-specific portion of the order.
10. Buyer receives notifications and tracking updates.
11. After delivery, the buyer may review, request a return, or open a dispute according to policy.

### Artist selling flow

1. Create a user account and begin artist onboarding.
2. Complete identity, profile, policy, and Stripe Connect requirements.
3. Submit the artist profile for review when verification is required.
4. Create an artwork listing with accurate media, type, dimensions, materials, price, inventory, license, and fulfillment information.
5. Submit or publish the listing according to moderation rules.
6. Receive an order and fulfill it within the declared processing time.
7. Add shipment tracking or complete secure digital delivery.
8. Receive proceeds after platform fees, payment fees, refund exposure, and payout rules are applied.

### Trust and moderation flow

1. Artist or listing enters a review queue based on policy and risk signals.
2. An administrator reviews submitted identity, ownership, authenticity, and listing information.
3. The system records a decision, reviewer, reason, evidence references, and timestamp.
4. Public trust badges reflect a defined verification state, not an unqualified Boolean.
5. Reports, disputes, and policy violations create auditable cases with controlled status transitions.

## Data Architecture

- PostgreSQL is the system of record.
- Prisma defines database models and transactions.
- Next.js route handlers expose the initial REST API.
- Zod validates request input at API boundaries.
- React Query owns remote server state in the frontend.
- Zustand owns transient client-only UI state such as open panels, draft filters, and short-lived display preferences.
- Stripe is the authority for payment processing and connected-account payout events.
- An object-storage provider is the authority for uploaded artwork media and protected digital files.
- Webhook events are stored and processed idempotently before changing payment, order, refund, or payout state.

Detailed boundaries and invariants are in [architecture.md](./architecture.md).

## Features In Scope

### Initial production marketplace

- Real user authentication and account management.
- Artist onboarding and profile management.
- Physical and digital artwork listings with art-specific metadata.
- Search, filters, sorting, pagination, artist pages, and curated collections.
- Persistent cart and wishlist.
- Stripe payment and Stripe Connect seller onboarding.
- Order splitting by seller, fulfillment, shipment tracking, cancellation, and controlled refunds.
- Verified-purchase reviews.
- Artist verification and listing moderation.
- Essential admin operations.
- Complete legal, privacy, shipping, return, copyright, and seller policies.
- Transactional email and in-application status notifications.
- Responsive and accessible buyer and artist experiences.

### Roadmap after the trusted commerce foundation

- Moderated social discovery feeds.
- Buyer-artist messaging.
- Controlled auction mode.
- Optional AR/3D room previews that never replace accurate artwork facts.

## Features Out of Scope for the Initial Production Release

- NFTs or cryptocurrency trading.
- Fractional ownership and investment products.
- Native iOS or Android applications; the initial product is a mobile-friendly website.
- Full gallery inventory management or enterprise ERP functionality.
- Automated art valuation or investment-return predictions.
- International tax, customs, and payout support for every country at launch.
- Supporting both REST and GraphQL at the same time.

These may be reconsidered after the core marketplace demonstrates reliable supply, conversion, fulfillment, and repeat usage.

## Current Repository Status

The repository is a high-fidelity prototype with a partially implemented REST and Prisma backend.

Completed or partially completed:

- Marketplace page layouts and responsive styling.
- Static product, artist, collection, story, order, review, and tracking demonstrations.
- Prisma schema for basic users, artists, products, reviews, carts, wishlists, and orders.
- REST handlers for authentication, products, artists, users, reviews, carts, wishlists, and orders.
- Zod request schemas and service modules for products and orders.

Not yet connected or production-ready:

- Storefront data adapters return static arrays rather than calling REST routes.
- Frontend uses numeric IDs while Prisma uses string CUIDs.
- Login, profile, cart, wishlist, checkout, tracking, and artist workspace are local demonstrations.
- Stripe, seller payouts, uploads, email, moderation, admin tools, and verified fulfillment are absent.
- Type validation is disabled during builds and the standalone type check currently fails.
- Legal and support content remains placeholder content.

The phased remediation plan is maintained in [build-plan.md](./build-plan.md).

## Success Criteria

### Marketplace activation

- A verified artist can complete onboarding and publish an eligible artwork without staff editing database records.
- A collector can discover, purchase, track, receive, and review artwork through real persisted workflows.
- No order is marked paid without a verified Stripe event.
- Every seller receives an explainable statement of gross sales, fees, refunds, and payout status.

### Trust and quality

- Verification badges map to documented verification states.
- Reviews are linked to eligible delivered order items.
- Listings include required art-specific information for their artwork type.
- Buyers can find clear shipping, return, damage, authenticity, privacy, and dispute terms before purchase.
- Critical actions are auditable by actor, action, target, and timestamp.

### Engineering

- Type checking, linting, tests, migration validation, and production build pass in CI.
- No build setting suppresses TypeScript errors.
- Critical checkout, webhook, stock, refund, and authorization paths have automated integration coverage.
- Application errors and webhook failures are observable and alertable.

### Product metrics

- Artist onboarding completion rate.
- Time from artist approval to first published listing.
- Listing-to-cart and cart-to-paid-order conversion rates.
- Payment success rate and checkout abandonment rate.
- On-time fulfillment and successful delivery rates.
- Refund, damage, dispute, and chargeback rates.
- Time to first sale and repeat seller rate.
- Repeat buyer rate and verified review rate.
