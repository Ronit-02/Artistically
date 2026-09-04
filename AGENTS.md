# Artistically Agent Instructions

These instructions apply to every agent and every development task in this repository.

## Mandatory Reading Before Work

Before analyzing, planning, editing, generating code, or running development actions, every agent must:

1. Read this `AGENTS.md` file completely.
2. Read every file in the root `context/` directory completely, including:
   - `context/project-overview.md`
   - `context/architecture.md`
   - `context/build-plan.md`
   - `context/code-standards.md`
   - `context/ui-tokens.md`
   - `context/ui-rules.md`
   - `context/library-docs.md`
   - `context/ui-registry.md`
   - `context/progress-tracker.md`
3. Treat the context documents as the project baseline and reconcile the requested work with the current progress recorded there.

Reading only selected context files, reading summaries instead of the complete files, or relying on prior-session memory does not satisfy this requirement.

## Audit Before Code Changes

Work strictly on top of the existing project.

Before making any code change, first audit the current frontend and backend and report to the user:

- Existing UI components.
- Existing layout structure.
- Existing typography and color system.
- Existing interaction patterns.
- Existing routes and pages.
- Existing APIs.
- Existing database schemas and migrations.
- Existing services and business logic.
- Existing client and server data flow.
- The exact files that would need to change for the requested feature.

Do not begin implementation until this audit and file-impact report have been provided.

## Preservation Rules

Preserve the existing:

- Design system.
- Page structure.
- Components and component APIs.
- Folder structure.
- Navigation structure.
- Typography.
- Colors.
- Card and surface styles.
- Interaction conventions.
- Routes and API contracts.
- Database schemas and migrations.
- Services.
- Business logic.

Do not redesign pages, replace components, alter typography, alter colors, change card styles, restructure navigation, rename files, move files, refactor architecture, replace APIs, or change database models merely for consistency or improvement.

This preservation rule applies equally to frontend and backend work.

## Smallest Additive Change

- Implement the smallest additive change that satisfies the request.
- Reuse existing components, hooks, services, validators, response helpers, tokens, and conventions first.
- Avoid unrelated cleanup, modernization, abstraction, or refactoring.
- Do not expand scope based on inferred improvements.
- Preserve unrelated existing and uncommitted work.

## Approval Required for Structural Changes

If the requested feature cannot be completed without modifying an existing structure, stop before implementation and show the user:

1. The current behavior or structure.
2. The proposed behavior or structure.
3. The exact files and contracts affected.
4. The reason the structural change is necessary.
5. The compatibility, migration, and regression impact.

Wait for explicit user approval before making that structural change.

Structural changes include, but are not limited to:

- Replacing or materially changing an existing shared component.
- Changing an existing component API used by other pages.
- Moving or renaming files or folders.
- Changing navigation or route structure.
- Changing an API path, request contract, response contract, or authorization behavior.
- Changing a Prisma model, enum, relation, constraint, or migration history.
- Replacing a service, state-management pattern, data-fetching pattern, or integration boundary.
- Changing global tokens, typography, colors, spacing, radii, shadows, or shared interaction behavior.

No structural change may be justified solely by preference, consistency, elegance, or perceived architectural improvement.

## Implementation and Verification

When implementation is approved and in scope:

- Follow `context/code-standards.md` and `context/library-docs.md`.
- Follow `context/ui-tokens.md`, `context/ui-rules.md`, and `context/ui-registry.md` for frontend work.
- Preserve documented system boundaries and invariants from `context/architecture.md`.
- Follow the sequencing and phase gates in `context/build-plan.md`.
- Update `context/progress-tracker.md` when verified project progress changes.
- Verify the change in proportion to its risk using the existing quality commands and relevant targeted tests.
- Report what changed, what was verified, and any remaining limitation without claiming unimplemented behavior.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
