# Artistically — Library and Third-Party API Rules

## General Policy

- Use the smallest library set that materially improves correctness or delivery speed.
- Verify version-specific behavior against official documentation before adopting new APIs.
- Prefer project-owned adapters around third-party SDKs.
- Do not import server-only SDKs into client components.
- Pin or deliberately range versions and review major upgrades separately.
- Every added dependency requires a purpose, ownership location, security review, and removal path.
- Environment variables are validated centrally and documented in `.env.example` without secrets.
- Vendor errors are translated into stable project errors at the integration boundary.

## Next.js

- Use the App Router.
- Prefer server components for data-dependent pages and SEO-visible content.
- Add `"use client"` only to the smallest component requiring effects, browser APIs, or client state.
- Use route handlers for REST endpoints and webhooks.
- Treat route handlers as public boundaries with validation, authorization, and stable DTOs.
- Use Next.js metadata APIs for product, artist, collection, and story metadata.
- Use `next/image` with accurate `sizes`, stable dimensions, and `priority` only for genuine above-the-fold images.
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` at appropriate route boundaries.
- Do not disable TypeScript validation during builds.
- Do not depend on undocumented framework internals.

## React

- Use React Server Components by default in the App Router.
- Effects synchronize with external systems; they do not replace derived render logic.
- State is colocated at the lowest owner that needs it.
- Avoid context providers for rapidly changing or feature-local state.
- Keep render functions pure.
- Use stable identifiers from domain data for keys.
- Do not use array indexes as keys for mutable collections.

## TanStack React Query

- Use React Query for remote asynchronous state.
- Centralize query-key factories by feature.
- Include filters, pagination, sort, locale, and identity-sensitive inputs in keys.
- Normalize API failures in the fetch client.
- Mutations update or invalidate the smallest correct cache scope.
- Configure retry by operation: safe reads may retry; financial mutations require explicit idempotent design before retry.
- Do not cache protected user data across identity changes.
- Server rendering and hydration should use a per-request QueryClient on the server and a stable browser client.
- React Query Devtools must remain development-only.

## Zustand

- Use for transient client-only UI coordination.
- Use selectors to minimize subscriptions.
- Actions are named domain or UI intents.
- Do not store server authority such as session role, cart total, order status, inventory, or payment result.
- Avoid persistence unless privacy, expiry, and migration behavior are documented.
- Reset identity-sensitive UI drafts on logout when required.

## Prisma

- `schema.prisma` and committed migrations define database history.
- Generate Prisma Client during install/build workflows in a controlled step.
- Never use `db push` as the production migration strategy.
- Use explicit `select` for public data paths.
- Use transactions for invariant-preserving multi-record changes.
- Avoid unbounded `findMany` calls in public endpoints.
- Add indexes based on actual filter, join, sort, and uniqueness requirements.
- Map Prisma records to DTOs rather than returning them directly.
- Treat Prisma error codes in a centralized error mapper.
- Seed scripts are deterministic and repeatable.
- Money is not stored in `Float` columns.

## Zod

- Parse all external input including environment variables.
- Export inferred input and output types from schemas when useful.
- Use coercion only for known string boundaries such as query parameters.
- Reject or strip unknown fields deliberately; use strict objects for sensitive mutations.
- Defaults must be reflected correctly in input versus parsed output typing.
- Format validation does not replace domain or database validation.
- Do not expose raw Zod internals as the long-term public error contract.

## React Hook Form

- Use React Hook Form for non-trivial interactive forms after it is installed.
- Integrate Zod through the official resolver package.
- Use uncontrolled fields by default and `Controller` only for components that require it.
- Keep server validation authoritative and map field errors back into the form.
- Preserve drafts through recoverable errors.
- Use native submit behavior and disable duplicate submission while pending.

## Tailwind CSS

- Use semantic project components and documented tokens rather than repeated raw utility strings for shared patterns.
- Keep responsive behavior close to the component.
- Avoid arbitrary values when a token exists.
- Extract a component when a visual and behavioral pattern repeats, not only to shorten class strings.
- Do not construct dynamic class names that Tailwind cannot statically detect.
- Maintain visible focus, reduced-motion, and contrast behavior.

## Shadcn-Style Components

- Shadcn is a source pattern, not a runtime design authority.
- Add only components the product uses.
- Adapt imported components to Artistically tokens, accessibility rules, and API conventions.
- Keep component ownership in the repository.
- Do not mix several competing primitive systems for dialogs, menus, and form controls without a migration plan.
- Record reusable components in [ui-registry.md](./ui-registry.md).

## Stripe and Stripe Connect

- Use official server SDKs on the server only.
- Keep secret keys out of `NEXT_PUBLIC_` variables and browser bundles.
- Use Stripe.js or supported Elements components for browser payment collection.
- Never send raw card data through Artistically servers.
- Calculate price, currency, commission, and order references server-side.
- Use idempotency keys for creation and mutation calls that may be retried.
- Verify webhook signatures using the raw request body.
- Persist each Stripe event ID before or during idempotent processing.
- Handle duplicate and out-of-order events.
- Treat webhooks as authority for asynchronous payment, refund, dispute, connected-account, and payout state.
- Store Stripe IDs and normalized state, not entire unbounded provider payloads in primary domain tables.
- Use Stripe test mode and official test clocks or test helpers for lifecycle coverage.
- Marketplace payments require a documented Connect charge and transfer model before implementation.

## Authentication and Cryptography

- Use a reviewed session or token strategy with revocation requirements documented.
- Passwords use a current password-hashing algorithm and calibrated work factor.
- Production startup fails when secrets are absent or weak.
- Browser authentication uses secure, HTTP-only cookies.
- Do not return the same browser session token to JavaScript without an approved use case.
- Normalize email before identity lookup.
- Add rate limits and generic credential-failure responses.
- Password reset tokens are single-use, short-lived, hashed at rest, and invalidate relevant sessions when policy requires.

## Object Storage and Image Providers

- Use signed direct uploads with short expiration.
- Validate declared and detected MIME type, byte size, image dimensions, file count, and owner.
- Generate provider keys server-side; do not accept arbitrary destination paths.
- Store provider key and metadata separately from public delivery URL.
- Strip unsafe metadata when policy requires it.
- Use transformations for thumbnails while preserving an authorized original.
- Protected digital artwork files require private storage and expiring authorized downloads.
- Deletion is coordinated with database references and retention rules.

## Email Provider

- Send transactional email through a project adapter.
- Templates use stable event data and absolute URLs.
- Email sending occurs after durable state changes.
- Retried sends use an idempotent message key where duplicate mail is harmful.
- Bounce and complaint events update deliverability state.
- Do not place sensitive identity or full payment information in email.

## Analytics and Error Monitoring

- Define an event registry with owner, trigger, properties, and privacy classification.
- Never send passwords, tokens, full addresses, protected file URLs, or raw payment data.
- User identifiers are pseudonymous where possible.
- Error reports redact headers, cookies, request bodies, and vendor secrets.
- Marketplace funnel events represent durable milestones, such as `order_payment_confirmed`, rather than optimistic button clicks when measuring business outcomes.

## Shipping Providers

- Integrate through an adapter with normalized shipment and event statuses.
- Verify callback signatures when supported.
- Store provider event IDs idempotently.
- Tracking links are built from trusted provider data.
- Provider delivery status does not automatically override a dispute or return decision without domain rules.

## Dependency Review Checklist

Before adding a package, confirm:

- The feature cannot be implemented more safely with an existing dependency or platform API.
- License is acceptable.
- Package is maintained and compatible with current React and Next.js versions.
- Server/client bundle impact is understood.
- It does not require broad permissions or unsafe post-install behavior.
- Official documentation supports the intended API.
- Test and upgrade ownership is assigned.
- The adapter or import location is defined.

