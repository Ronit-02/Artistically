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
4. If a local `sensitive context/` directory exists, read every file in it completely and treat it as confidential project baseline material. The directory is intentionally ignored and may be absent from a clean checkout.

Reading only selected context files, reading summaries instead of the complete files, or relying on prior-session memory does not satisfy this requirement.
Local companion files are not loaded automatically; agents must explicitly read them when they are present and accessible.

## Context Governance

Before creating or updating any project-context documentation, review the existing tracked `context/` files and any available local companion files completely. Decide whether the information is necessary, whether it is sensitive, and which file owns the topic before writing it.

### Tracked context

Add information to the tracked `context/` directory only when it is all of the following:

- Necessary for application development, maintenance, product decisions, or accurate progress tracking.
- Safe to retain in version control and share with everyone who can read the repository.
- Verified against the current repository or an approved decision.
- Durable enough to remain useful beyond the current task.
- Concise and placed in the context file that owns the topic.

Tracked context must contain necessary non-sensitive knowledge. Do not remove useful architecture, product, design, engineering, or tracking information merely because it is technical.

### Confidential material

Place necessary confidential project knowledge in the matching ignored local file, using a `.local.md` suffix. This includes, when necessary for development:

- Prior vulnerabilities, security findings, remediation decisions, and security-hardening constraints.
- Authentication, authorization, session, token, rate-limit, validation, sanitization, and protected-media implementation details.
- Internal endpoints, infrastructure topology, service/provider names, configuration requirements, and environment-variable requirements.
- Deployment assumptions, operational procedures, monitoring details, incident handling, and production-readiness gaps or unverified checks.
- Confidential architecture, data-model, payment, fulfillment, moderation, audit, privacy, or integration details.

Local confidential files must not contain live credentials, secret values, tokens, passwords, private keys, or connection strings. Store those only in approved secret-management systems or ignored environment files.

When a tracked context file needs to acknowledge omitted sensitive material, include only a short pointer to the matching local file; do not duplicate the sensitive detail in tracked documentation.

### File ownership

- `project-overview.md`: product purpose, users, scope, and user journeys.
- `architecture.md`: non-sensitive system direction, boundaries, data flow, and durable architectural contracts.
- `build-plan.md`: implementation phases, sequencing, dependencies, and acceptance gates appropriate for version control.
- `code-standards.md`: coding, naming, testing, and engineering conventions.
- `library-docs.md`: approved libraries, version-specific usage rules, and dependency guidance.
- `ui-tokens.md`: design tokens and visual foundations.
- `ui-rules.md`: interface behavior, accessibility, responsiveness, and content rules.
- `ui-registry.md`: reusable component inventory, ownership, and contracts.
- `progress-tracker.md`: current verified milestone and capability status, not a chronological work diary.
- Local `.local.md` files: necessary confidential counterparts organized by the same topic boundaries.

If necessary information does not belong in the file being edited, move or add it to the correct context file instead of leaving it out of place. Preserve its meaning, avoid duplication, and update cross-references when useful.

### Excluded context

Do not add information that is unnecessary for application development, maintenance, decisions, or tracking. In particular, avoid:

- Repeated explanations already owned by another context file.
- Raw command output, exhaustive session logs, or step-by-step work diaries.
- Stale snapshots, superseded plans, speculative ideas presented as decisions, or claims not verified against the repository.
- Source-code inventories or implementation narration that can be obtained more accurately by inspecting the repository.
- Excessive detail that does not change how future work should be designed, implemented, reviewed, or verified.

### Required review before writing

Before adding any context, confirm all of the following:

1. The information is necessary for future application work or tracking.
2. It is accurate and verified.
3. It is not already documented elsewhere.
4. The selected file owns the topic.
5. Sensitive and non-sensitive parts have been separated.
6. The wording is concise and avoids unnecessary history or repetition.
7. Any replaced or moved information remains available in its correct context location.

If these checks do not pass, revise, relocate, or omit the proposed context instead of appending it.

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
