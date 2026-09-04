# Artistically — Code Standards

## Engineering Mindset

- Optimize for correctness, trust, and maintainability before cleverness.
- Treat payments, authorization, inventory, refunds, verification, and payouts as high-risk domains.
- Make invalid states difficult to represent and impossible to persist through normal application paths.
- Keep business rules on the server and close to the domain operation they protect.
- Prefer small, explicit modules with observable inputs and outputs.
- Do not hide errors to make builds pass.
- Do not display success before the authoritative operation succeeds.
- Preserve existing user work and avoid unrelated refactors within feature changes.
- Every production feature includes its empty, loading, error, unauthorized, and retry behavior.

## TypeScript Rules

- Keep `strict: true` and run `tsc --noEmit` in CI.
- Do not use `ignoreBuildErrors` or equivalent suppression.
- Avoid `any`. Use `unknown` at untrusted boundaries and narrow it.
- Prefer discriminated unions for status-dependent state.
- Prefer `type` for unions and DTO compositions; use `interface` for stable extendable object contracts.
- Do not use TypeScript enums in client contracts. Prefer string literal unions or `as const` maps. Prisma enums may be mapped to public literals.
- Model IDs as opaque strings in public contracts. Never perform arithmetic on IDs.
- Use `satisfies` when validating object shape without widening literals.
- Use exhaustive `switch` checks with a `never` helper for domain states.
- Never assert a request body with `as SomeType`; parse it with Zod.
- Do not expose Prisma-generated model types as public API DTOs.
- Dates cross JSON boundaries as ISO 8601 strings and are parsed deliberately at use sites.
- Money uses a project Money type and authoritative integer-minor-unit or Decimal calculations.
- Optional and nullable mean different things: optional means omitted; nullable means explicitly no value.

## Naming Conventions

### General

- Variables and functions: `camelCase`.
- React components, classes, types, and Zod schemas: `PascalCase`.
- Constants that are truly immutable configuration: `UPPER_SNAKE_CASE`.
- Boolean names begin with `is`, `has`, `can`, `should`, or `did`.
- Event handlers begin with `handle`; callback props begin with `on`.
- Async operations use a verb and domain noun: `createCheckout`, `publishArtwork`, `cancelSellerOrder`.
- Avoid vague names such as `data`, `item`, `value`, `manager`, or `helper` when a domain name is available.

### Domain vocabulary

- Use `artwork` in product-facing language when referring to the creative work.
- Use `listing` for its marketplace sale representation.
- Use `product` only where retained by existing technical models or broad catalog utilities.
- Use `collector` for buyer-facing product language and `user` for general identity records.
- Use `artist` for the seller profile; do not equate a user role alone with completed artist onboarding.
- Distinguish `Order`, buyer-level order, from `SellerOrder`, artist-specific fulfillment group.

## File and Folder Naming

- React component files: `PascalCase.tsx`.
- Hooks: `useSomething.ts`.
- Utilities, services, repositories, schemas, and adapters: `kebab-case.ts` or established suffix form such as `order.service.ts`; use one convention consistently within a folder.
- Route-special files follow Next.js names: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- Tests mirror the target filename with `.test.ts`, `.test.tsx`, or `.spec.ts` for browser specifications.
- Avoid generic `utils.ts` files. Name the capability, such as `money.ts`, `pagination.ts`, or `stripe-signature.ts`.
- A feature folder contains only code owned by that feature. Shared code moves to `components/ui`, `lib`, or `types` only after genuine reuse.

## Import Rules

- Use the `@/` alias for cross-feature application imports.
- Use relative imports within a small local component or feature subtree.
- Order imports: platform/framework, third-party, project absolute, relative, type-only.
- Use `import type` for type-only dependencies.
- Client components must not import Prisma, server-only secrets, Node-only modules, or server services.
- Avoid barrel exports that create cycles or pull server modules into client bundles.

## Component Structure

A component should follow this order when applicable:

1. Imports.
2. Local types.
3. Static constants.
4. Pure local helpers.
5. Component definition.
6. Hooks and derived state.
7. Event handlers.
8. Early state returns.
9. Render.

Rules:

- Prefer server components unless browser state, effects, or browser APIs are required.
- Keep client boundaries small; do not mark an entire route client-only for one interactive control.
- Separate data orchestration from reusable presentation.
- Props are explicit and domain-named.
- Do not read the entire Zustand store when selecting a few fields.
- Do not copy query data into local state unless the user is editing a draft.
- Derive values during render or memoize only when measurement shows useful work reduction.
- Reusable components accept semantic variants, not arbitrary collections of styling flags.
- Interactive non-button elements are prohibited. Use native buttons and links.
- Icon-only controls require accessible names.
- Forms use actual `form`, `label`, input, submit, error summary, and field error semantics.

## React Query Rules

- Query keys are centralized per feature and contain every input that affects the response.
- Query functions call the typed API client; they do not import static application data.
- Mutations invalidate or update only affected keys.
- Do not duplicate authoritative server state in Zustand.
- Errors are normalized into project API error types.
- Sensitive queries are cleared or refetched when authentication identity changes.
- Prefetch only when navigation probability and payload size justify it.

## Zustand Rules

- Store only transient UI state or intentionally local drafts.
- Actions describe user intent rather than exposing unrestricted setters.
- Never store raw payment information, auth tokens, authoritative roles, order state, product price, inventory, or payout state.
- Persisted Zustand storage requires an explicit privacy and migration decision.

## Validation Rules

- Validate every untrusted boundary: request body, query string, route parameter, webhook payload, environment variable, file metadata, and third-party callback.
- Client validation improves feedback; server validation is authoritative.
- Zod schemas should reject unknown sensitive fields where over-posting creates risk.
- Cross-field business rules belong in schema refinements or domain services, depending on whether persistence state is required.
- Error messages shown to users must be actionable without revealing internal details.

## API Route Structure

Each REST route handler should perform these steps:

1. Resolve request ID and authenticated actor when required.
2. Parse route parameters, query parameters, and body with Zod.
3. Call one domain service operation.
4. Map the result to an explicit DTO.
5. Return a standardized success or failure envelope.

Example shape:

```ts
export const POST = withApiHandler(async (request, context) => {
  const actor = await requireUser(request);
  const params = ArtworkParamsSchema.parse(await context.params);
  const input = PublishArtworkSchema.parse(await request.json());
  const artwork = await artworkService.publish({ actor, params, input });

  return created(toArtworkDto(artwork));
});
```

Route handlers must not:

- Trust owner IDs, role, prices, totals, verification status, or payment state from the client.
- Contain long Prisma queries and multi-step business logic.
- Return raw caught error messages from internal exceptions.
- Catch all errors and convert programmer failures into misleading client validation errors.
- Change external financial state without idempotency.

## Service and Repository Rules

- Services use domain language and enforce authorization plus invariants.
- Repositories encapsulate reusable persistence operations, not business decisions.
- Transactions contain every database change required for one invariant-preserving operation.
- External network calls should generally not run inside long database transactions.
- Use guarded updates for state transitions and inventory.
- Return typed domain errors such as `NotFoundError`, `ForbiddenError`, `ConflictError`, and `InvalidStateError`.
- Store immutable snapshots when later catalog changes must not rewrite transaction history.

## Error Handling

- Expected domain failures use typed errors and stable public error codes.
- Unexpected failures are logged with request context and return a generic message.
- Never log passwords, tokens, cookie values, Stripe secrets, raw identity files, full payment data, or protected download URLs.
- Client error boundaries provide recovery actions and preserve safe user drafts where possible.
- Webhook failures remain retryable and observable.

## Testing Standards

- Unit tests cover pure money, state-transition, eligibility, and mapping logic.
- Integration tests cover database constraints, authorization, transactions, and route contracts.
- End-to-end tests cover the small set of critical user journeys.
- Payment tests include retries, duplicates, out-of-order events, and failure states.
- Tests use factories with explicit overrides rather than shared mutable fixture objects.
- Tests assert observable behavior and durable state, not private implementation details.
- A bug fix in a high-risk path includes a regression test.

## Comments and Documentation

- Comments explain intent, risk, or a non-obvious constraint.
- Do not narrate straightforward code.
- Public integration adapters and complex domain transitions include concise documentation.
- Architectural decisions that affect multiple features belong in `context/architecture.md` or a dedicated decision record.
- Update `progress-tracker.md` when a tracked milestone changes state.

## Definition of Done

A change is complete when:

- Requirements and negative cases are implemented.
- Types, lint, tests, and build pass without suppression.
- Authorization and input validation are server-enforced.
- Loading, empty, error, success, and responsive states are handled.
- Accessibility impact is checked.
- Analytics, logging, and audit behavior are added when relevant.
- Documentation, migrations, environment examples, and progress tracking are updated.

