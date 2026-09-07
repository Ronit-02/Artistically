# Artistically — Architecture

## Architectural direction

Artistically uses a modular monolith for the initial application. The web interface, REST API, domain logic, and persistence access ship together while remaining separated by explicit internal boundaries.

This keeps development and transactions straightforward without preventing individual boundaries from becoming independent services if future scale or ownership requires it.

## Technology baseline

- Language: TypeScript in strict mode.
- Web framework: Next.js App Router.
- Interface: React and Tailwind CSS with project-owned reusable components.
- Remote state: TanStack React Query.
- Client UI state: Zustand.
- Validation: Zod at application boundaries.
- Application API: REST.
- Persistence: a relational database accessed through an ORM and committed migrations.
- External capabilities: project-owned adapters for payments, media, messaging, and fulfillment events.
- Verification: unit, integration, and browser-level coverage appropriate to risk.

Concrete providers, infrastructure assumptions, and protected integration behavior are documented in the ignored local architecture companion.

## System boundaries

### Web presentation

Owns routing, rendering, interaction, accessibility, SEO, forms, and display formatting. It consumes public application contracts rather than persistence records.

### API

Owns HTTP request parsing, boundary validation, response contracts, and translation between transport concerns and domain operations. Route handlers stay thin: parse, invoke one operation, and map the result.

### Domain services

Own business rules, state transitions, and transaction orchestration. Services receive the acting user context explicitly when an operation depends on identity.

### Persistence

Owns database reads and writes through the established ORM and narrow query/service modules. Multi-record operations use transactions when they represent one logical state change.

### External integrations

Project-owned adapters isolate third-party SDKs and network contracts from domain logic.

### Operations

Administrative and marketplace operations use explicit application workflows rather than direct edits to persisted data.

## Request data flow

### Read flow

1. A server-rendered component or remote-state hook requests a REST resource.
2. The route parses request parameters through the shared validation boundary.
3. The route invokes a domain service or focused read operation.
4. Persistence access selects and paginates the required records.
5. Records are mapped to an explicit public DTO.
6. Remote-state tooling caches the DTO with a stable query key.
7. Components render loading, success, empty, and error states.

### Mutation flow

1. The interface validates immediate user feedback with a shared compatible contract.
2. The browser sends only mutable input fields.
3. The route resolves the acting user when required and validates the request again.
4. A domain service applies business rules and commits the state change.
5. The API returns an explicit DTO or status response.
6. Remote-state caches update or invalidate the affected keys.

Detailed payment, media, authorization, and callback flows are maintained in the ignored local architecture companion.

## Server and client state ownership

### Remote server state

Remote-state queries own persisted marketplace and account data, along with mutation status and cache invalidation.

### Local interface state

Zustand owns transient display coordination such as navigation visibility, drawers, unsaved filter drafts, and non-sensitive display preferences.

Local interface state must not replace durable server state for identity, permissions, catalog availability, commerce, or operational outcomes.

## Public API contract

JSON endpoints use a predictable envelope:

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

Paginated endpoints return cursor or page metadata as appropriate. Prefer cursor pagination for frequently changing feeds and page pagination where stable totals are useful.

Public DTOs expose only the fields required by their consumers and never return persistence records directly.

## Money representation

Authoritative currency values use integer minor units or a database decimal strategy with explicit currency handling. Public contracts use a money object:

```ts
type Money = {
  amountMinor: number;
  currency: "INR";
};
```

Authoritative totals must not use JavaScript floating-point arithmetic.

## Documentation boundaries

- This file contains the architecture required for ordinary application development.
- Sensitive provider, security, authorization, data-model, payment, media, observability, and operational details live in `sensitive context/architecture.local.md` when that local file is present.
- Delivery state and incomplete work belong in `progress-tracker.md` rather than architecture documentation.
- Library-specific rules belong in `library-docs.md`; coding and folder conventions belong in `code-standards.md`.
- The repository itself is the source of truth for the current folder structure.
