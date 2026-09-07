# Artistically — Code Standards

## Purpose

These standards define the general, non-sensitive engineering practices used across Artistically. Security-sensitive implementation constraints and operational details belong in the ignored companion file `sensitive context/code-standards.local.md`.

## Engineering Mindset

- Prefer correctness, user trust, and maintainability over cleverness.
- Make invalid states difficult to represent.
- Keep business rules close to the domain operation that owns them.
- Favor small, explicit modules with observable inputs and outputs.
- Do not hide build, type, test, or runtime failures.
- Do not report success before the authoritative operation succeeds.
- Preserve unrelated work and avoid opportunistic refactoring.
- Treat loading, empty, error, unavailable, and retry behavior as part of a complete feature.

## TypeScript

- Keep strict TypeScript enabled and ensure `tsc --noEmit` remains clean.
- Do not suppress type errors to make a change pass.
- Avoid `any`; use `unknown` at untrusted boundaries and narrow it deliberately.
- Use discriminated unions for state with mutually exclusive variants.
- Use `type` for unions, mapped types, and aliases; use `interface` where declaration extension is useful.
- Prefer string-literal unions over TypeScript enums in client-facing contracts.
- Treat identifiers as opaque strings unless the domain requires otherwise.
- Use `satisfies` when validating an object shape while preserving inference.
- Make switches over closed unions exhaustive, using `never` for the unreachable case.
- Parse untrusted input with the established schema tools before using it.
- Do not expose generated persistence types directly as API data-transfer types.
- Represent dates crossing a JSON boundary as documented ISO strings.
- Use the project's money representation; do not use floating-point arithmetic for monetary values.
- Distinguish optional values from explicitly nullable values.

## Naming and Domain Language

- Use `camelCase` for variables, functions, and hooks.
- Use `PascalCase` for components, classes, and exported domain types.
- Use `UPPER_SNAKE_CASE` for true constants.
- Prefix booleans with words such as `is`, `has`, `can`, or `should`.
- Name event handlers for the event or intent, such as `handleSubmit` or `handleArtworkSelect`.
- Name asynchronous commands for their domain action rather than their transport mechanism.
- Avoid vague names such as `data`, `item`, `thing`, `manager`, or `helper` when a domain term is available.

Use the following product vocabulary consistently:

- **Artwork**: a creative work presented in the product.
- **Listing**: the sale-facing representation of an artwork.
- **Product**: use only where an existing technical or catalog abstraction requires it.
- **Collector**: the buyer-facing product identity.
- **Artist profile**: the creator-facing identity and public presence, not merely a permission label.

## Files and Folders

- Use `PascalCase` for component files when that matches the surrounding feature.
- Prefix reusable React hooks with `use`.
- Follow the established folder convention of the feature being changed.
- Preserve framework-reserved names for routes, layouts, loading states, and error states.
- Use the repository's existing test suffix and location conventions.
- Avoid catch-all files such as `utils.ts` when a focused module name is clearer.
- Promote code to a shared module only after there is a concrete reuse case.

## Imports

- Use the configured `@/` alias for cross-feature or project-root imports.
- Prefer relative imports for closely related files within one feature folder.
- Group imports consistently: framework and packages, project modules, then local modules.
- Use `import type` for type-only imports where it improves clarity and emitted output.
- Do not import server-only runtime modules or persistence code into client components.
- Avoid barrel exports that create cycles or obscure runtime boundaries.

## React and Component Organization

Prefer this order inside a component module when applicable:

1. Imports.
2. Local types.
3. Constants.
4. Pure helpers.
5. Component declaration.
6. Hooks and derived values.
7. Event handlers.
8. Early-return states.
9. Main render.

Additional rules:

- Use Server Components by default and introduce client boundaries only where browser behavior or client state requires them.
- Keep client components as small and focused as practical.
- Separate orchestration from presentation when a component becomes difficult to reason about.
- Keep component props explicit and domain-oriented.
- Select only the state a component needs.
- Do not copy query results into local state unless the local copy represents an intentional editable draft.
- Derive render values instead of synchronizing duplicated state.
- Express visual differences through established semantic variants and tokens.
- Follow `context/ui-rules.md`, `context/ui-tokens.md`, and `context/ui-registry.md` for detailed UI behavior and design-system rules.

## Validation

- Parse external input at the boundary where it enters the application.
- Use client-side validation for timely feedback, while treating server-side validation as authoritative.
- Put shape and cross-field validation in schemas; put rules that depend on stored state in the relevant service.
- Return actionable, user-safe validation messages.
- Reuse established validators rather than creating competing definitions.

## API Route Structure

Keep route handlers thin and predictable:

1. Establish request context.
2. Parse route parameters, query values, and body input.
3. Invoke one domain service operation.
4. Map the result to the public data-transfer shape.
5. Return the standardized response envelope.

Route handlers should not contain long persistence queries, duplicate multi-step business logic, expose raw exceptions, or use broad catch blocks that misclassify failures as validation errors.

## Services and Persistence

- Express services in domain language and keep domain invariants near the operation they govern.
- Keep persistence modules focused on reusable reads and writes rather than product decisions.
- Use a transaction when multiple database changes form one logical operation.
- Keep external network calls outside long-running database transactions unless an established workflow requires otherwise.
- Represent expected failures with typed domain errors, such as not found, forbidden, conflict, or invalid state.
- Preserve immutable snapshots when later edits must not rewrite historical records.

## Error Handling

- Model expected failures with stable typed errors or codes.
- Convert unexpected failures into a generic public error response.
- Provide appropriate error boundaries and recovery paths for user-facing experiences.
- Keep error messages useful without exposing implementation details.

## Testing

- Unit-test pure domain logic, validation, formatting, and mapping.
- Integration-test persistence constraints, transactions, service boundaries, and route behavior.
- Use end-to-end tests for critical user journeys.
- Prefer explicit factories or fixtures over large opaque setup helpers.
- Assert durable, observable outcomes rather than implementation details.
- Add a regression test when fixing a high-risk or previously recurring defect.

## Comments and Documentation

- Write comments to explain intent, risk, or a non-obvious constraint; do not narrate the code.
- Document complex state transitions and externally visible contracts.
- Record architectural decisions in the context file that owns the topic.
- Update `context/progress-tracker.md` only when verified project progress changes.
- Keep sensitive implementation and operational knowledge in the corresponding ignored file under `sensitive context/`.

## Definition of Done

A change is complete when, as applicable:

- The requested behavior and important negative cases are implemented.
- Type checking, linting, targeted tests, and the build pass.
- Loading, empty, error, unavailable, and retry states are handled.
- Responsive and accessibility behavior is verified for UI changes.
- Documentation, migrations, and progress tracking reflect verified reality.
- No unrelated files or contracts were changed.

